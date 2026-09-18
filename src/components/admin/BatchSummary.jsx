import React from 'react';
import { Users, CheckCircle, XCircle, Gauge, Target, TrendingUp, TrendingDown } from 'lucide-react';

export default function BatchSummary({ attempts = [] }) {
  // Filter attempts
  const realAttempts = attempts.filter(a => a.status !== 'PRACTICE');
  const totalCandidates = realAttempts.length;
  const completedAttempts = realAttempts.filter(a => a.status === 'COMPLETED');
  const invalidAttempts = realAttempts.filter(a => a.status === 'INVALID');

  const completedCount = completedAttempts.length;
  const invalidCount = invalidAttempts.length;

  const avgWpm = completedCount > 0
    ? Math.round((completedAttempts.reduce((sum, c) => sum + Number(c.wpm ?? c.net_wpm ?? 0), 0) / completedCount) * 10) / 10
    : 0;

  const avgAccuracy = completedCount > 0
    ? Math.round((completedAttempts.reduce((sum, c) => sum + Number(c.accuracy || 0), 0) / completedCount) * 10) / 10
    : 0;

  const highestWpm = completedCount > 0
    ? Math.max(...completedAttempts.map(c => Number(c.wpm ?? c.net_wpm ?? 0)))
    : 0;

  const lowestWpm = completedCount > 0
    ? Math.min(...completedAttempts.map(c => Number(c.wpm ?? c.net_wpm ?? 0)))
    : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {/* Total Candidates */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Candidates</span>
        </div>
        <span className="text-2xl font-black text-slate-900 font-mono">{totalCandidates}</span>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
        </div>
        <span className="text-2xl font-black text-emerald-600 font-mono">{completedCount}</span>
      </div>

      {/* Invalid */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <XCircle className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Invalid</span>
        </div>
        <span className="text-2xl font-black text-rose-600 font-mono">{invalidCount}</span>
      </div>

      {/* Average WPM */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Gauge className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Avg WPM</span>
        </div>
        <span className="text-2xl font-black text-sky-700 font-mono">{avgWpm}</span>
      </div>

      {/* Average Accuracy */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Target className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Accuracy</span>
        </div>
        <span className="text-2xl font-black text-indigo-700 font-mono">{avgAccuracy}%</span>
      </div>

      {/* Highest WPM */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Highest WPM</span>
        </div>
        <span className="text-2xl font-black text-emerald-700 font-mono">{highestWpm}</span>
      </div>

      {/* Lowest WPM */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm col-span-2 sm:col-span-1">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <TrendingDown className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Lowest WPM</span>
        </div>
        <span className="text-2xl font-black text-amber-700 font-mono">{lowestWpm}</span>
      </div>
    </div>
  );
}
