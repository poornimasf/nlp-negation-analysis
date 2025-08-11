import * as XLSX from 'xlsx';

export const exportToXLSX = (results, mode) => {
  // Helper function to get likelihood description
  const getLikelihoodDescription = (score) => {
    if (!score) return '';
    switch(score) {
      case 1: return 'Highly Unlikely';
      case 2: return 'Unlikely';
      case 3: return 'Somewhat Unlikely';
      case 4: return 'Neutral/Optional';
      case 5: return 'Somewhat Likely';
      case 6: return 'Likely';
      case 7: return 'Highly Likely';
      default: return '';
    }
  };

  // Format data to exactly match UI table columns ONLY
  const data = results.map(result => {
    const exportData = {
      'Original Sentence': result.text,
      'Analysis': result.label,
      'Prediction': result.classification,
    };

    // Add Likelihood column only for rule-based mode (matches UI behavior exactly)
    if (mode === 'RULE_BASED' && result.likelihood) {
      exportData['Likelihood of NE'] = `${result.likelihood}/7 (${getLikelihoodDescription(result.likelihood)})`;
    }

    return exportData;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 50 }, // Original Sentence
    { wch: 80 }, // Analysis
    { wch: 15 }, // Prediction
  ];

  // Add Likelihood of NE column width if present
  if (mode === 'RULE_BASED') {
    columnWidths.push({ wch: 25 }); // Likelihood of NE
  }

  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis Results');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `french-negation-analysis-${mode.toLowerCase()}-${timestamp}.xlsx`;

  // Download the file
  XLSX.writeFile(workbook, filename);
};
