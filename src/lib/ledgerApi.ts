import { supabase } from '@/lib/supabase';
import {
  MonthSummaryRow,
  MonthRow,
  EntryRow,
  EntryWithCategory,
  CategoryRow,
  EntryKind,
  SavingType,
} from '@/types/database';
import { getNextMonthStart } from './dates';

/**
 * API layer for Ledger backend operations
 */

export async function fetchMonthSummary(monthStr: string): Promise<MonthSummaryRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('month_summary')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', monthStr)
    .maybeSingle();

  if (error) {
    console.error('Error fetching month summary:', error);
    throw error;
  }

  return data as MonthSummaryRow | null;
}

export async function fetchAllUserMonths(): Promise<MonthRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('user_id', user.id)
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching all months:', error);
    throw error;
  }

  return (data || []) as MonthRow[];
}

export async function fetchMonthSalary(monthStr: string): Promise<MonthRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', monthStr)
    .maybeSingle();

  if (error) {
    console.error('Error fetching month salary:', error);
    return null;
  }

  return data as MonthRow | null;
}

export async function fetchMostRecentEarlierMonthSalary(
  currentMonthStr: string
): Promise<{ month: string; salary: number } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('months')
    .select('month, salary')
    .eq('user_id', user.id)
    .lt('month', currentMonthStr)
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    month: data.month,
    salary: Number(data.salary),
  };
}

export async function saveMonthSalary(monthStr: string, salary: number): Promise<MonthRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  if (salary <= 0) {
    throw new Error('Salary must be greater than zero');
  }

  const existing = await fetchMonthSalary(monthStr);

  if (existing) {
    const { data, error } = await supabase
      .from('months')
      .update({ salary })
      .eq('id', existing.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as MonthRow;
  } else {
    const { data, error } = await supabase
      .from('months')
      .insert({
        user_id: user.id,
        month: monthStr,
        salary,
      })
      .select()
      .single();

    if (error) throw error;
    return data as MonthRow;
  }
}

/**
 * Fetch all entries for a specific month (with joined category)
 */
export async function fetchMonthEntries(
  monthStr: string,
  kindFilter: 'all' | 'spending' | 'saving' = 'all'
): Promise<EntryWithCategory[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const nextMonthStr = getNextMonthStart(monthStr);

  let query = supabase
    .from('entries')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .gte('entry_date', monthStr)
    .lt('entry_date', nextMonthStr)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (kindFilter !== 'all') {
    query = query.eq('kind', kindFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching month entries:', error);
    throw error;
  }

  return (data || []) as EntryWithCategory[];
}

/**
 * Fetch user's spending categories
 */
export async function fetchUserCategories(): Promise<CategoryRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data || []) as CategoryRow[];
}

/**
 * Create a new user spending category
 */
export async function createCategory(name: string): Promise<CategoryRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const trimmed = name.trim();
  if (!trimmed) throw new Error('Category name cannot be empty');

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name: trimmed,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A category with this name already exists.');
    }
    throw error;
  }

  return data as CategoryRow;
}

export interface CreateEntryParams {
  entry_date: string;
  kind: EntryKind;
  category_id?: string | null;
  saving_type?: SavingType | null;
  amount: number;
  memo?: string | null;
}

/**
 * Create a new entry with double-submission idempotency protection
 */
export async function createEntry(params: CreateEntryParams): Promise<EntryRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  if (params.amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  if (params.kind === 'spending' && !params.category_id) {
    throw new Error('Please select a spending category.');
  }

  if (params.kind === 'saving' && !params.saving_type) {
    throw new Error('Please select a saving asset type.');
  }

  const client_request_id = crypto.randomUUID();

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: user.id,
      entry_date: params.entry_date,
      kind: params.kind,
      category_id: params.kind === 'spending' ? params.category_id : null,
      saving_type: params.kind === 'saving' ? params.saving_type : null,
      amount: params.amount,
      memo: params.memo ? params.memo.trim().substring(0, 120) : null,
      client_request_id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as EntryRow;
}

export interface UpdateEntryParams {
  id: string;
  entry_date: string;
  kind: EntryKind;
  category_id?: string | null;
  saving_type?: SavingType | null;
  amount: number;
  memo?: string | null;
  expected_updated_at: string; // for concurrency check
}

/**
 * Update an entry with concurrency conflict check
 */
export async function updateEntry(params: UpdateEntryParams): Promise<EntryRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  if (params.amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  // Check concurrency: ensure record hasn't been updated elsewhere
  const { data: existing, error: checkError } = await supabase
    .from('entries')
    .select('updated_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (checkError || !existing) {
    throw new Error('The entry no longer exists or could not be found.');
  }

  if (existing.updated_at !== params.expected_updated_at) {
    throw new Error('CONCURRENCY_CONFLICT: This entry was modified in another session. Please reload to see the latest changes.');
  }

  const { data, error } = await supabase
    .from('entries')
    .update({
      entry_date: params.entry_date,
      kind: params.kind,
      category_id: params.kind === 'spending' ? params.category_id : null,
      saving_type: params.kind === 'saving' ? params.saving_type : null,
      amount: params.amount,
      memo: params.memo ? params.memo.trim().substring(0, 120) : null,
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as EntryRow;
}

/**
 * Delete an entry
 */
export async function deleteEntry(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}
