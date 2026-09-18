import React, { useState } from 'react';
import logoImg from '../../assets/alboriss-logo.png';
import { User, AlertCircle, Clock, CheckCircle2, Lock } from 'lucide-react';
import { checkCandidateAttempt } from '../../services/supabase';

export default function NameEntryStep({ activeBatch, attemptsCount, onNameSubmit, isLoadingBatch }) {
  const [candidateName, setCandidateName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Maximum candidate check
  const maxCandidates = activeBatch?.max_candidates || 15;
  const isBatchFull = activeBatch && attemptsCount >= maxCandidates;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = candidateName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your full name to proceed.');
      return;
    }

    if (trimmed.length < 2) {
      setErrorMsg('Candidate name must be at least 2 characters.');
      return;
    }

    if (!activeBatch) {
      setErrorMsg('No active batch is available. Please wait for the recruiter.');
      return;
    }

    if (isBatchFull) {
      setErrorMsg('This batch is now full. Please wait for the recruiter to start the next batch.');
      return;
    }

    setIsVerifying(true);
    try {
      // Check if candidate already has an attempt in this batch
      const existing = await checkCandidateAttempt(activeBatch.id, trimmed);
      
      if (existing && existing.length > 0) {
        const attempt = existing[0];
        if (attempt.status === 'COMPLETED') {
          setErrorMsg(`An assessment has already been completed under the name "${trimmed}" in this batch.`);
          setIsVerifying(false);
          return;
        }
        if (attempt.status === 'INVALID') {
          setErrorMsg(`An attempt under "${trimmed}" was marked INVALID due to leaving or reloading the assessment.`);
          setIsVerifying(false);
          return;
        }
        if (attempt.status === 'IN_PROGRESS') {
          setErrorMsg(`An active attempt under "${trimmed}" was already registered.`);
          setIsVerifying(false);
          return;
        }
      }

      // Candidate name is verified and approved to take instructions
      onNameSubmit(trimmed);
    } catch (err) {
      console.error('Candidate verification error:', err);
      // If network glitch, still allow continuing to test
      onNameSubmit(trimmed);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {/* Branding Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center mb-6">
        <div className="flex justify-center mb-4">
          <img
            src={logoImg}
            alt="Alboriss"
            className="h-20 sm:h-24 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-1 uppercase">
          TYPING ASSESSMENT
        </h1>
        <p className="text-sm sm:text-base font-semibold text-sky-700 mb-4">
          Alboriss — Non-IT Hiring Drive
        </p>

        {/* Current Batch Badge */}
        {isLoadingBatch ? (
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
            Checking current batch status...
          </div>
        ) : activeBatch ? (
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-900 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Current Batch: <strong>{activeBatch.name}</strong></span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">Slots: {attemptsCount} / {maxCandidates}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-xl text-xs font-medium text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No active batch is currently open. Please wait for the recruitment desk.</span>
          </div>
        )}
      </div>

      {/* Batch Full Alert */}
      {isBatchFull && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">BATCH FULL</p>
            <p className="mt-0.5 text-rose-700">
              {activeBatch.name} has reached the maximum capacity of {maxCandidates} candidates. Please wait for the recruiter to open the next batch.
            </p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <label htmlFor="candidateName" className="block text-sm font-bold text-slate-800 mb-2">
            Candidate Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="candidateName"
              type="text"
              required
              disabled={!activeBatch || isBatchFull || isVerifying}
              value={candidateName}
              onChange={(e) => {
                setCandidateName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter your full name"
              autoComplete="name"
              autoCapitalize="words"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-base font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:bg-slate-100 min-h-[48px] transition-all"
            />
          </div>
          <p className="text-[12px] text-slate-500 mt-2">
            Please enter your official full name as per your application.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!activeBatch || isBatchFull || isVerifying || !candidateName.trim()}
          className="w-full min-h-[48px] py-3 px-5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {isVerifying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </>
          ) : (
            <span>CONTINUE TO INSTRUCTIONS</span>
          )}
        </button>
      </form>

      {/* Recruiter Desk note */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Alboriss Non-IT Recruitment Platform &bull; Batches of 15</p>
      </div>
    </div>
  );
}
