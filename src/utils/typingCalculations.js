/**
 * ALBORISS TYPING ASSESSMENT - SCORING & METRICS ENGINE
 * Follows industry-standard typing assessment formulas.
 * Safe against division by zero, NaN, Infinity, and undefined.
 */

/**
 * Calculates detailed typing metrics given the reference passage and candidate typed text.
 * @param {string} originalPassage - The reference passage
 * @param {string} typedText - Text entered by the candidate
 * @param {number} durationSeconds - Test elapsed time in seconds (e.g., 60)
 * @returns {object} Calculated metrics object
 */
export function calculateTypingMetrics(originalPassage = '', typedText = '', durationSeconds = 60) {
  const safeOriginal = String(originalPassage || '');
  const safeTyped = String(typedText || '');
  const duration = Math.max(1, Number(durationSeconds) || 60);
  const minutes = duration / 60;

  const totalCharacters = safeTyped.length;
  let correctCharacters = 0;
  let incorrectCharacters = 0;

  // Character-by-character comparison
  for (let i = 0; i < totalCharacters; i++) {
    if (i < safeOriginal.length && safeTyped[i] === safeOriginal[i]) {
      correctCharacters++;
    } else {
      incorrectCharacters++;
    }
  }

  const errors = incorrectCharacters;

  // Unified WPM: (Correct characters / 5) / minutes
  // Standard typing calculation reflecting actual correctly typed words per minute
  const rawWpm = (correctCharacters / 5) / minutes;
  const wpm = Number.isFinite(rawWpm) ? Math.max(0, Math.round(rawWpm * 10) / 10) : 0;

  // Accuracy: (Correct characters / Total typed characters) * 100
  let rawAccuracy = 0;
  if (totalCharacters > 0) {
    rawAccuracy = (correctCharacters / totalCharacters) * 100;
  }
  const accuracy = Number.isFinite(rawAccuracy) ? Math.round(rawAccuracy * 10) / 10 : 0;

  return {
    wpm,
    grossWpm: wpm,
    netWpm: wpm,
    accuracy: Math.min(100, Math.max(0, accuracy)),
    errors,
    correctCharacters,
    incorrectCharacters,
    totalCharacters,
    durationSeconds: duration
  };
}

/**
 * Formats numbers safely for display
 */
export function formatMetric(val, fallback = '0') {
  if (val === undefined || val === null || Number.isNaN(val) || !Number.isFinite(Number(val))) {
    return fallback;
  }
  return String(val);
}

/**
 * Formats duration in mm:ss format
 */
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
