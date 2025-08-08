import * as XLSX from 'xlsx';

export const exportToXLSX = (results, mode) => {
  // Format data for export
  const data = results.map(result => {
    // Extract evidence from the label
    const triggerMatch = result.label.match(/Trigger: "(.*?)"/i) || 
                        result.label.match(/Found: "(.*?)"/i);
    const trigger = triggerMatch?.[1] || '';
    
    const confidenceMatch = result.label.match(/Confidence: (\d+)%/i);
    const confidence = confidenceMatch?.[1] || '';
    
    const nePositionMatch = result.label.match(/NE Position: (\d+)/i) || 
                           result.label.match(/Suggested position: (\d+)/i);
    const nePosition = nePositionMatch?.[1] || '';

    const detailsMatch = result.label.match(/Details:\n(.*?)(?=\n\n|$)/s);
    const details = detailsMatch?.[1]?.replace(/^[•○◆▫▪◇-]\s*/gm, '') || '';

    // Base data common to all modes
    const baseData = {
      'Input Text': result.text,
      'Classification': result.classification,
      'Confidence': confidence + '%',
      'Trigger': trigger,
      'Surface Form': result.surfaceForm || 'No change suggested' // NEW: Add surface form
    };

    // Add mode-specific columns
    switch (mode) {
      case 'TRAINING_DATA':
        return {
          ...baseData,
          'Has Expletive Ne': result.classification === 'Expletive' ? 'Yes' : 'No',
          'Ne Position': nePosition,
          'Similar Examples': details.split('\n').filter(line => line.includes('Example:')).join('; '),
          'Evidence': details.split('\n').filter(line => !line.includes('Example:')).join('; '),
          'Proposed Sentence': result.proposedSentence || ''
        };

      case 'RULE_BASED':
        return {
          ...baseData,
          'Trigger Category': result.label.match(/Category: (.*?)(?:\n|$)/i)?.[1] || '',
          'Has Subjunctive': result.label.includes('subjunctive found') ? 'Yes' : 'No',
          'Ne Position': nePosition,
          'Evidence': details,
          'Proposed Sentence': result.proposedSentence || ''
        };

      case 'HYBRID':
        const llmAnalysis = result.label.match(/Analysis:\n(.*?)(?=\n\n|$)/s)?.[1] || '';
        const reasoning = result.label.match(/Reasoning:\n(.*?)(?=\n\n|$)/s)?.[1] || '';
        return {
          ...baseData,
          'LLM Analysis': llmAnalysis.replace(/\n/g, ' '),
          'Reasoning': reasoning.replace(/\n/g, ' '),
          'Ne Position': nePosition,
          'Evidence': details,
          'Proposed Sentence': result.proposedSentence || ''
        };

      default:
        return {
          ...baseData,
          'Analysis Details': details,
          'Ne Position': nePosition,
          'Proposed Sentence': result.proposedSentence || ''
        };
    }
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths based on mode
  const baseWidths = [
    { wch: 50 },  // Input Text
    { wch: 15 },  // Classification
    { wch: 10 },  // Confidence
    { wch: 20 }   // Trigger
  ];

  const modeSpecificWidths = {
    'TRAINING_DATA': [
      { wch: 15 },  // Has Expletive Ne
      { wch: 10 },  // Ne Position
      { wch: 50 },  // Similar Examples
      { wch: 50 },  // Evidence
      { wch: 50 }   // Proposed Sentence
    ],
    'RULE_BASED': [
      { wch: 20 },  // Trigger Category
      { wch: 15 },  // Has Subjunctive
      { wch: 10 },  // Ne Position
      { wch: 50 },  // Evidence
      { wch: 50 }   // Proposed Sentence
    ],
    'HYBRID': [
      { wch: 50 },  // LLM Analysis
      { wch: 50 },  // Reasoning
      { wch: 10 },  // Ne Position
      { wch: 50 },  // Evidence
      { wch: 50 }   // Proposed Sentence
    ]
  };

  ws['!cols'] = [...baseWidths, ...(modeSpecificWidths[mode] || [
    { wch: 50 },  // Analysis Details
    { wch: 10 },  // Ne Position
    { wch: 50 }   // Proposed Sentence
  ])];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Analysis Results');

  // Generate filename with timestamp and mode
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `negation-analysis-${mode.toLowerCase()}-${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};
