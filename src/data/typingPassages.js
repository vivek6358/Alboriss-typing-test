/**
 * ALBORISS TYPING ASSESSMENT - PASSAGE CONFIGURATION
 * Contains structured passages for Practice and Actual candidate batches.
 * Natural mix of letters, uppercase, lowercase, numbers, dates, times,
 * currency (₹), decimals, percentages, hyphens, and contact details.
 * Distinct passages for both Practice and Actual assessment per batch.
 */

export const PRACTICE_PASSAGES = [
  {
    id: 'practice_1',
    batchNum: 1,
    title: 'Practice Passage 1 (Batch 01)',
    text: "Hello and welcome to the Alboriss typing assessment. Please enter the details carefully and focus on both speed and accuracy. Example: Name - Rahul Kumar, Age - 23, Date - 17/09/2026, Time - 10:30 AM. The total amount is ₹850.50, including 5% tax. For help, contact us at help@example.com or call +91-98765-43210. Please check your typing before the practice time ends."
  },
  {
    id: 'practice_2',
    batchNum: 2,
    title: 'Practice Passage 2 (Batch 02)',
    text: "Welcome to the candidate practice evaluation session. Please enter the registration data accurately: Candidate - Sneha Verma, ID - SV-4190, Date - 18/09/2026, Time - 11:15 AM. The processed fee is ₹920.00, along with a 6% processing fee. Inquiries may be emailed to admissions@example.com or phone +91-98222-33445. Ensure every word and number matches the text."
  },
  {
    id: 'practice_3',
    batchNum: 3,
    title: 'Practice Passage 3 (Batch 03)',
    text: "This orientation round helps candidates become familiar with our entry platform. Sample Entry: Officer - Amit Patel, Desk - DP-108, Date - 19/09/2026, Time - 01:45 PM. The total settlement is ₹1,150.75, including 7% state surcharge. For technical support, write to support@example.com or call +91-98333-44556. Pay close attention to punctuation and symbols."
  },
  {
    id: 'practice_4',
    batchNum: 4,
    title: 'Practice Passage 4 (Batch 04)',
    text: "Review the displayed statements carefully before submitting your practice typing test. Case Info: Client - Priya Nair, Ref - PN-7731, Date - 20/09/2026, Time - 03:00 PM. The billed amount is ₹760.25, with 4% delivery charge. For questions regarding your test, contact desk@example.com or dial +91-98444-55667. Maintain a steady rhythm and watch your speed."
  },
  {
    id: 'practice_5',
    batchNum: 5,
    title: 'Practice Passage 5 (Batch 05)',
    text: "Please take this opportunity to inspect keyboard responsiveness and layout clarity. Entry Form: Analyst - Vikram Rao, Batch - VR-205, Date - 21/09/2026, Time - 04:20 PM. The final payable charge is ₹1,340.00, including 9% service cess. To contact our help desk, email helpdesk@example.com or ring +91-98555-66778. Confirm your keystrokes thoroughly."
  },
  {
    id: 'practice_6',
    batchNum: 6,
    title: 'Practice Passage 6 (Batch 06)',
    text: "Careful keystrokes produce reliable records and reduce data discrepancies. Record Profile: Specialist - Ananya Das, Ticket - AD-6602, Date - 22/09/2026, Time - 05:10 PM. The estimated cost is ₹1,080.50, with 5.5% administrative levy. Direct all inquiries to info@example.com or call +91-98666-77889. Complete your trial run with calm focus."
  }
];

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
  },
  {
    id: 'passage_d',
    name: 'Actual Passage D (Inventory Distribution)',
    code: 'D',
    text: "Dispatch teams must verify invoice serials and quantity entries before loading cargo. Shipment: Docket ID - SH-9042, Date - 21/09/2026, Time - 09:15 AM. The consignment value stands at ₹4,520.50, subject to 10% customs fee. Any logistical delays must be reported to logistics@example.com or telephone +91-97111-00223. Correct alphanumeric entry prevents transit delays."
  },
  {
    id: 'passage_e',
    name: 'Actual Passage E (Billing Reconciliation)',
    code: 'E',
    text: "Reconciliation protocols demand precise character entry and timely transaction updates. Audit Note: Ledger Ref - BL-3390, Date - 22/09/2026, Time - 03:45 PM. The balance credited is ₹3,890.25, including 15% regional cess. If discrepancies occur, immediately message finance@example.com or call +91-97222-33441. Review commas and decimal positions before finalization."
  },
  {
    id: 'passage_f',
    name: 'Actual Passage F (Administrative Documentation)',
    code: 'F',
    text: "Executive correspondence requires attentive oversight and compliance with corporate filing guidelines. Memo: File Tracking - AD-7105, Date - 23/09/2026, Time - 01:20 PM. The approved budget limit is ₹5,250.00, with 6.5% contingency allocation. For official approvals, contact corporate@example.com or call +91-97333-55662. Systematic formatting preserves company records."
  }
];

export const getPassageById = (passageId) => {
  return ACTUAL_PASSAGES.find(p => p.id === passageId) || ACTUAL_PASSAGES[0];
};

export const getPracticePassageForBatch = (batch) => {
  const batchNum = Number(batch?.batch_number) || 1;
  const index = (Math.max(1, batchNum) - 1) % PRACTICE_PASSAGES.length;
  return PRACTICE_PASSAGES[index];
};

export const getNextPassageForBatchNumber = (batchNumber) => {
  const index = (Math.max(1, Number(batchNumber) || 1) - 1) % ACTUAL_PASSAGES.length;
  return ACTUAL_PASSAGES[index];
};

// Fallback compatibility
export const PRACTICE_PASSAGE = PRACTICE_PASSAGES[0];
