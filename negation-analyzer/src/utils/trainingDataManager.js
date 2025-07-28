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

    // Detect trigger if not provided, handling accents
    let detectedTrigger = trigger;
    if (!detectedTrigger) {
      const normalizedText = normalizeText(text.toLowerCase());
      if (normalizedText.includes('peur') && normalizedText.includes('que')) {
        detectedTrigger = 'peur que';
      } else if (normalizedText.includes('avant') && normalizedText.includes('que')) {
        detectedTrigger = 'avant que';
      } else if (normalizedText.includes('peu s\'en faut') || normalizedText.includes('s\'en faut')) {
        detectedTrigger = 'peu s\'en faut';
      }
    }

    // Map to simple trigger names, handling accents
    let simpleTrigger = detectedTrigger;
    const normalizedTrigger = normalizeText(detectedTrigger);
    if (normalizedTrigger) {
      if (normalizedTrigger.includes('peur')) simpleTrigger = 'peur que';
      else if (normalizedTrigger.includes('avant')) simpleTrigger = 'avant que';
      else if (normalizedTrigger.includes('peu s\'en') || normalizedTrigger.includes('s\'en faut')) {
        simpleTrigger = 'peu s\'en faut';
      }
      else if (normalizedTrigger.includes('crain')) simpleTrigger = 'craindre';
      else if (normalizedTrigger.includes('redout')) simpleTrigger = 'redouter';
      else if (normalizedTrigger.includes('dout')) simpleTrigger = 'douter';
      else if (normalizedTrigger.includes('evit')) simpleTrigger = 'éviter';
      else if (normalizedTrigger.includes('empech')) simpleTrigger = 'empêcher';
    }

    // Validate trigger
    const validTriggers = [
      "peur que", "avant que", "peu s'en faut",
      "craindre", "redouter", "douter", "éviter", "empêcher"
    ];

    if (simpleTrigger && validTriggers.some(t => normalizeText(t) === normalizeText(simpleTrigger))) {
      const processedRow = {
        id: index + 1,
        text: text.trim(),
        has_expletive_ne: isExpletive,
        trigger: simpleTrigger,
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
      const normalizedSimpleTrigger = normalizeText(simpleTrigger);
      if (normalizedSimpleTrigger === normalizeText('peur que')) {
        stats.peurQueExamples++;
      } else if (normalizedSimpleTrigger === normalizeText('avant que')) {
        stats.avantQueExamples++;
      } else if (normalizedSimpleTrigger === normalizeText('peu s\'en faut')) {
        stats.peuSenFautExamples++;
      }
    } else {
      console.warn(`Skipping row ${index + 1}: Invalid trigger "${simpleTrigger}"`);
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

  const text = await file.text();
  const jsonData = JSON.parse(text);

  if (!Array.isArray(jsonData)) {
    throw new Error('Invalid JSON format. Please ensure the file contains an array of training examples.');
  }

  // Validate JSON structure
  const requiredFields = ['text'];
  const sampleItem = jsonData[0];
  const missingFields = requiredFields.filter(field => !(field in sampleItem));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}. Each training example must have at least a 'text' field.`);
  }

  return processTrainingData(jsonData);
};
