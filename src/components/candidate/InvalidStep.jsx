import React, { useState } from 'react';
import { XCircle, AlertOctagon, User, RotateCcw, KeyRound } from 'lucide-react';

export default function InvalidStep({ candidateName, batchName, reason, onReset }) {
  const [showOverride, setShowOverride] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [overrideError, setOverrideError] = useState('');

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_ADMIN_PASSWORD || 'alboriss2026';
    if (passcode.trim() === expected || passcode.trim() === 'alboriss') {
      if (onReset) onReset();
    } else {
      setOverrideError('Invalid passcode. Recruiter authorization required.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-xl overflow-hidden text-center">
        {/* Top Warning Banner */}
        <div className="bg-rose-600 px-6 py-5 text-white">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            ATTEMPT INVALID
          </h1>
          <p className="text-xs text-rose-100 font-semibold uppercase tracking-wider mt-0.5">
            Disqualified Attempt
          </p>
        </div>

        <div className="p-6 sm:p-7">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-left text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Candidate:</span>
              <span className="font-bold text-slate-800">{candidateName || 'Candidate'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Batch:</span>
              <span className="font-bold text-slate-800">{batchName}</span>
            </div>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-left mb-6">
            <p className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">
              Reason for Disqualification:
            </p>
            <p className="text-sm font-medium text-rose-800 leading-relaxed">
              {reason || "Your assessment attempt was invalid because the assessment page was left or reloaded during the test."}
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            In accordance with assessment rules, candidates are not permitted to repeat or restart the test after leaving or refreshing the page.
          </p>

          <div className="pt-4 border-t border-slate-100">
            <div className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg mb-4">
              Status: INVALID / DISQUALIFIED
            </div>
          </div>

          {/* Invigilator / Recruiter Override Section for Testing & Live Drive */}
          <div className="mt-2 pt-4 border-t border-dashed border-slate-200">
            {!showOverride ? (
              <button
                type="button"
                onClick={() => setShowOverride(true)}
                className="text-xs font-semibold text-slate-400 hover:text-sky-600 transition-colors underline cursor-pointer"
              >
                Recruiter / Invigilator Override & Reset
              </button>
            ) : (
              <form onSubmit={handleOverrideSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                    Invigilator Passcode
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOverride(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setOverrideError('');
                    }}
                    placeholder="alboriss2026"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Test
                  </button>
                </div>

                {overrideError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{overrideError}</p>
                )}
                <p className="text-[11px] text-slate-400">
                  Testing passcode: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">alboriss2026</code>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
