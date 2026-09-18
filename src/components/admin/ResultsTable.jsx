import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, Trophy, CheckCircle2 } from 'lucide-react';

export default function ResultsTable({
  attempts = [],
  selectedBatchName = '',
  searchTerm = '',
  setSearchTerm = () => {}
}) {
  const [sortField, setSortField] = useState('wpm');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Filter only completed attempts for official ranking table
  const rankedAttempts = useMemo(() => {
    let list = attempts.filter(a => a.status === 'COMPLETED');

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a => a.candidate_name.toLowerCase().includes(q));
    }

    // Default primary sort: WPM desc -> Accuracy desc -> Errors asc
    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'name') {
        diff = a.candidate_name.localeCompare(b.candidate_name);
      } else {
        const valA = Number(a[sortField] || a.net_wpm || 0);
        const valB = Number(b[sortField] || b.net_wpm || 0);
        diff = valA - valB;
      }

      if (diff === 0) {
        // Secondary: Higher Accuracy first
        const accA = Number(a.accuracy || 0);
        const accB = Number(b.accuracy || 0);
        if (accB !== accA) return accB - accA;
        // Tertiary: Fewer Errors first
        return Number(a.errors || 0) - Number(b.errors || 0);
      }

      return sortOrder === 'desc' ? -diff : diff;
    });

    return list;
  }, [attempts, searchTerm, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70" />;
    }
    return sortOrder === 'desc' ? (
      <ArrowDown className="w-3.5 h-3.5 text-sky-600 font-bold" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-sky-600 font-bold" />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Ranked Assessment Results
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Sorted by WPM (Highest → Lowest) &bull; Official Merit List
            </p>
          </div>
        </div>

        {/* Search box */}
        <div className="relative flex-1 sm:w-60">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 sm:px-4 text-center w-14">Rank</th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Candidate Name</span>
                  {renderSortIndicator('name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('wpm')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none text-sky-700 bg-sky-50/50"
              >
                <div className="flex items-center gap-1.5 font-extrabold">
                  <span>Speed (WPM)</span>
                  {renderSortIndicator('wpm')}
                </div>
              </th>
              <th
                onClick={() => handleSort('accuracy')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Accuracy</span>
                  {renderSortIndicator('accuracy')}
                </div>
              </th>
              <th
                onClick={() => handleSort('errors')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Errors</span>
                  {renderSortIndicator('errors')}
                </div>
              </th>
              <th className="py-3 px-4">Correct / Total</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rankedAttempts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                  {searchTerm ? 'No matching candidates found.' : 'No completed assessments in this batch yet.'}
                </td>
              </tr>
            ) : (
              rankedAttempts.map((item, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3 && (sortField === 'wpm' || sortField === 'net_wpm') && sortOrder === 'desc';
                const displayWpm = item.wpm ?? item.net_wpm ?? 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-sky-50/40 transition-colors text-slate-700"
                  >
                    <td className="py-3 px-3 sm:px-4 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                        isTopThree && rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        isTopThree && rank === 2 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                        isTopThree && rank === 3 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'text-slate-500'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.candidate_name}
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-sky-700 text-sm sm:text-base bg-sky-50/30">
                      {displayWpm}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {item.accuracy}%
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-rose-600">
                      {item.errors}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      <span className="text-emerald-700 font-bold">{item.correct_characters}</span> / {item.total_characters}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
