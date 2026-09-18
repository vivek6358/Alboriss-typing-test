import React from 'react';
import { AlertOctagon, XCircle, Clock } from 'lucide-react';

export default function InvalidAttemptsTable({ attempts = [], batchName = '' }) {
  const invalidAttempts = attempts.filter(a => a.status === 'INVALID');

  const formatDateTime = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    } catch {
      return '-';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden mb-8">
      {/* Section Header */}
      <div className="p-4 sm:p-5 bg-rose-50/50 border-b border-rose-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-rose-950 uppercase tracking-wide">
              INVALID ATTEMPTS ({invalidAttempts.length})
            </h2>
            <p className="text-xs text-rose-700 font-medium">
              Disqualified attempts recorded for transparency (Reload, Leave Page, Navigation)
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-full">
          Batch: {batchName}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Candidate Name</th>
              <th className="py-3 px-4 text-center">Batch</th>
              <th className="py-3 px-4">Disqualification Reason</th>
              <th className="py-3 px-4 text-right">Time Recorded</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invalidAttempts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                  No invalid attempts recorded in this batch. All attempts are in order.
                </td>
              </tr>
            ) : (
              invalidAttempts.map((item) => (
                <tr key={item.id} className="hover:bg-rose-50/20 text-slate-700">
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {item.candidate_name}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap font-medium text-slate-600">
                    {batchName}
                  </td>
                  <td className="py-3 px-4 text-rose-700 font-medium text-xs max-w-md">
                    {item.invalid_reason || 'Page Reload / Left Active Assessment'}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-500">
                    {formatDateTime(item.test_completed_at || item.created_at)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" />
                      INVALID
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
