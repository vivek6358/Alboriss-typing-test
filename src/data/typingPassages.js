/**
 * ALBORISS TYPING ASSESSMENT - PASSAGE CONFIGURATION
 * Contains structured passages for Practice and Actual candidate batches.
 * Natural mix of letters, uppercase, lowercase, numbers, dates, times,
 * currency (₹), decimals, percentages, hyphens, and contact details.
 */

export const PRACTICE_PASSAGE = {
  id: 'practice_default',
  title: 'Default Practice Passage',
  text: "Hello and welcome to the Alboriss typing assessment. Please enter the details carefully and focus on both speed and accuracy. Example: Name - Rahul Kumar, Age - 23, Date - 17/09/2026, Time - 10:30 AM. The total amount is ₹850.50, including 5% tax. For help, contact us at help@example.com or call +91-98765-43210. Please check your typing before the practice time ends."
};

export const ACTUAL_PASSAGES = [
  {
    id: 'passage_a',
    name: 'Actual Passage A (Standard Operations)',
    code: 'A',
    text: "Our team works together to provide quality service and accurate information. Please enter the details correctly: Order No. - AB-2456, Date - 18/09/2026, Time - 11:45 AM. The payment received was ₹1,475.25, including 8% tax. If you have any questions, please email hr@example.com or call +91-91234-56789. Remember to review all information carefully before completing the task."
  },
  {
    id: 'passage_b',
    name: 'Actual Passage B (Customer Verification)',
    code: 'B',
    text: "Customer records must always be maintained with high precision and confidentiality. Reference: File Ref - AL-8921, Date - 19/09/2026, Time - 02:15 PM. The calculated invoice is ₹2,640.75, with an approved 12% discount. In case of verification issues, send an inquiry to support@example.com or phone +91-98111-22334. Accuracy and prompt attention remain our highest priority."
  },
  {
    id: 'passage_c',
    name: 'Actual Passage C (Account Processing)',
    code: 'C',
    text: "Careful verification ensures smooth business communication and dependable operational records. Notice: Voucher No. - VC-5178, Date - 20/09/2026, Time - 04:30 PM. The final transaction equals ₹3,180.00, after adding 18% service charges. For administrative confirmation, notify operations@example.com or dial +91-97000-88991. Double-check each entry before concluding your submission."
  }
];

export const getPassageById = (passageId) => {
  return ACTUAL_PASSAGES.find(p => p.id === passageId) || ACTUAL_PASSAGES[0];
};

export const getNextPassageForBatchNumber = (batchNumber) => {
  const index = (Math.max(1, batchNumber) - 1) % ACTUAL_PASSAGES.length;
  return ACTUAL_PASSAGES[index];
};
