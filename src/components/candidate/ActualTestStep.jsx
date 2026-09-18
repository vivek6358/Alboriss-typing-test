import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, Wifi, WifiOff, ShieldAlert } from 'lucide-react';
import PassageDisplay from './PassageDisplay';
import CountdownOverlay from './CountdownOverlay';
import { getPassageById } from '../../data/typingPassages';
import { calculateTypingMetrics, formatTime } from '../../utils/typingCalculations';
import { createAttempt, updateAttempt } from '../../services/supabase';

export default function ActualTestStep({
  activeBatch,
  candidateName,
  onTestComplete,
  onTestInvalid
}) {
  const passageObj = getPassageById(activeBatch?.passage_id);
  const passageText = passageObj.text;

  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTestOver, setIsTestOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStartingConfirm, setIsStartingConfirm] = useState(true);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // References for strict lifecycle tracking
  const attemptIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isTerminatedRef = useRef(false);
  const latestTypedTextRef = useRef('');

  useEffect(() => {
    latestTypedTextRef.current = typedText;
  }, [typedText]);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mark attempt as INVALID
  const handleInvalidAttempt = useCallback(async (reason) => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;

    // Set permanent localStorage disqualification flag so reload cannot bypass
    localStorage.setItem('alboriss_test_disqualified', 'true');
    localStorage.setItem('alboriss_disqualified_reason', reason);
    localStorage.removeItem('alboriss_active_test_running');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const duration = startTimeRef.current
      ? Math.min(60, Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000)))
      : 0;

    const metrics = calculateTypingMetrics(passageText, latestTypedTextRef.current, duration);

    try {
      if (attemptIdRef.current) {
        await updateAttempt(attemptIdRef.current, {
          status: 'INVALID',
          invalid_reason: reason,
          duration_seconds: duration,
          gross_wpm: metrics.wpm,
          net_wpm: metrics.wpm,
          accuracy: metrics.accuracy,
          errors: metrics.errors,
          correct_characters: metrics.correctCharacters,
          incorrect_characters: metrics.incorrectCharacters,
          total_characters: metrics.totalCharacters,
          test_completed_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Failed to update invalid status:', e);
    }

    onTestInvalid(reason);
  }, [passageText, onTestInvalid]);

  // Finalize test as COMPLETED
  const handleCompleteTest = useCallback(async () => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;
    setIsTestOver(true);
    setIsSubmitting(true);

    // Clear active test running flags
    localStorage.removeItem('alboriss_active_test_running');
    localStorage.removeItem('alboriss_test_disqualified');
    localStorage.setItem('alboriss_test_completed_' + candidateName.toLowerCase(), 'true');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const finalTyped = latestTypedTextRef.current;
    const metrics = calculateTypingMetrics(passageText, finalTyped, 60);

    const completionPayload = {
      status: 'COMPLETED',
      test_completed_at: new Date().toISOString(),
      duration_seconds: 60,
      gross_wpm: metrics.wpm,
      net_wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      errors: metrics.errors,
      correct_characters: metrics.correctCharacters,
      incorrect_characters: metrics.incorrectCharacters,
      total_characters: metrics.totalCharacters
    };

    try {
      if (attemptIdRef.current) {
        await updateAttempt(attemptIdRef.current, completionPayload);
      }
    } catch (err) {
      console.error('Error persisting completed attempt:', err);
    } finally {
      setIsSubmitting(false);
      onTestComplete(metrics);
    }
  }, [passageText, candidateName, onTestComplete]);

  // Start the actual assessment
  const beginActualAssessment = async () => {
    setIsCountingDown(false);
    setIsStartingConfirm(false);
    startTimeRef.current = Date.now();

    // Store in localStorage immediately so reload can be intercepted
    localStorage.setItem('alboriss_active_test_running', 'true');
    localStorage.setItem('alboriss_active_candidate', candidateName);
    localStorage.setItem('alboriss_active_batch_id', activeBatch?.id || '');
    localStorage.setItem('alboriss_active_batch_name', activeBatch?.name || '');

    // 1. Create IN_PROGRESS record in Supabase / Local storage
    try {
      const newAttempt = await createAttempt({
        batch_id: activeBatch.id,
        candidate_name: candidateName,
        status: 'IN_PROGRESS',
        test_started_at: new Date(startTimeRef.current).toISOString(),
        duration_seconds: 60,
        gross_wpm: 0,
        net_wpm: 0,
        accuracy: 0,
        errors: 0,
        correct_characters: 0,
        incorrect_characters: 0,
        total_characters: 0
      });

      attemptIdRef.current = newAttempt.id;
      localStorage.setItem('alboriss_active_attempt_id', newAttempt.id);
    } catch (err) {
      console.error('Failed to create in-progress attempt:', err);
      const fallbackId = `attempt-local-${Date.now()}`;
      attemptIdRef.current = fallbackId;
      localStorage.setItem('alboriss_active_attempt_id', fallbackId);
    }

    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    // 2. Timestamp-based timer
    timerIntervalRef.current = setInterval(() => {
      if (isTerminatedRef.current) return;

      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 60 - Math.floor(elapsedSeconds));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        handleCompleteTest();
      }
    }, 200);
  };

  // 3. Anti-Cheat and Reload/Navigation Detection
  useEffect(() => {
    if (isStartingConfirm) return;

    // Handle BeforeUnload (refresh or closing tab)
    const handleBeforeUnload = (e) => {
      if (!isTerminatedRef.current) {
        // Mark disqualified in localStorage immediately
        localStorage.setItem('alboriss_test_disqualified', 'true');
        localStorage.setItem(
          'alboriss_disqualified_reason',
          'Candidate left or reloaded the assessment during the active test.'
        );
        localStorage.removeItem('alboriss_active_test_running');

        const currentAttemptId = attemptIdRef.current || localStorage.getItem('alboriss_active_attempt_id');
        if (currentAttemptId) {
          updateAttempt(currentAttemptId, {
            status: 'INVALID',
            invalid_reason: 'Candidate left or reloaded the assessment during the active test.',
            test_completed_at: new Date().toISOString()
          });
        }

        e.preventDefault();
        e.returnValue = 'Refreshing or leaving will invalidate your assessment!';
        return e.returnValue;
      }
    };

    // Handle Visibility Change (switching tabs or minimizing browser)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isTerminatedRef.current) {
        handleInvalidAttempt('Candidate minimized or switched tabs away from the active assessment.');
      }
    };

    // Handle History PopState (browser back button)
    const handlePopState = () => {
      if (!isTerminatedRef.current) {
        handleInvalidAttempt('Candidate used browser back navigation during active assessment.');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isStartingConfirm, handleInvalidAttempt]);

  const handlePreventClipboard = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 py-2 sm:py-4 select-none">
      {/* Confirmation Modal before starting countdown */}
      {isStartingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-lg w-full text-center">
            <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
              ASSESSMENT CONFIRMATION
            </h3>

            <p className="text-base font-semibold text-slate-700 mb-2">
              Your 1-minute assessment is about to begin.
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-left text-xs text-rose-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                STRICT EXAM CONDITIONS:
              </p>
              <p>&bull; The test runs for exactly <strong>60 seconds</strong>.</p>
              <p>&bull; <strong>Do NOT refresh (F5), reload, or switch tabs</strong>. Doing so will immediately mark your attempt <strong>INVALID / DISQUALIFIED</strong>.</p>
              <p>&bull; Retakes and restarts are strictly disabled.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsStartingConfirm(false);
                setIsCountingDown(true);
              }}
              className="w-full min-h-[50px] py-3 px-6 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-black rounded-xl shadow-md transition-colors text-base cursor-pointer uppercase tracking-wider"
            >
              I AM READY — START 1-MINUTE TEST
            </button>
          </div>
        </div>
      )}

      {/* 3 2 1 Countdown before actual test starts */}
      {isCountingDown && (
        <CountdownOverlay
          title="Actual Assessment Starting..."
          onComplete={beginActualAssessment}
        />
      )}

      {/* Network Alert if connection drops */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl mb-3 font-bold text-xs flex items-center gap-2 shadow-sm animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Connection interrupted — please remain on this page. Your test is continuing.</span>
        </div>
      )}

      {/* DESKTOP-FOCUSED HEADER BAR: Fits everything on one screen without scrolling */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-3.5 mb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 block">
            Alboriss Assessment &bull; {activeBatch?.name || 'Batch'}
          </span>
          <span className="text-lg font-black text-slate-900">
            {candidateName}
          </span>
        </div>

        {/* Large Prominent Timer */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              TIME REMAINING
            </span>
            <span className={`text-3xl sm:text-4xl font-mono font-black tracking-widest ${
              timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-sky-600'
            }`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Monkeytype-style Word-Grouped Passage Display */}
      <div className="mb-3">
        <PassageDisplay
          passage={passageText}
          typedText={typedText}
          isActual={true}
        />
      </div>

      {/* Spacious Desktop Typing Area */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 focus-within:border-sky-500 shadow-sm p-4">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="actualTypingArea" className="text-xs font-black text-slate-800 uppercase tracking-wider">
            TYPE BELOW
          </label>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span>Characters Typed: <strong className="text-slate-900 font-mono text-sm">{typedText.length}</strong></span>
          </div>
        </div>

        <textarea
          ref={inputRef}
          id="actualTypingArea"
          rows={3}
          disabled={isTestOver || isStartingConfirm}
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          onCopy={handlePreventClipboard}
          onCut={handlePreventClipboard}
          onPaste={handlePreventClipboard}
          onContextMenu={handlePreventClipboard}
          placeholder="Start typing the passage here..."
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-lg sm:text-xl focus:outline-none focus:bg-white disabled:bg-slate-100 disabled:opacity-80 resize-none leading-relaxed transition-all min-h-[90px]"
        />
      </div>

      {/* Submitting state overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-bold text-slate-900 text-sm">Saving Result...</p>
          </div>
        </div>
      )}
    </div>
  );
}
