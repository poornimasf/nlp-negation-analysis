import { normalizeText } from './textProcessing';

// Process and validate training data
export const processTrainingData = (data) => {
  const processedData = [];
  const stats = {
    totalExamples: 0,
    expletiveExamples: 0,
    logicalExamples: 0,
    peurQueExamples: 0,
    avantQueExamples: 0,
    peuSenFautExamples: 0,
    otherExamples: 0,
    lastUpdated: new Date().toISOString()
  };

  if (!Array.isArray(data)) {
    throw new Error('Invalid training data format: expected an array');
  }

  data.forEach((row, index) => {
    // Handle different possible column names
    const text = row.text || row.sentence || row.example || '';
    const hasExpletive = row.has_expletive_ne || row.expletive || row.is_expletive || false;
    const trigger = row.trigger || row.construction || '';
    const classification = row.classification || row.type || '';

    if (!text || !text.trim()) {
      console.warn(`Skipping row ${index + 1}: Missing text`);
      return;
    }

    // Convert string boolean values
    const isExpletive = typeof hasExpletive === 'string' 
      ? hasExpletive.toLowerCase() === 'true' || hasExpletive.toLowerCase() === 'expletive'
      : Boolean(hasExpletive);

    // Detect trigger if not provided
    let detectedTrigger = trigger;
    const normalizedText = normalizeText(text.toLowerCase());
    
    if (!detectedTrigger) {
      // Fear expressions
      if (/(peur|craindre|redouter|douter)\b.*\bque\b/i.test(normalizedText)) {
        detectedTrigger = normalizedText.includes('peur') ? 'peur que' : 'craindre';
      }
      // Temporal expressions
      else if (/(avant|jusqu['']a)\b.*\bque\b/i.test(normalizedText)) {
        detectedTrigger = 'avant que';
      }
      // Impersonal expressions
      else if (/\b(peu\s+s['']en\s+faut|il\s+s['']en\s+faut)/i.test(normalizedText)) {
        detectedTrigger = 'peu s\'en faut';
      }
      // Other common triggers
      else if (/\b(eviter|empecher)\b/i.test(normalizedText)) {
        detectedTrigger = normalizedText.includes('eviter') ? 'éviter' : 'empêcher';
      }
    }

    // Map to simple trigger names
    let simpleTrigger = detectedTrigger;
    const normalizedTrigger = normalizeText(detectedTrigger);
    
    if (normalizedTrigger) {
      if (/(peur|crainte)\b.*\bque\b/i.test(normalizedTrigger)) {
        simpleTrigger = 'peur que';
      }
      else if (/\bcrain/i.test(normalizedTrigger)) simpleTrigger = 'craindre';
      else if (/\bredout/i.test(normalizedTrigger)) simpleTrigger = 'redouter';
      else if (/\bdout/i.test(normalizedTrigger)) simpleTrigger = 'douter';
      else if (/\bavant\b.*\bque\b/i.test(normalizedTrigger)) simpleTrigger = 'avant que';
      else if (/\bpeu\s+s['']en\b/i.test(normalizedTrigger)) simpleTrigger = 'peu s\'en faut';
      else if (/\bevit/i.test(normalizedTrigger)) simpleTrigger = 'éviter';
      else if (/\bempech/i.test(normalizedTrigger)) simpleTrigger = 'empêcher';
    }

    // Accept all examples, even without recognized triggers
    const processedRow = {
      id: index + 1,
      text: text.trim(),
      has_expletive_ne: isExpletive,
      trigger: simpleTrigger || 'unknown',
      classification: classification || (isExpletive ? 'expletive' : 'logical')
    };

    processedData.push(processedRow);
    stats.totalExamples++;
    
    if (isExpletive) {
      stats.expletiveExamples++;
    } else {
      stats.logicalExamples++;
    }

    // Count by trigger type
    if (simpleTrigger) {
      const normalizedSimpleTrigger = normalizeText(simpleTrigger);
      if (/peur.*que/i.test(normalizedSimpleTrigger)) {
        stats.peurQueExamples++;
      } else if (/avant.*que/i.test(normalizedSimpleTrigger)) {
        stats.avantQueExamples++;
      } else if (/peu.*s['']en/i.test(normalizedSimpleTrigger)) {
        stats.peuSenFautExamples++;
      } else {
        stats.otherExamples++;
      }
    } else {
      stats.otherExamples++;
    }
  });

  return { processedData, stats };
};

// Handle file upload
export const handleFileUpload = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileType = file.name.split('.').pop().toLowerCase();
  
  if (fileType !== 'json') {
    throw new Error('Please upload a JSON file. CSV support has been removed to ensure reliable parsing of complex French sentences.');
  }

  try {
    const text = await file.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON format. Please check the file format.');
    }

    // Handle both array and object formats
    const examples = Array.isArray(jsonData) ? jsonData : 
                    jsonData.examples ? jsonData.examples :
                    jsonData.data ? jsonData.data : null;

    if (!examples || !Array.isArray(examples)) {
      throw new Error('Invalid JSON structure. Expected an array of examples or an object with an "examples" array.');
    }

    // Validate basic structure
    if (examples.length === 0) {
      throw new Error('No training examples found in the file.');
    }

    // Process the data
    return processTrainingData(examples);

  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
};
