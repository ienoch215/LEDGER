import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  EntryKind,
  SavingType,
  CategoryRow,
  EntryWithCategory,
} from '@/types/database';
import { formatRupees, rupeesToPaise, paiseToRupees } from '@/lib/money';
import { getTodayIST, isFutureDateIST } from '@/lib/dates';
import { calculateSignal } from '@/lib/signal';
import {
  fetchUserCategories,
  createCategory,
  createEntry,
  updateEntry,
} from '@/lib/ledgerApi';

interface RecordEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSalary: number;
  currentRemaining: number;
  entryToEdit?: EntryWithCategory | null;
  onEntrySaved: () => void;
  onConcurrencyError?: () => void;
}

const SAVING_TYPES: { key: SavingType; label: string }[] = [
  { key: 'stocks', label: 'Stocks' },
  { key: 'gold', label: 'Gold' },
  { key: 'bonds', label: 'Bonds' },
  { key: 'crypto', label: 'Crypto' },
];

export const RecordEntryDrawer: React.FC<RecordEntryDrawerProps> = ({
  isOpen,
  onClose,
  currentSalary,
  currentRemaining,
  entryToEdit,
  onEntrySaved,
  onConcurrencyError,
}) => {
  const isEditMode = Boolean(entryToEdit);

  // Form states
  const [kind, setKind] = useState<EntryKind>('spending');
  const [amountInput, setAmountInput] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [savingType, setSavingType] = useState<SavingType>('stocks');
  const [entryDate, setEntryDate] = useState<string>(getTodayIST());
  const [memo, setMemo] = useState<string>('');

  // Categories list & inline add category
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load categories and prefill when opening
  useEffect(() => {
    if (!isOpen) return;

    fetchUserCategories().then((cats) => {
      setCategories(cats);
    });

    setErrorMessage(null);
    setShowAddCategory(false);
    setNewCategoryName('');

    if (entryToEdit) {
      setKind(entryToEdit.kind);
      setAmountInput(entryToEdit.amount.toString());
      setCategoryId(entryToEdit.category_id || '');
      setSavingType(entryToEdit.saving_type || 'stocks');
      setEntryDate(entryToEdit.entry_date);
      setMemo(entryToEdit.memo || '');
    } else {
      setKind('spending');
      setAmountInput('');
      setCategoryId('');
      setSavingType('stocks');
      setEntryDate(getTodayIST());
      setMemo('');
    }
  }, [isOpen, entryToEdit]);

  // Set default category once categories load if in spending mode
  useEffect(() => {
    if (kind === 'spending' && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [kind, categoryId, categories]);

  if (!isOpen) return null;

  // Impact Simulation calculations
  const parsedNewAmountPaise = rupeesToPaise(amountInput);
  const parsedNewAmount = paiseToRupees(parsedNewAmountPaise);

  let simulatedDelta = parsedNewAmount;
  if (isEditMode && entryToEdit) {
    const oldAmountPaise = rupeesToPaise(entryToEdit.amount);
    const oldAmount = paiseToRupees(oldAmountPaise);
    simulatedDelta = parsedNewAmount - oldAmount;
  }

  const simulatedNewRemaining = currentRemaining - simulatedDelta;
  const simulatedSignal = currentSalary > 0
    ? calculateSignal(simulatedNewRemaining, currentSalary)
    : null;

  const isBelowZero = simulatedNewRemaining < 0;

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    setErrorMessage(null);
    try {
      const created = await createCategory(newCategoryName);
      setCategories((prev) => [...prev, created]);
      setCategoryId(created.id);
      setShowAddCategory(false);
      setNewCategoryName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add category';
      setErrorMessage(msg);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (parsedNewAmountPaise <= 0 || isNaN(parsedNewAmountPaise)) {
      setErrorMessage('Debit amount must be greater than ₹0.00.');
      return;
    }

    if (isFutureDateIST(entryDate)) {
      setErrorMessage('Transaction date cannot be in the future.');
      return;
    }

    if (kind === 'spending' && !categoryId) {
      setErrorMessage('Please select or add a spending category.');
      return;
    }

    if (kind === 'saving' && !savingType) {
      setErrorMessage('Please select a saving asset type.');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && entryToEdit) {
        await updateEntry({
          id: entryToEdit.id,
          entry_date: entryDate,
          kind,
          category_id: kind === 'spending' ? categoryId : null,
          saving_type: kind === 'saving' ? savingType : null,
          amount: parsedNewAmount,
          memo: memo.trim() || null,
          expected_updated_at: entryToEdit.updated_at,
        });
      } else {
        await createEntry({
          entry_date: entryDate,
          kind,
          category_id: kind === 'spending' ? categoryId : null,
          saving_type: kind === 'saving' ? savingType : null,
          amount: parsedNewAmount,
          memo: memo.trim() || null,
        });
      }

      onEntrySaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Not saved';
      if (msg.includes('CONCURRENCY_CONFLICT')) {
        setErrorMessage('This entry was modified in another session. Please reload it.');
        if (onConcurrencyError) onConcurrencyError();
      } else {
        setErrorMessage(`Not saved: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0e1014] border-l border-[#e2e4e8] dark:border-[#23262d] h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#e2e4e8] dark:border-[#23262d] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0e1014]/95 backdrop-blur z-20">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-black dark:text-white uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
            <span>{isEditMode ? 'Edit Entry' : 'Record Entry'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#667085] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-[#fef2f2] dark:bg-[#251517] border border-[#fecaca] dark:border-[#482025] rounded-lg text-xs text-[#b91c1c] dark:text-[#f59e9e] flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#ef4444] dark:text-[#f87171]" />
                <span className="font-mono">{errorMessage}</span>
              </div>
            )}

            {/* 1. ENTRY KIND TOGGLE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] font-bold">
                  Entry Kind
                </label>
              </div>
              <div className="grid grid-cols-2 p-1 bg-[#f2f4f7] dark:bg-[#15171d] border border-[#e4e7ec] dark:border-[#272a33] rounded-lg">
                <button
                  type="button"
                  onClick={() => setKind('spending')}
                  className={`py-2 text-xs font-mono transition-colors rounded cursor-pointer ${
                    kind === 'spending'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                      : 'text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white'
                  }`}
                >
                  [ Spending ]
                </button>
                <button
                  type="button"
                  onClick={() => setKind('saving')}
                  className={`py-2 text-xs font-mono transition-colors rounded cursor-pointer ${
                    kind === 'saving'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                      : 'text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white'
                  }`}
                >
                  [ Saving ]
                </button>
              </div>
              <p className="text-[11px] text-[#667085] dark:text-[#737987] mt-1.5 font-mono">
                Both spending and savings reduce your remaining spendable balance.
              </p>
            </div>

            {/* 2. DEBIT AMOUNT */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] font-bold">
                  Debit Amount
                </label>
                <span className="text-[11px] font-mono text-[#667085] dark:text-[#5f6575]">
                  INR (₹)
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-base font-mono text-[#667085] dark:text-[#8c92a0]">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="8,450.00"
                  autoFocus
                  required
                  className="w-full bg-[#f8f9fa] dark:bg-[#15171d] border border-[#d0d5dd] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg pl-8 pr-4 py-2.5 text-base text-black dark:text-white placeholder-[#98a2b3] dark:placeholder-[#505664] font-mono transition-colors font-semibold"
                />
              </div>
              <p className="text-[11px] text-[#667085] dark:text-[#737987] mt-1.5 font-mono">
                Exact decimals allowed
              </p>
            </div>

            {/* 3. CATEGORY (Spending) OR SAVING TYPE (Saving) */}
            {kind === 'spending' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] font-bold">
                    Allocation Category
                  </label>
                  {!showAddCategory && (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="text-[11px] font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add new</span>
                    </button>
                  )}
                </div>

                {showAddCategory ? (
                  <div className="p-3 bg-[#f2f4f7] dark:bg-[#15171d] border border-[#e4e7ec] dark:border-[#272a33] rounded-lg space-y-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name (e.g. Subscriptions)"
                      maxLength={50}
                      autoFocus
                      className="w-full bg-white dark:bg-[#0e1014] border border-[#d0d5dd] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded px-3 py-1.5 text-xs text-black dark:text-white font-mono"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-2.5 py-1 text-[11px] font-mono text-[#667085] dark:text-[#8c92a0] hover:text-black dark:hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={addingCategory || !newCategoryName.trim()}
                        onClick={handleAddNewCategory}
                        className="px-2.5 py-1 text-[11px] font-mono bg-black text-white dark:bg-white dark:text-black rounded font-medium disabled:opacity-50"
                      >
                        {addingCategory ? 'Adding...' : 'Add Category'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full bg-[#f8f9fa] dark:bg-[#15171d] border border-[#d0d5dd] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-black dark:text-white font-mono transition-colors font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-[#15171d] text-black dark:text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] mb-2 font-bold">
                  Saving Asset Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SAVING_TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setSavingType(t.key)}
                      className={`py-2 px-3 border rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                        savingType === t.key
                          ? 'border-black bg-black text-white dark:border-white dark:bg-[#1a1d24] dark:text-white font-bold shadow-sm'
                          : 'border-[#d0d5dd] dark:border-[#272a33] bg-[#f8f9fa] dark:bg-[#15171d] text-[#475467] dark:text-[#8c92a0] hover:border-black dark:hover:border-white text-black dark:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TRANSACTION DATE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] font-bold">
                  Transaction Date
                </label>
                <span className="text-[11px] font-mono text-[#667085] dark:text-[#5f6575]">
                  IST (UTC+5:30)
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={entryDate}
                    max={getTodayIST()}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    className="w-full bg-[#f8f9fa] dark:bg-[#15171d] border border-[#d0d5dd] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg px-3.5 py-2 text-sm text-black dark:text-white font-mono transition-colors font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEntryDate(getTodayIST())}
                  className="px-3 py-2 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded-lg text-xs font-mono text-black dark:text-[#cbd0d8] transition-colors cursor-pointer font-bold"
                >
                  TODAY
                </button>
              </div>
            </div>

            {/* 5. REFERENCE MEMO */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] font-bold">
                  Reference Memo
                </label>
                <span className="text-[10px] font-mono text-[#667085] dark:text-[#5f6575]">
                  {memo.length}/120
                </span>
              </div>
              <input
                type="text"
                value={memo}
                maxLength={120}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. Office commute & weekly fuels"
                className="w-full bg-[#f8f9fa] dark:bg-[#15171d] border border-[#d0d5dd] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-black dark:text-white placeholder-[#98a2b3] dark:placeholder-[#505664] font-mono transition-colors"
              />
            </div>

            {/* 6. LIVE IMPACT SIMULATION */}
            <div className="p-4 bg-[#f8f9fa] dark:bg-[#14161b] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-wider text-[#667085] dark:text-[#737987] uppercase font-bold">
                  IMPACT SIMULATION
                </span>
                <span className="text-[10px] font-mono text-[#475467] dark:text-[#cbd0d8] flex items-center gap-1 font-semibold">
                  <span>🖩</span>
                  <span>Real-time</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-[#e2e4e8] dark:border-[#23262d] pb-3">
                <div>
                  <div className="text-[10px] font-mono text-[#667085] dark:text-[#737987] uppercase font-semibold">Current Remaining</div>
                  <div className="text-base font-bold font-mono text-black dark:text-white mt-0.5">
                    {formatRupees(currentRemaining)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#667085] dark:text-[#737987] uppercase font-semibold">New Remaining</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${isBelowZero ? 'text-[#dc2626] dark:text-[#f87171]' : 'text-black dark:text-white'}`}>
                    {formatRupees(simulatedNewRemaining)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#475467] dark:text-[#8c92a0] font-semibold">Pool Status</span>
                {simulatedSignal && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black text-white dark:bg-[#1f232b] dark:border dark:border-[#2d323e] text-[10px] font-medium shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span>{simulatedSignal.label} ({simulatedSignal.formattedPercentage} remaining)</span>
                  </span>
                )}
              </div>

              {isBelowZero ? (
                <div className="p-2.5 bg-[#fef2f2] dark:bg-[#251517] border border-[#fecaca] dark:border-[#482025] rounded-lg text-xs text-[#b91c1c] dark:text-[#f87171] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef4444]" />
                  <div>
                    <strong>Warning:</strong> This entry will result in a negative balance of {formatRupees(simulatedNewRemaining)}. You can still save it.
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-[#edf7ed] dark:bg-[#14231b] border border-[#c8e6c9] dark:border-[#23452f] rounded-lg text-xs text-[#2e7d32] dark:text-[#70d497] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2e7d32] dark:text-[#48bb78]" />
                  <span className="font-semibold">Notice: No negative balance risk</span>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="pt-4 border-t border-[#e2e4e8] dark:border-[#23262d] space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded-lg text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white transition-colors cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || parsedNewAmountPaise <= 0}
                className="w-2/3 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {loading ? (
                  <span className="font-mono text-xs">Saving Entry...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditMode ? 'Update Entry' : 'Save Entry'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setKind(kind === 'spending' ? 'saving' : 'spending')}
                className="text-[11px] font-mono text-[#667085] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors cursor-pointer font-semibold"
              >
                {kind === 'spending'
                  ? 'Switch to Saving entry (Gold, Stocks, Bonds, Crypto)'
                  : 'Switch to Spending entry (Categories)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
