import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainHeader } from '@/components/layout/MainHeader';
import { LiveSpendableBalanceCard } from '@/components/ledger/LiveSpendableBalanceCard';
import { SummaryCards } from '@/components/ledger/SummaryCards';
import { LedgerEntriesTable } from '@/components/ledger/LedgerEntriesTable';
import { RecordEntryDrawer } from '@/components/ledger/RecordEntryDrawer';
import { DeleteConfirmationModal } from '@/components/ledger/DeleteConfirmationModal';
import { SetSalaryModal } from '@/components/ledger/SetSalaryModal';
import { AllMonthsView } from '@/components/ledger/AllMonthsView';
import {
  getCurrentMonthFirstDayIST,
  toMonthStart,
  getNextMonthStart,
  getPrevMonthStart,
} from '@/lib/dates';
import {
  fetchMonthSummary,
  fetchAllUserMonths,
  fetchMonthEntries,
} from '@/lib/ledgerApi';
import { MonthSummaryRow, MonthRow, EntryWithCategory } from '@/types/database';

export const Dashboard: React.FC = () => {
  const { month: urlMonth } = useParams<{ month?: string }>();
  const navigate = useNavigate();

  // Active month (YYYY-MM-01)
  const defaultMonth = getCurrentMonthFirstDayIST();
  const activeMonth = urlMonth ? toMonthStart(urlMonth) : defaultMonth;

  // View state
  const [activeNav, setActiveNav] = useState<'ledger' | 'all-months'>('ledger');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<MonthSummaryRow | null>(null);
  const [allMonths, setAllMonths] = useState<MonthRow[]>([]);
  const [entries, setEntries] = useState<EntryWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);

  // Set Salary Modal state
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [salaryModalTargetMonth, setSalaryModalTargetMonth] = useState(activeMonth);
  const [isSalaryEditMode, setIsSalaryEditMode] = useState(false);

  // Record / Edit Entry Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<EntryWithCategory | null>(null);

  // Delete Confirmation Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<EntryWithCategory | null>(null);

  // Load summary and all months
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, monthsData] = await Promise.all([
        fetchMonthSummary(activeMonth),
        fetchAllUserMonths(),
      ]);

      setSummary(summaryData);
      setAllMonths(monthsData);

      // Rule: "Opening a month with no salary shows the Set Salary modal, pre-filled from the most recent earlier month, which I must confirm."
      const currentMonthHasSalary = summaryData?.salary !== null && (summaryData?.salary ?? 0) > 0;
      if (!currentMonthHasSalary) {
        setSalaryModalTargetMonth(activeMonth);
        setIsSalaryEditMode(false);
        setSalaryModalOpen(true);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeMonth]);

  // Load entries for active month
  const loadEntriesData = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const entriesData = await fetchMonthEntries(activeMonth);
      setEntries(entriesData);
    } catch (err) {
      console.error('Error loading entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  }, [activeMonth]);

  useEffect(() => {
    loadDashboardData();
    loadEntriesData();
  }, [loadDashboardData, loadEntriesData]);

  // Check if next month has a record
  const nextMonthStr = getNextMonthStart(activeMonth);
  const nextMonthHasRecord = allMonths.some((m) => m.month === nextMonthStr);

  const handleSelectMonth = (newMonth: string) => {
    navigate(`/ledger/${newMonth}`);
  };

  const handleOpenSalarySetup = () => {
    setSalaryModalTargetMonth(activeMonth);
    setIsSalaryEditMode(Boolean(summary?.salary && summary.salary > 0));
    setSalaryModalOpen(true);
  };

  const handleStartNextMonth = (nextMonth: string) => {
    setSalaryModalTargetMonth(nextMonth);
    setIsSalaryEditMode(false);
    setSalaryModalOpen(true);
  };

  const handleSalarySaved = (_savedSalary: number) => {
    if (salaryModalTargetMonth !== activeMonth) {
      navigate(`/ledger/${salaryModalTargetMonth}`);
    } else {
      loadDashboardData();
    }
  };

  // Open Record Drawer for new entry
  const handleOpenRecordEntry = () => {
    setEntryToEdit(null);
    setDrawerOpen(true);
  };

  // Open Record Drawer for editing an entry
  const handleEditEntry = (entry: EntryWithCategory) => {
    setEntryToEdit(entry);
    setDrawerOpen(true);
  };

  // Open Delete Modal
  const handleDeleteEntry = (entry: EntryWithCategory) => {
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
  };

  // Called after entry is created or updated
  const handleEntrySaved = () => {
    loadDashboardData();
    loadEntriesData();
  };

  // Called after entry is deleted
  const handleEntryDeleted = () => {
    loadDashboardData();
    loadEntriesData();
  };

  const currentSalary = summary?.salary || 0;
  const currentRemaining = summary?.remaining || 0;

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#090a0c] text-[#0e1014] dark:text-[#e5e8ec] flex transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentMonth={activeMonth}
        allMonths={allMonths}
        onSelectMonth={handleSelectMonth}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onOpenSalarySetup={handleOpenSalarySetup}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto">
        {activeNav === 'all-months' ? (
          <AllMonthsView
            months={allMonths}
            activeMonth={activeMonth}
            onSelectMonth={(m) => {
              handleSelectMonth(m);
              setActiveNav('ledger');
            }}
            onBackToLedger={() => setActiveNav('ledger')}
          />
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <MainHeader
              currentMonth={activeMonth}
              nextMonthHasRecord={nextMonthHasRecord}
              onStartNextMonth={handleStartNextMonth}
              onRecordEntryClick={handleOpenRecordEntry}
              onOpenMobileMenu={() => setMobileSidebarOpen(true)}
            />

            {/* Live Spendable Balance Card */}
            <LiveSpendableBalanceCard
              summary={summary}
              loading={loading}
              onSetSalaryClick={handleOpenSalarySetup}
            />

            {/* Three Summary Cards */}
            {summary && (
              <SummaryCards
                summary={summary}
                monthStr={activeMonth}
                onEditSalary={handleOpenSalarySetup}
              />
            )}

            {/* Ledger Entries Table */}
            <LedgerEntriesTable
              monthStr={activeMonth}
              entries={entries}
              summary={summary}
              loading={loadingEntries}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              onEditSalary={handleOpenSalarySetup}
              onRecordEntryClick={handleOpenRecordEntry}
            />
          </div>
        )}
      </main>

      {/* Record / Edit Entry Slide-over Panel */}
      <RecordEntryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentSalary={currentSalary}
        currentRemaining={currentRemaining}
        entryToEdit={entryToEdit}
        onEntrySaved={handleEntrySaved}
        onConcurrencyError={() => {
          loadEntriesData();
          loadDashboardData();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entry={entryToDelete}
        onDeleted={handleEntryDeleted}
      />

      {/* Set / Edit Salary Modal */}
      <SetSalaryModal
        isOpen={salaryModalOpen}
        onClose={() => setSalaryModalOpen(false)}
        targetMonth={salaryModalTargetMonth}
        currentSalary={
          salaryModalTargetMonth === activeMonth ? summary?.salary : null
        }
        onSalarySaved={handleSalarySaved}
        onBackToPrevious={
          salaryModalTargetMonth !== activeMonth
            ? () => {
                setSalaryModalOpen(false);
                handleSelectMonth(getPrevMonthStart(salaryModalTargetMonth));
              }
            : undefined
        }
        isEditMode={isSalaryEditMode}
      />
    </div>
  );
};
