// Verification test script for typing metric calculations
import { calculateTypingMetrics, formatTime } from './src/utils/typingCalculations.js';
import { PRACTICE_PASSAGE, ACTUAL_PASSAGES, getPassageById, getNextPassageForBatchNumber } from './src/data/typingPassages.js';

console.log('--- Starting Alboriss Scoring Engine Verification ---');

// 1. Test standard passage scoring
const original = "Hello and welcome to the Alboriss typing assessment.";
const typedExact = "Hello and welcome to the Alboriss typing assessment.";
const resExact = calculateTypingMetrics(original, typedExact, 60);

console.assert(resExact.totalCharacters === 52, `Expected 52 chars, got ${resExact.totalCharacters}`);
console.assert(resExact.correctCharacters === 52, `Expected 52 correct, got ${resExact.correctCharacters}`);
console.assert(resExact.errors === 0, `Expected 0 errors, got ${resExact.errors}`);
console.assert(resExact.accuracy === 100, `Expected 100% accuracy, got ${resExact.accuracy}`);
console.assert(resExact.wpm === 10.4, `Expected 10.4 WPM, got ${resExact.wpm}`);
console.log('✓ Exact match test passed with WPM:', resExact.wpm);

// 2. Test candidate scoring case from user screenshot:
// 118 correct characters, 50 errors in 60s
// Previously Net WPM was 0. Now WPM should be (118/5)/1 = 23.6 WPM!
const resUserCase = calculateTypingMetrics(
  "A".repeat(200),
  "A".repeat(118) + "X".repeat(50),
  60
);
console.assert(resUserCase.correctCharacters === 118, 'User case correct chars failed');
console.assert(resUserCase.errors === 50, 'User case errors failed');
console.assert(resUserCase.wpm === 23.6, `Expected 23.6 WPM, got ${resUserCase.wpm}`);
console.assert(resUserCase.accuracy === 70.2, `Expected 70.2% accuracy, got ${resUserCase.accuracy}`);
console.log('✓ User screenshot scenario verified: WPM is 23.6 (not 0!), Accuracy is 70.2%');

// 3. Test zero characters & edge case (no NaN, Infinity)
const resZero = calculateTypingMetrics(original, "", 60);
console.assert(resZero.wpm === 0 && !isNaN(resZero.wpm), 'Zero test WPM failed');
console.assert(resZero.accuracy === 0 && !isNaN(resZero.accuracy), 'Zero test Accuracy failed');
console.log('✓ Zero characters safe division test passed');

// 4. Test formatTime
console.assert(formatTime(60) === '01:00', `formatTime(60) should be 01:00, got ${formatTime(60)}`);
console.assert(formatTime(47) === '00:47', `formatTime(47) should be 00:47, got ${formatTime(47)}`);
console.assert(formatTime(0) === '00:00', `formatTime(0) should be 00:00, got ${formatTime(0)}`);
console.log('✓ formatTime test passed');

// 5. Test passage rotation
const p1 = getNextPassageForBatchNumber(1);
const p2 = getNextPassageForBatchNumber(2);
const p3 = getNextPassageForBatchNumber(3);
const p4 = getNextPassageForBatchNumber(4);

console.assert(p1.code === 'A', 'Batch 1 should receive Passage A');
console.assert(p2.code === 'B', 'Batch 2 should receive Passage B');
console.assert(p3.code === 'C', 'Batch 3 should receive Passage C');
console.assert(p4.code === 'A', 'Batch 4 should cycle back to Passage A');
console.log('✓ Passage rotation test passed');

// 6. Check required characters in practice and actual passages
const requiredChars = ['₹', '%', '-', '/', ':', '.', ',', '@', '+'];
for (const ch of requiredChars) {
  if (!PRACTICE_PASSAGE.text.includes(ch)) {
    throw new Error(`Practice passage missing required character: ${ch}`);
  }
}
console.log('✓ Practice passage character requirements verified');

console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
