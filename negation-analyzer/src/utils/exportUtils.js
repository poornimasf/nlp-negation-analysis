import * as XLSX from 'xlsx';

export const exportToXLSX = (results, mode) => {
  // Format data for export
  const data = results.map(result => {
    const baseData = {
      'Text': result.text,
      'Classification': result.classification,
      'Trigger': result.label.match(/trigger: "(.*?)"/)?.[1] || ''
    };

    // Add mode-specific columns
    switch (mode) {
      case 'TRAINING_DATA':
        return {
          ...baseData,
          'Has Expletive NE': result.classification === 'Expletive',
          'NE Position': result.label.match(/ne position: (\d+)/)?.[1] || null,
          'Proposed Sentence': result.proposedSentence || ''
        };
      case 'HYBRID': // CroissantLLM
        return {
          ...baseData,
          'LLM Confidence': result.label.match(/confidence: (\d+%)/)?.[1] || '',
          'LLM Analysis': result.label.replace(/\\n/g, ' ').replace(/[\\r\\n]+/g, ' '),
          'Proposed Sentence': result.proposedSentence || ''
        };
      default:
        return {
          ...baseData,
          'Analysis Details': result.label.replace(/\\n/g, ' ').replace(/[\\r\\n]+/g, ' '),
          'Proposed Sentence': result.proposedSentence || ''
        };
    }
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Add column widths
  const colWidths = [
    { wch: 50 },  // Text
    { wch: 15 },  // Classification
    { wch: 15 },  // Trigger
    { wch: 15 },  // Mode-specific columns
    { wch: 50 }   // Analysis/Proposed Sentence
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Analysis Results');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `negation-analysis-${mode.toLowerCase()}-${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};
