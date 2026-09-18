import React, { useState } from 'react';
import { AlertTriangle, CheckSquare, Square, ShieldAlert, ArrowRight, User } from 'lucide-react';

export default function InstructionsStep({ candidateName, batchName, onStartPractice }) {
  const [hasAgreed, setHasAgreed] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      {/* Top Candidate Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 mb-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium leading-tight">Candidate</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">{candidateName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 rounded-full">
            {batchName}
          </span>
        </div>
      </div>

      {/* Main Instructions Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
            IMPORTANT INSTRUCTIONS
          </h2>
        </div>

        {/* Exact instructions required by Alboriss specification */}
        <div className="space-y-3.5 text-sm sm:text-base text-slate-700 leading-normal">
          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0"></span>
            <p>You will first get <strong>1 minute of practice</strong>.</p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0"></span>
            <p>After practice, you will take the <strong>1-minute typing assessment</strong>.</p>
          </div>

          <div className="flex items-start gap-2.5 bg-rose-50 p-3 rounded-xl border border-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm text-rose-950 font-medium">
              <p className="font-bold text-rose-700 uppercase">Strict Assessment Rules:</p>
              <p className="mt-1">
                Once the actual assessment starts, <strong>do not refresh, reload, close, minimize, or leave this page</strong>.
              </p>
              <p className="mt-1">
                Refreshing or leaving the page during the actual assessment will make your attempt <strong>INVALID / DISQUALIFIED</strong>.
              </p>
              <p className="mt-1">
                The actual assessment <strong>cannot be restarted or repeated</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0"></span>
            <p>Type the text exactly as displayed.</p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0"></span>
            <p>Pay attention to spaces, numbers and punctuation.</p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0"></span>
            <p>Your typing speed, accuracy and errors will be calculated automatically.</p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0"></span>
            <p>Make sure your internet connection is stable before starting.</p>
          </div>
        </div>

        {/* Checkbox Agreement */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <label
            onClick={() => setHasAgreed(!hasAgreed)}
            className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200"
          >
            <div className="mt-0.5 text-sky-600 shrink-0">
              {hasAgreed ? (
                <CheckSquare className="w-5 h-5 fill-sky-600 text-white" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 select-none">
              I have read and understood the instructions.
            </span>
          </label>
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!hasAgreed}
            onClick={onStartPractice}
            className="w-full min-h-[48px] py-3.5 px-6 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-base font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>START 1-MINUTE PRACTICE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
