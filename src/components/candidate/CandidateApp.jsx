import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import NameEntryStep from './NameEntryStep';
import InstructionsStep from './InstructionsStep';
import PracticeTestStep from './PracticeTestStep';
import ActualTestStep from './ActualTestStep';
import ResultStep from './ResultStep';
import InvalidStep from './InvalidStep';
import { getActiveOpenBatch, getBatchAttempts, checkCandidateAttempt, updateAttempt } from '../../services/supabase';

export default function CandidateApp() {
  // Synchronous initialization to immediately intercept reload during active assessment
  const [step, setStep] = useState(() => {
    const isDisqualified = localStorage.getItem('alboriss_test_disqualified') === 'true';
    const wasRunning = localStorage.getItem('alboriss_active_test_running') === 'true';
    if (isDisqualified || wasRunning) {
      return 'invalid';
    }
    return 'name';
  });

  const [activeBatch, setActiveBatch] = useState(null);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [candidateName, setCandidateName] = useState(() => {
    return localStorage.getItem('alboriss_active_candidate') || '';
  });
  const [testMetrics, setTestMetrics] = useState(null);
  const [invalidReason, setInvalidReason] = useState(() => {
    return (
      localStorage.getItem('alboriss_disqualified_reason') ||
      'Candidate left or reloaded the assessment during the active test.'
    );
  });
  const [isLoadingBatch, setIsLoadingBatch] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load active open batch
  const refreshBatchData = async () => {
    try {
      setIsLoadingBatch(true);
      const batch = await getActiveOpenBatch();
      setActiveBatch(batch);

      if (batch) {
        const attempts = await getBatchAttempts(batch.id);
        const activeOrFinished = attempts.filter(a => a.status !== 'PRACTICE');
        setAttemptsCount(activeOrFinished.length);
      }
    } catch (err) {
      console.error('Failed to load active batch:', err);
    } finally {
      setIsLoadingBatch(false);
    }
  };

  useEffect(() => {
    refreshBatchData();

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // If candidate was in progress and reloaded, ensure disqualified in DB
    const wasRunning = localStorage.getItem('alboriss_active_test_running') === 'true';
    const isDisqualified = localStorage.getItem('alboriss_test_disqualified') === 'true';
    const attemptId = localStorage.getItem('alboriss_active_attempt_id');

    if (wasRunning || isDisqualified) {
      localStorage.setItem('alboriss_test_disqualified', 'true');
      localStorage.removeItem('alboriss_active_test_running');
      setStep('invalid');
      setInvalidReason('Candidate left or reloaded the assessment during the active test.');

      if (attemptId) {
        updateAttempt(attemptId, {
          status: 'INVALID',
          invalid_reason: 'Candidate left or reloaded the assessment during the active test.',
          test_completed_at: new Date().toISOString()
        }).catch(err => console.error('Failed to sync invalid status on mount:', err));
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handlers for candidate flow
  const handleNameSubmit = (name) => {
    setCandidateName(name);
    localStorage.setItem('alboriss_active_candidate', name);
    setStep('instructions');
  };

  const handleStartPractice = () => {
    setStep('practice');
  };

  const handleCompletePractice = () => {
    setStep('actual');
  };

  const handleTestComplete = (metrics) => {
    setTestMetrics(metrics);
    setStep('result');
  };

  const handleTestInvalid = (reason) => {
    setInvalidReason(reason);
    setStep('invalid');
  };

  const handleResetSession = () => {
    localStorage.removeItem('alboriss_test_disqualified');
    localStorage.removeItem('alboriss_active_test_running');
    localStorage.removeItem('alboriss_disqualified_reason');
    localStorage.removeItem('alboriss_active_candidate');
    localStorage.removeItem('alboriss_active_attempt_id');
    setCandidateName('');
    setInvalidReason('');
    setStep('name');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <Header
        batchName={activeBatch?.name}
        isOnline={isOnline}
      />

      {/* Main Flow Container (Spacious Desktop-Focused Layout) */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-3 sm:p-6">
        {step === 'name' && (
          <NameEntryStep
            activeBatch={activeBatch}
            attemptsCount={attemptsCount}
            isLoadingBatch={isLoadingBatch}
            onNameSubmit={handleNameSubmit}
          />
        )}

        {step === 'instructions' && (
          <InstructionsStep
            candidateName={candidateName}
            batchName={activeBatch?.name || 'Batch'}
            onStartPractice={handleStartPractice}
          />
        )}

        {step === 'practice' && (
          <PracticeTestStep
            activeBatch={activeBatch}
            candidateName={candidateName}
            batchName={activeBatch?.name || 'Batch'}
            onCompletePractice={handleCompletePractice}
          />
        )}

        {step === 'actual' && (
          <ActualTestStep
            activeBatch={activeBatch}
            candidateName={candidateName}
            onTestComplete={handleTestComplete}
            onTestInvalid={handleTestInvalid}
          />
        )}

        {step === 'result' && (
          <ResultStep
            candidateName={candidateName}
            batchName={activeBatch?.name || 'Batch'}
            metrics={testMetrics}
          />
        )}

        {step === 'invalid' && (
          <InvalidStep
            candidateName={candidateName}
            batchName={activeBatch?.name || 'Batch'}
            reason={invalidReason}
            onReset={handleResetSession}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-2.5 text-xs text-slate-400 border-t border-slate-200 bg-white">
        <span>&copy; {new Date().getFullYear()} ALBORISS Typing Assessment &bull; Non-IT Recruitment Platform</span>
      </footer>
    </div>
  );
}
