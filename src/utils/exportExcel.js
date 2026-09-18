import * as XLSX from 'xlsx';

/**
 * Formats a Date object or ISO string to separate readable Date and Time strings
 */
function formatDateTime(isoString) {
  if (!isoString) return { date: '-', time: '-' };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: '-', time: '-' };
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return { date, time, full: `${date} ${time}` };
  } catch {
    return { date: '-', time: '-', full: '-' };
  }
}

/**
 * Export a single batch with Sheet 1 (Results), Sheet 2 (Invalid Attempts), Sheet 3 (Summary)
 */
export function exportBatchToExcel(batch, attempts = []) {
  const wb = XLSX.utils.book_new();
  const batchName = batch?.name || `Batch_${batch?.batch_number || '01'}`;
  const safeFileBatchName = batchName.replace(/\s+/g, '_');

  // 1. Valid / Completed Attempts sorted Net WPM desc -> Accuracy desc -> Errors asc
  const completedAttempts = attempts
    .filter(a => a.status === 'COMPLETED')
    .sort((a, b) => {
      if (b.net_wpm !== a.net_wpm) return b.net_wpm - a.net_wpm;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.errors - b.errors;
    });

  // Sheet 1: Results
  const resultsData = completedAttempts.map((item, index) => {
    const dt = formatDateTime(item.test_completed_at || item.created_at);
    const wpmVal = Number(item.wpm ?? item.net_wpm ?? item.gross_wpm ?? 0);
    return {
      'Rank': index + 1,
      'Candidate Name': item.candidate_name,
      'Batch': batchName,
      'Speed (WPM)': wpmVal,
      'Accuracy (%)': `${Number(item.accuracy || 0)}%`,
      'Errors': Number(item.errors || 0),
      'Correct Characters': Number(item.correct_characters || 0),
      'Incorrect Characters': Number(item.incorrect_characters || 0),
      'Total Characters': Number(item.total_characters || 0),
      'Duration (sec)': Number(item.duration_seconds || 60),
      'Test Date': dt.date,
      'Test Time': dt.time,
      'Status': item.status
    };
  });

  const wsResults = XLSX.utils.json_to_sheet(resultsData.length > 0 ? resultsData : [
    { 'Rank': '-', 'Candidate Name': 'No completed attempts yet', 'Batch': batchName }
  ]);
  wsResults['!cols'] = [
    { wch: 8 }, { wch: 24 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsResults, 'Results');

  // Sheet 2: Invalid Attempts
  const invalidAttempts = attempts.filter(a => a.status === 'INVALID');
  const invalidData = invalidAttempts.map((item) => {
    const dt = formatDateTime(item.test_completed_at || item.created_at);
    return {
      'Candidate Name': item.candidate_name,
      'Batch': batchName,
      'Reason': item.invalid_reason || 'Page Reload / Left Assessment',
      'Timestamp': dt.full,
      'Status': item.status
    };
  });

  const wsInvalid = XLSX.utils.json_to_sheet(invalidData.length > 0 ? invalidData : [
    { 'Candidate Name': 'None', 'Batch': batchName, 'Reason': 'No invalid attempts recorded', 'Timestamp': '-', 'Status': '-' }
  ]);
  wsInvalid['!cols'] = [
    { wch: 24 }, { wch: 14 }, { wch: 50 }, { wch: 24 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsInvalid, 'Invalid Attempts');

  // Sheet 3: Summary
  const totalCandidates = attempts.length;
  const completedCount = completedAttempts.length;
  const invalidCount = invalidAttempts.length;
  const avgWpm = completedCount > 0
    ? Math.round((completedAttempts.reduce((sum, c) => sum + Number(c.net_wpm || 0), 0) / completedCount) * 10) / 10
    : 0;
  const avgAccuracy = completedCount > 0
    ? Math.round((completedAttempts.reduce((sum, c) => sum + Number(c.accuracy || 0), 0) / completedCount) * 10) / 10
    : 0;
  const highestWpm = completedCount > 0
    ? Math.max(...completedAttempts.map(c => Number(c.net_wpm || 0)))
    : 0;
  const lowestWpm = completedCount > 0
    ? Math.min(...completedAttempts.map(c => Number(c.net_wpm || 0)))
    : 0;

  const summaryData = [
    {
      'Batch': batchName,
      'Total Candidates': totalCandidates,
      'Completed': completedCount,
      'Invalid': invalidCount,
      'Average WPM': avgWpm,
      'Average Accuracy (%)': `${avgAccuracy}%`,
      'Highest WPM': highestWpm,
      'Lowest WPM': lowestWpm
    }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Download file
  const filename = `Alboriss_Typing_Assessment_${safeFileBatchName}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Master Export: All Results across all batches
 * Filename: Alboriss_Typing_Assessment_All_Results.xlsx
 */
export function exportAllResultsToExcel(allAttempts = [], batchesMap = {}) {
  const wb = XLSX.utils.book_new();

  // Columns: Batch, Candidate Name, Gross WPM, Net WPM, Accuracy, Errors, Status, Timestamp
  const sorted = [...allAttempts].sort((a, b) => {
    // Sort completed first by Net WPM desc, then timestamp desc
    if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
    if (b.status === 'COMPLETED' && a.status !== 'COMPLETED') return 1;
    if (a.status === 'COMPLETED' && b.status === 'COMPLETED') {
      return (Number(b.net_wpm) || 0) - (Number(a.net_wpm) || 0);
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const masterData = sorted.map(item => {
    const batchName = batchesMap[item.batch_id]?.name || `Batch ${item.batch_id?.slice(0, 4) || '—'}`;
    const dt = formatDateTime(item.test_completed_at || item.created_at);
    const wpmVal = Number(item.wpm ?? item.net_wpm ?? item.gross_wpm ?? 0);
    return {
      'Batch': batchName,
      'Candidate Name': item.candidate_name,
      'Speed (WPM)': wpmVal,
      'Accuracy (%)': `${Number(item.accuracy || 0)}%`,
      'Errors': Number(item.errors || 0),
      'Status': item.status,
      'Timestamp': dt.full
    };
  });

  const wsMaster = XLSX.utils.json_to_sheet(masterData.length > 0 ? masterData : [
    { 'Batch': '-', 'Candidate Name': 'No candidate records found' }
  ]);
  wsMaster['!cols'] = [
    { wch: 16 }, { wch: 24 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 24 }
  ];

  XLSX.utils.book_append_sheet(wb, wsMaster, 'All Candidate Results');

  const filename = 'Alboriss_Typing_Assessment_All_Results.xlsx';
  XLSX.writeFile(wb, filename);
}
