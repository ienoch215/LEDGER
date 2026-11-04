export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SavingType = 'gold' | 'stocks' | 'bonds' | 'crypto';
export type EntryKind = 'spending' | 'saving';

export interface MonthRow {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-01
  salary: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface EntryRow {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  kind: EntryKind;
  category_id: string | null;
  saving_type: SavingType | null;
  amount: number;
  memo: string | null;
  client_request_id: string;
  created_at: string;
  updated_at: string;
}

export interface EntryWithCategory extends EntryRow {
  category?: CategoryRow | null;
}

export interface MonthSummaryRow {
  user_id: string;
  month: string; // YYYY-MM-01
  month_id: string | null;
  salary: number | null;
  total_spent: number;
  total_saved: number;
  remaining: number | null;
  total_entries_count: number;
  spending_entries_count: number;
  saving_entries_count: number;
  saved_stocks: number;
  saved_gold: number;
  saved_bonds: number;
  saved_crypto: number;
  salary_created_at: string | null;
  salary_updated_at: string | null;
}
