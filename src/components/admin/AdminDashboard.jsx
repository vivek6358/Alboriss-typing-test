import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllBatches,
  getBatchAttempts,
  getAllAttempts,
  createBatch,
  updateBatchStatus,
  deleteBatch,
  subscribeToBatchUpdates,
  isSupabaseConfigured
} from '../../services/supabase';
import { exportBatchToExcel, exportAllResultsToExcel } from '../../utils/exportExcel';
import logoImg from '../../assets/alboriss-logo.png';
import BatchSummary from './BatchSummary';
import LiveMonitor from './LiveMonitor';
import ResultsTable from './ResultsTable';
import InvalidAttemptsTable from './InvalidAttemptsTable';
import BatchModal from './BatchModal';
import {
  Plus,
  Download,
  Power,
  PlayCircle,
  StopCircle,
  Calendar,
  Layers,
  Database,
  RefreshCw,
  LogOut,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Formatted today's date
  const todayDateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Load all batches
  const fetchBatches = useCallback(async () => {
    try {
      const allBatches = await getAllBatches();
      setBatches(allBatches);

      if (allBatches.length > 0) {
        // Keep current selected if valid, or default to first open batch or first batch
        setSelectedBatchId(prev => {
          if (prev && allBatches.some(b => b.id === prev)) return prev;
          const openBatch = allBatches.find(b => b.status === 'OPEN');
          return openBatch ? openBatch.id : allBatches[0].id;
        });
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  }, []);

  // Load attempts for selected batch
  const fetchAttempts = useCallback(async (batchId) => {
    if (!batchId) return;
    try {
      const data = await getBatchAttempts(batchId);
      setAttempts(data);
    } catch (err) {
      console.error('Error fetching attempts:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchBatches();
      setIsLoading(false);
    }
    init();
  }, [fetchBatches]);

  // When selected batch changes, load attempts
  useEffect(() => {
    if (selectedBatchId) {
      fetchAttempts(selectedBatchId);
    }
  }, [selectedBatchId, fetchAttempts]);

  // Real-time subscription to attempts and batches
  useEffect(() => {
    const unsubscribe = subscribeToBatchUpdates(() => {
      // On any live update, refresh current batch attempts & batches list
      fetchBatches();
      if (selectedBatchId) {
        fetchAttempts(selectedBatchId);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [selectedBatchId, fetchBatches, fetchAttempts]);

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchBatches();
    if (selectedBatchId) {
      await fetchAttempts(selectedBatchId);
    }
    setIsRefreshing(false);
  };

  const selectedBatch = batches.find(b => b.id === selectedBatchId) || batches[0];
  const nextBatchNumber = batches.length > 0 ? Math.max(...batches.map(b => b.batch_number)) + 1 : 1;
  const currentBatchAttempts = attempts.filter(a => a.status !== 'PRACTICE');

  // Toggle Batch status (OPEN / CLOSED)
  const handleToggleBatchStatus = async () => {
    if (!selectedBatch) return;
    const newStatus = selectedBatch.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await updateBatchStatus(selectedBatch.id, newStatus);
      await fetchBatches();
    } catch (err) {
      alert('Failed to update batch status: ' + err.message);
    }
  };

  // Delete Batch handler
  const handleDeleteBatch = async () => {
    if (!selectedBatch) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${selectedBatch.name}"?\nAll candidate attempts and records in this batch will be erased.`
    );
    if (!confirmDelete) return;

    try {
      await deleteBatch(selectedBatch.id);
      setSelectedBatchId(null);
      await fetchBatches();
      setAttempts([]);
    } catch (err) {
      alert('Failed to delete batch: ' + err.message);
    }
  };

  // Create new batch handler
  const handleCreateBatch = async (batchPayload) => {
    const created = await createBatch(batchPayload);
    await fetchBatches();
    setSelectedBatchId(created.id);
  };

  // Export Selected Batch
  const handleExportSelectedBatch = () => {
    if (!selectedBatch) return;
    exportBatchToExcel(selectedBatch, attempts);
  };

  // Master Export: All Results across all batches
  const handleExportAllResults = async () => {
    try {
      const allAttempts = await getAllAttempts();
      const batchesMap = batches.reduce((acc, b) => {
        acc[b.id] = b;
        return acc;
      }, {});
      exportAllResultsToExcel(allAttempts, batchesMap);
    } catch (err) {
      alert('Failed to export all results: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Alboriss"
              className="h-10 w-auto object-contain bg-white rounded-lg p-1 shadow-xs"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-wider text-white">ALBORISS</span>
                <span className="text-[10px] font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded uppercase">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Typing Assessment Management &bull; Non-IT Hiring Drive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database indicator */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-700 text-amber-300'
              }`}
              title={isSupabaseConfigured ? "Connected to Supabase PostgreSQL" : "Running on Local Storage fallback"}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Local Storage Mode'}</span>
            </span>

            {/* Refresh button */}
            <button
              onClick={handleManualRefresh}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Top Meta Bar: Date & Batch Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>{todayDateStr}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Current Batch: <span className="text-sky-700">{selectedBatch?.name || 'No Batch'}</span>
              </h1>
              
              {selectedBatch && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  selectedBatch.status === 'OPEN'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}>
                  Status: {selectedBatch.status}
                </span>
              )}

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Candidates: <strong>{currentBatchAttempts.length} / {selectedBatch?.max_candidates || 15}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons (Requirement 22) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Batch Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedBatchId || ''}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Open / Close Batch */}
            {selectedBatch && (
              <button
                onClick={handleToggleBatchStatus}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedBatch.status === 'OPEN'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                }`}
              >
                {selectedBatch.status === 'OPEN' ? (
                  <>
                    <StopCircle className="w-4 h-4 text-rose-600" />
                    <span>CLOSE BATCH</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 text-emerald-600" />
                    <span>OPEN BATCH</span>
                  </>
                )}
              </button>
            )}

            {/* Delete Batch */}
            {selectedBatch && (
              <button
                onClick={handleDeleteBatch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-300 transition-colors cursor-pointer uppercase tracking-wider"
                title="Permanently delete this batch and its results"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>DELETE BATCH</span>
              </button>
            )}

            {/* Create New Batch */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE NEW BATCH</span>
            </button>

            {/* Export Batch Excel */}
            <button
              onClick={handleExportSelectedBatch}
              disabled={attempts.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
              title="Export Current Batch Excel (Sheet 1: Results, Sheet 2: Invalid Attempts, Sheet 3: Summary)"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT EXCEL</span>
            </button>

            {/* Master Export All Results */}
            <button
              onClick={handleExportAllResults}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider"
              title="Export All Results from all batches into one master workbook"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>MASTER EXPORT</span>
            </button>
          </div>
        </div>

        {/* Batch Summary Top Statistics (Requirement 26) */}
        <BatchSummary attempts={attempts} />

        {/* Live Candidate Status Monitor (Requirement 23) */}
        <LiveMonitor
          activeBatch={selectedBatch}
          attempts={attempts}
        />

        {/* Auto-Ranked Results Table (Requirement 24, 25) */}
        <ResultsTable
          attempts={attempts}
          selectedBatchName={selectedBatch?.name || ''}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Invalid Attempts Section (Requirement 27) */}
        <InvalidAttemptsTable
          attempts={attempts}
          batchName={selectedBatch?.name || ''}
        />
      </main>

      {/* Create Batch Modal */}
      <BatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBatch={handleCreateBatch}
        nextBatchNumber={nextBatchNumber}
      />
    </div>
  );
}
