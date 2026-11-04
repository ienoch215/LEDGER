import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { EntryWithCategory } from '@/types/database';
import { formatRupees } from '@/lib/money';
import { formatEntryDate } from '@/lib/dates';
import { deleteEntry } from '@/lib/ledgerApi';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: EntryWithCategory | null;
  onDeleted: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  entry,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await deleteEntry(entry.id);
      onDeleted();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete entry.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayName = entry.memo || entry.category?.name || (entry.saving_type ? entry.saving_type.toUpperCase() : 'Entry');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0e1014] border border-[#e2e4e8] dark:border-[#23262d] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#e2e4e8] dark:border-[#23262d] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#dc2626] dark:text-[#f87171] uppercase font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>CONFIRM DELETION</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#667085] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-black dark:text-white">
            Delete this entry?
          </h3>

          <p className="text-xs text-[#475467] dark:text-[#8c92a0] leading-relaxed">
            Are you sure you want to permanently delete this transaction? Your monthly balance and signal will be automatically recalculated.
          </p>

          {/* Entry preview snippet */}
          <div className="p-3.5 bg-[#f8f9fa] dark:bg-[#14161b] border border-[#e2e4e8] dark:border-[#23262d] rounded-xl font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-[#667085] dark:text-[#737987]">
              <span>Date: {formatEntryDate(entry.entry_date)}</span>
              <span className="uppercase text-black dark:text-white font-bold">{entry.kind}</span>
            </div>
            <div className="flex justify-between text-black dark:text-white font-bold">
              <span className="truncate max-w-[200px]">{displayName}</span>
              <span className="text-[#dc2626] dark:text-[#f87171]">-{formatRupees(entry.amount)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#fef2f2] dark:bg-[#251517] border border-[#fecaca] dark:border-[#482025] rounded-lg text-xs text-[#b91c1c] dark:text-[#f87171]">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e4e8] dark:border-[#23262d]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-[#d0d5dd] dark:border-[#272a33] hover:border-black dark:hover:border-white rounded-lg text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white transition-colors cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Deleting...' : 'Delete Entry'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
