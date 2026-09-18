import React from 'react';
import { CheckCircle, CheckCheck, Clock, User, Award } from 'lucide-react';
import logoImg from '../../assets/alboriss-logo.png';

export default function ResultStep({ candidateName, batchName, metrics }) {
  const {
    wpm = 0,
    accuracy = 0,
    errors = 0,
    correctCharacters = 0,
    totalCharacters = 0,
    durationSeconds = 60
  } = metrics || {};

  return (
    <div className="w-full max-w-xl lg:max-w-2xl mx-auto px-4 py-6">
      {/* Success Badge & Header */}
      <div className="text-center mb-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
          <CheckCircle className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          ASSESSMENT COMPLETE
        </h1>
        <p className="text-sm font-semibold text-slate-500 mt-0.5">
          Your official test submission has been registered.
        </p>
      </div>

      {/* Main Result Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-5">
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Candidate
            </span>
            <span className="text-base font-bold text-white">{candidateName}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Batch
            </span>
            <span className="text-xs font-bold bg-sky-600 text-white px-2.5 py-0.5 rounded-full">
              {batchName}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {/* Main 2 Highlighted Scores: WPM & ACCURACY */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-5 text-center shadow-xs">
              <span className="text-xs sm:text-sm font-black text-sky-800 uppercase tracking-wider block mb-1">
                TYPING SPEED (WPM)
              </span>
              <span className="text-4xl sm:text-5xl font-mono font-black text-sky-700">
                {wpm}
              </span>
              <span className="text-[11px] font-semibold text-sky-600 block mt-1">
                Words Per Minute
              </span>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 text-center shadow-xs">
              <span className="text-xs sm:text-sm font-black text-emerald-800 uppercase tracking-wider block mb-1">
                ACCURACY
              </span>
              <span className="text-4xl sm:text-5xl font-mono font-black text-emerald-700">
                {accuracy}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
                Correctness Rate
              </span>
            </div>
          </div>

          {/* Detailed Statistics Table */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-slate-600 font-medium">Errors</span>
              <span className="font-bold text-rose-600 font-mono text-base">{errors}</span>
            </div>

            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-slate-600 font-medium">Correct Characters</span>
              <span className="font-bold text-emerald-700 font-mono text-base">{correctCharacters}</span>
            </div>

            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-slate-600 font-medium">Total Characters Typed</span>
              <span className="font-bold text-slate-900 font-mono text-base">{totalCharacters}</span>
            </div>

            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-slate-600 font-medium">Test Duration</span>
              <span className="font-bold text-slate-900 font-mono">{durationSeconds} seconds</span>
            </div>

            <div className="flex justify-between items-center px-4 py-3 text-sm bg-slate-100/60">
              <span className="text-slate-700 font-semibold">Assessment Status</span>
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-800 text-xs uppercase bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                <CheckCheck className="w-3.5 h-3.5" />
                COMPLETED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Notice & Strict No Retake */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-600">
        <p className="font-semibold text-slate-800 mb-0.5">
          Your score has been registered in the Alboriss recruitment system.
        </p>
        <p>
          Please inform the recruitment coordinator that you have finished your assessment.
        </p>
      </div>
    </div>
  );
}
