import React from 'react';
import { User, Activity, Clock, CheckCircle2, AlertOctagon, UserCheck } from 'lucide-react';

export default function LiveMonitor({ activeBatch, attempts = [] }) {
  const maxCandidates = activeBatch?.max_candidates || 15;
  const currentAttempts = attempts.filter(a => a.status !== 'PRACTICE');

  // Fill array up to maxCandidates to show Waiting slots
  const slots = [];
  for (let i = 0; i < maxCandidates; i++) {
    if (i < currentAttempts.length) {
      slots.push({ ...currentAttempts[i], isFilled: true });
    } else {
      slots.push({
        id: `empty-slot-${i}`,
        candidate_name: `Candidate ${i + 1}`,
        status: 'Waiting',
        isFilled: false
      });
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full animate-pulse">
            <Activity className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
            <AlertOctagon className="w-3 h-3" />
            Invalid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Waiting
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
            Live Batch Candidates Monitor ({currentAttempts.length} / {maxCandidates})
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Batch: <strong className="text-slate-800">{activeBatch?.name || 'None'}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {slots.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              item.isFilled
                ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                : 'bg-white border-dashed border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                item.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-700' :
                item.status === 'INVALID' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <span className="text-xs font-semibold text-slate-800 truncate" title={item.candidate_name}>
                {item.candidate_name}
              </span>
            </div>
            <div className="shrink-0">
              {getStatusBadge(item.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
