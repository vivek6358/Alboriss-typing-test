import React, { useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import PassageDisplay from './PassageDisplay';
import { PRACTICE_PASSAGE } from '../../data/typingPassages';
import { calculateTypingMetrics, formatTime } from '../../utils/typingCalculations';

export default function PracticeTestStep({ candidateName, batchName, onCompletePractice }) {
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  const startTimeRef = useRef(Date.now());
  const inputRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Initialize practice timer
  const initTimer = () => {
    startTimeRef.current = Date.now();
    setTimeLeft(60);
    setIsFinished(false);
    setShowCompleteModal(false);
    setTypedText('');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 60 - Math.floor(elapsed));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        setIsFinished(true);
        setShowCompleteModal(true);
      }
    }, 200);
  };

  useEffect(() => {
    initTimer();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleRestart = () => {
    initTimer();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const metrics = calculateTypingMetrics(PRACTICE_PASSAGE.text, typedText, 60 - timeLeft);

  return (
    <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 py-2 sm:py-4">
      {/* DESKTOP-FOCUSED HEADER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-3 mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
              1-Minute Practice
            </span>
            <span className="text-xs font-bold text-slate-500">
              {batchName}
            </span>
          </div>
          <span className="text-lg font-black text-slate-900 leading-tight block mt-0.5">
            {candidateName}
          </span>
        </div>

        {/* Live Timer & Restart Action */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              PRACTICE TIME
            </span>
            <span className="text-3xl sm:text-4xl font-mono font-black text-sky-600 tracking-widest">
              {formatTime(timeLeft)}
            </span>
          </div>

          {!isFinished && (
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Monkeytype-style Word-Grouped Passage Display */}
      <div className="mb-3">
        <PassageDisplay
          passage={PRACTICE_PASSAGE.text}
          typedText={typedText}
          isActual={false}
        />
      </div>

      {/* Spacious Desktop Typing Area */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 focus-within:border-sky-500 shadow-sm p-4">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="practiceTypingArea" className="text-xs font-black text-slate-800 uppercase tracking-wider">
            TYPE BELOW
          </label>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
            <span>Characters: <strong className="text-slate-900 font-mono">{typedText.length}</strong></span>
            <span>Accuracy: <strong className="text-emerald-700 font-mono">{metrics.accuracy}%</strong></span>
            <span>Speed: <strong className="text-sky-700 font-mono">{metrics.wpm} WPM</strong></span>
          </div>
        </div>

        <textarea
          ref={inputRef}
          id="practiceTypingArea"
          rows={3}
          disabled={isFinished}
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          placeholder="Start typing the practice passage here..."
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-lg sm:text-xl focus:outline-none focus:bg-white disabled:bg-slate-100 disabled:opacity-75 resize-none leading-relaxed transition-all min-h-[90px]"
        />
      </div>

      {/* PRACTICE COMPLETE MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">
              PRACTICE COMPLETE
            </h3>

            <p className="text-sm font-semibold text-slate-600 mb-5">
              Your actual 1-minute assessment is ready.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-600 text-left space-y-1.5">
              <p className="font-bold text-slate-900">Exam Instructions:</p>
              <p>&bull; 60 seconds duration</p>
              <p>&bull; No pauses, no restarts</p>
              <p>&bull; Do not refresh (F5) or exit the page</p>
            </div>

            <button
              type="button"
              onClick={onCompletePractice}
              className="w-full min-h-[50px] py-3.5 px-6 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-black rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-base uppercase tracking-wider"
            >
              <span>START ACTUAL TEST</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
