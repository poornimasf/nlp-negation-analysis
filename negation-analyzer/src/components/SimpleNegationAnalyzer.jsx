import React, { useState } from 'react';
import './NegationAnalyzer.css';
import * as XLSX from 'xlsx';

export default function SimpleNegationAnalyzer() {
  // Basic state
  const [inputText, setInputText] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [result, setResult] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Feature flags
  const [useExpletiveLogic, setUseExpletiveLogic] = useState(true);
  const [enableTrainingData, setEnableTrainingData] = useState(false);
  
  // Training data state
  const [trainingData, setTrainingData] = useState([]);
  const [trainingStats, setTrainingStats] = useState({
    totalExamples: 0,
    expletiveExamples: 0,
    logicalExamples: 0,
    peurQueExamples: 0,
    avantQueExamples: 0,
    lastUpdated: null
  });
  const [uploadError, setUploadError] = useState(null);
  const [useTrainingEnhancement, setUseTrainingEnhancement] = useState(false);

  // Focused triggers for French expletive negation
  const TRIGGERS = ["peur que", "avant que"];

  // Basic analysis functions
  const hasNegation = (text) => {
    return /\bne\b([^a-zA-Z]|\s|$)/i.test(text);
  };

  const extractComplement = (text, trigger) => {
    const idx = text.toLowerCase().indexOf(trigger);
    if (idx === -1) return "";
    const after = text.slice(idx + trigger.length);
    return after.split(/[.?!]/)[0];
  };

  const highlight = (text) => {
    let output = text;
    // Highlight the two specific triggers
    for (const trigger of TRIGGERS) {
      const re = new RegExp(`(${trigger})`, "gi");
      output = output.replace(re, '<span class="highlight-yellow">$1</span>');
    }
    // Highlight "ne"
    output = output.replace(/\b(ne)\b/gi, '<span class="highlight-green">$1</span>');
    return output;
  };

  // Simple classification without expletive logic
  const classifyBasic = (text) => {
    const lowerText = text.toLowerCase();
    const hasNe = hasNegation(lowerText);
    
    if (!hasNe) {
      return "No 'ne' negation detected.";
    }
    
    // Check for logical negation markers
    const hasLogicalNegation = /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i.test(lowerText);
    
    if (hasLogicalNegation) {
      return "Logical negation detected: 'ne' + pas/rien/jamais/etc.";
    }
    
    return "Negation detected: 'ne' without logical markers.";
  };

  // Full expletive negation classification
  const classifyExpletive = (text) => {
    const lowerText = text.toLowerCase();
    const foundTrigger = TRIGGERS.find(trigger => lowerText.includes(trigger));
    const hasNe = hasNegation(lowerText);
    
    // No trigger found
    if (!foundTrigger) {
      if (hasNe) {
        return "Negation found, but no 'peur que' or 'avant que' trigger detected.";
      }
      return "No expletive negation triggers ('peur que' or 'avant que') found.";
    }

    // Trigger found, check for negation
    if (!hasNe) {
      return `Found '${foundTrigger}' but no 'ne' detected. No expletive negation.`;
    }

    // Both trigger and "ne" found - analyze the complement clause
    const complement = extractComplement(lowerText, foundTrigger);
    const complementHasNe = hasNegation(complement);

    if (!complementHasNe) {
      return `Found '${foundTrigger}' and 'ne', but 'ne' is not in the complement clause.`;
    }

    // Check for logical negation markers after "ne"
    const hasLogicalNegation = /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i.test(complement);
    
    if (hasLogicalNegation) {
      return `'${foundTrigger}' + logical negation (ne + pas/rien/jamais/etc.). Not expletive.`;
    }

    // Pure expletive negation detected
    return `✅ EXPLETIVE NEGATION: '${foundTrigger}' + expletive 'ne' (without logical negation markers).`;
  };

  // Training data processing functions
  const processTrainingData = (data) => {
    const processedData = [];
    const stats = {
      totalExamples: 0,
      expletiveExamples: 0,
      logicalExamples: 0,
      peurQueExamples: 0,
      avantQueExamples: 0,
      lastUpdated: new Date().toISOString()
    };

    data.forEach((row, index) => {
      // Handle different possible column names
      const text = row.text || row.sentence || row.example || '';
      const hasExpletive = row.has_expletive_ne || row.expletive || row.is_expletive || false;
      const trigger = row.trigger || row.construction || '';
      const classification = row.classification || row.type || '';

      if (!text || !text.trim()) return;

      // Convert string boolean values
      const isExpletive = typeof hasExpletive === 'string' 
        ? hasExpletive.toLowerCase() === 'true' || hasExpletive.toLowerCase() === 'expletive'
        : Boolean(hasExpletive);

      // Detect trigger if not provided
      let detectedTrigger = trigger;
      if (!detectedTrigger) {
        detectedTrigger = TRIGGERS.find(t => text.toLowerCase().includes(t)) || '';
      }

      if (detectedTrigger && TRIGGERS.includes(detectedTrigger)) {
        const processedRow = {
          id: index + 1,
          text: text.trim(),
          has_expletive_ne: isExpletive,
          trigger: detectedTrigger,
          classification: classification || (isExpletive ? 'expletive' : 'logical')
        };

        processedData.push(processedRow);
        stats.totalExamples++;
        
        if (isExpletive) {
          stats.expletiveExamples++;
        } else {
          stats.logicalExamples++;
        }

        if (detectedTrigger === 'peur que') {
          stats.peurQueExamples++;
        } else if (detectedTrigger === 'avant que') {
          stats.avantQueExamples++;
        }
      }
    });

    setTrainingData(processedData);
    setTrainingStats(stats);
    
    if (processedData.length > 0) {
      setUseTrainingEnhancement(true);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      const fileType = file.name.split('.').pop().toLowerCase();
      
      if (fileType !== 'json') {
        setUploadError("Please upload a JSON file. CSV support has been removed to ensure reliable parsing of complex French sentences.");
        return;
      }

      const text = await file.text();
      const jsonData = JSON.parse(text);

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        setUploadError("Invalid JSON format. Please ensure the file contains an array of training examples.");
        return;
      }

      // Validate JSON structure
      const requiredFields = ['text'];
      const sampleItem = jsonData[0];
      const missingFields = requiredFields.filter(field => !(field in sampleItem));
      
      if (missingFields.length > 0) {
        setUploadError(`Missing required fields: ${missingFields.join(', ')}. Each training example must have at least a 'text' field.`);
        return;
      }

      processTrainingData(jsonData);
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        setUploadError(`Invalid JSON syntax: ${error.message}. Please check your JSON formatting.`);
      } else {
        setUploadError(`Error processing file: ${error.message}`);
      }
    }
  };

  const clearTrainingData = () => {
    setTrainingData([]);
    setTrainingStats({
      totalExamples: 0,
      expletiveExamples: 0,
      logicalExamples: 0,
      peurQueExamples: 0,
      avantQueExamples: 0,
      lastUpdated: null
    });
    setUseTrainingEnhancement(false);
    setUploadError(null);
  };

  // Enhanced classification using training data (simplified version)
  const classifyWithTraining = (text) => {
    const baseResult = classifyExpletive(text);
    
    if (trainingData.length === 0) {
      return baseResult;
    }

    const lowerText = text.toLowerCase();
    const foundTrigger = TRIGGERS.find(trigger => lowerText.includes(trigger));
    
    if (!foundTrigger) {
      return baseResult;
    }

    // Find similar examples in training data
    const similarExamples = trainingData.filter(item => 
      item.trigger === foundTrigger && 
      item.text.toLowerCase().includes(foundTrigger)
    );

    if (similarExamples.length === 0) {
      return baseResult + " (No training examples for this trigger)";
    }

    const expletiveCount = similarExamples.filter(item => item.has_expletive_ne).length;
    const totalCount = similarExamples.length;
    const confidence = Math.round((Math.max(expletiveCount, totalCount - expletiveCount) / totalCount) * 100);

    if (baseResult.includes('✅ EXPLETIVE NEGATION')) {
      return `🎯 TRAINING-ENHANCED: '${foundTrigger}' + expletive 'ne' (${confidence}% confidence from ${totalCount} training examples)`;
    } else if (baseResult.includes('logical negation')) {
      return `🎯 TRAINING-ENHANCED: '${foundTrigger}' + logical negation (${confidence}% confidence from ${totalCount} training examples)`;
    }

    return baseResult + ` (Enhanced with ${totalCount} training examples)`;
  };

  // Main classification function that uses feature flags independently
  const classifyNegation = (text) => {
    // Pure training-based analysis (training flag on, expletive flag off)
    if (!useExpletiveLogic && enableTrainingData && useTrainingEnhancement && trainingData.length > 0) {
      return classifyPureTraining(text);
    }
    
    // Basic logic only (both flags off)
    if (!useExpletiveLogic && !enableTrainingData) {
      return classifyBasic(text);
    }
    
    // Rule-based expletive logic only (expletive flag on, training flag off)
    if (useExpletiveLogic && !enableTrainingData) {
      return classifyExpletive(text);
    }
    
    // Hybrid: Training-enhanced expletive logic (both flags on)
    if (useExpletiveLogic && enableTrainingData && useTrainingEnhancement && trainingData.length > 0) {
      return classifyWithTraining(text);
    }
    
    // Fallback to appropriate base logic
    if (useExpletiveLogic) {
      return classifyExpletive(text);
    } else {
      return classifyBasic(text);
    }
  };

  // Pure training-based classification (no rule-based logic)
  const classifyPureTraining = (text) => {
    if (trainingData.length === 0) {
      return "No training data available for pure training-based analysis.";
    }

    const lowerText = text.toLowerCase();
    const foundTrigger = TRIGGERS.find(trigger => lowerText.includes(trigger));
    
    if (!foundTrigger) {
      return "No supported triggers ('peur que' or 'avant que') found for training-based analysis.";
    }

    // Find similar examples in training data
    const similarExamples = trainingData.filter(item => 
      item.trigger === foundTrigger
    );

    if (similarExamples.length === 0) {
      return `No training examples found for '${foundTrigger}' trigger.`;
    }

    // Simple similarity matching based on text content
    const textWords = lowerText.split(/\s+/);
    const scoredExamples = similarExamples.map(item => {
      const exampleWords = item.text.toLowerCase().split(/\s+/);
      const commonWords = textWords.filter(word => exampleWords.includes(word)).length;
      const similarity = commonWords / Math.max(textWords.length, exampleWords.length);
      return { ...item, similarity };
    }).sort((a, b) => b.similarity - a.similarity);

    const topMatches = scoredExamples.slice(0, 5).filter(item => item.similarity > 0.3);
    
    if (topMatches.length === 0) {
      return `Training data available for '${foundTrigger}' but no similar examples found (${similarExamples.length} total examples).`;
    }

    // Calculate prediction based on training data
    const expletiveCount = topMatches.filter(item => item.has_expletive_ne).length;
    const totalCount = topMatches.length;
    const confidence = Math.round((Math.max(expletiveCount, totalCount - expletiveCount) / totalCount) * 100);
    
    const avgSimilarity = Math.round((topMatches.reduce((sum, item) => sum + item.similarity, 0) / totalCount) * 100);

    if (expletiveCount > totalCount - expletiveCount) {
      return `🤖 PURE TRAINING: '${foundTrigger}' + expletive 'ne' predicted (${confidence}% confidence, ${avgSimilarity}% similarity, ${totalCount} examples)`;
    } else {
      return `🤖 PURE TRAINING: '${foundTrigger}' + logical negation predicted (${confidence}% confidence, ${avgSimilarity}% similarity, ${totalCount} examples)`;
    }
  };

  // Sorting function
  const sortResults = (results, config) => {
    return [...results].sort((a, b) => {
      if (config.key === 'id') {
        return config.direction === 'asc' ? a.id - b.id : b.id - a.id;
      }
      
      if (config.key === 'text') {
        return config.direction === 'asc' 
          ? a.text.localeCompare(b.text)
          : b.text.localeCompare(a.text);
      }
      
      if (config.key === 'analysis') {
        return config.direction === 'asc'
          ? a.label.localeCompare(b.label)
          : b.label.localeCompare(a.label);
      }
      
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return ' ↕';
  };

  // Event handlers
  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setResult("Please enter a sentence to analyze.");
      setHighlightedText("");
      return;
    }
    
    const classification = classifyNegation(inputText);
    setResult(classification);
    setHighlightedText(highlight(inputText));
  };

  const handleBatchAnalyze = () => {
    if (!batchInput.trim()) {
      setBatchResults([]);
      return;
    }

    const sentences = batchInput.split("\n").filter(line => line.trim());
    const results = sentences.map((sentence, index) => ({
      id: index + 1,
      text: sentence.trim(),
      highlightedText: highlight(sentence.trim()),
      label: classifyNegation(sentence.trim()),
    }));
    setBatchResults(results);
  };

  const sortedResults = sortResults(batchResults, sortConfig);

  // Download functionality for batch results
  const downloadBatchResults = (format) => {
    if (batchResults.length === 0) {
      alert('No batch results to download. Please run batch analysis first.');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `negation-analysis-batch-${timestamp}`;
    
    // Get current analysis mode for metadata
    const analysisMode = getCurrentModeDescription();
    
    if (format === 'csv') {
      downloadCSV(filename, analysisMode);
    } else if (format === 'json') {
      downloadJSON(filename, analysisMode);
    } else if (format === 'txt') {
      downloadTXT(filename, analysisMode);
    } else if (format === 'excel') {
      downloadExcel(filename, analysisMode);
    }
  };

  const downloadExcel = (filename, analysisMode) => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare main results data
    const resultsData = [
      // Header row
      ['Sentence #', 'Text', 'Analysis Result', 'Classification', 'Confidence', 'Triggers', 'Analysis Mode'],
      // Data rows
      ...batchResults.map(result => {
        // Extract classification details from the label
        const isExpletive = result.label.includes('✅ EXPLETIVE NEGATION');
        const isTrainingEnhanced = result.label.includes('🎯 TRAINING-ENHANCED');
        const isPureTraining = result.label.includes('🤖 PURE TRAINING');
        const isLogicalNegation = result.label.includes('Negation detected');
        
        // Extract confidence if available
        const confidenceMatch = result.label.match(/(\d+)%/);
        const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
        
        // Extract triggers if available
        const triggerMatch = result.label.match(/Trigger: ([^,\n]+)/);
        const triggers = triggerMatch ? triggerMatch[1] : 'None';
        
        // Determine classification type
        let classificationType = 'No Negation';
        if (isExpletive) classificationType = 'Expletive Negation';
        else if (isTrainingEnhanced) classificationType = 'Training Enhanced';
        else if (isPureTraining) classificationType = 'Pure Training';
        else if (isLogicalNegation) classificationType = 'Logical Negation';
        
        return [
          result.id,
          result.text,
          result.label,
          classificationType,
          confidence,
          triggers,
          analysisMode
        ];
      })
    ];
    
    // Create main results worksheet
    const ws = XLSX.utils.aoa_to_sheet(resultsData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 },  // Sentence #
      { wch: 40 },  // Text
      { wch: 60 },  // Analysis Result
      { wch: 20 },  // Classification
      { wch: 12 },  // Confidence
      { wch: 15 },  // Triggers
      { wch: 50 }   // Analysis Mode
    ];
    
    // Apply formatting to header row
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
    
    // Apply formatting to data rows based on classification
    for (let row = 1; row <= batchResults.length; row++) {
      const result = batchResults[row - 1];
      const isExpletive = result.label.includes('✅ EXPLETIVE NEGATION');
      const isTrainingEnhanced = result.label.includes('🎯 TRAINING-ENHANCED');
      const isPureTraining = result.label.includes('🤖 PURE TRAINING');
      const isLogicalNegation = result.label.includes('Negation detected');
      
      // Determine row color based on classification
      let fillColor = "FFFFFF"; // Default white
      if (isExpletive) fillColor = "D4EDDA"; // Light green for expletive
      else if (isTrainingEnhanced) fillColor = "E3F2FD"; // Light blue for training enhanced
      else if (isPureTraining) fillColor = "F3E5F5"; // Light purple for pure training
      else if (isLogicalNegation) fillColor = "FFF3CD"; // Light yellow for logical
      
      // Apply formatting to all cells in the row
      for (let col = 0; col < 7; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: fillColor } },
          alignment: { vertical: "top", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        };
        
        // Special formatting for classification column
        if (col === 3) { // Classification column
          ws[cellAddress].s.font = { bold: true };
          if (isExpletive) ws[cellAddress].s.font.color = { rgb: "155724" };
          else if (isTrainingEnhanced) ws[cellAddress].s.font.color = { rgb: "0C5460" };
          else if (isPureTraining) ws[cellAddress].s.font.color = { rgb: "6A1B9A" };
          else if (isLogicalNegation) ws[cellAddress].s.font.color = { rgb: "856404" };
        }
      }
    }
    
    // Add the main results sheet
    XLSX.utils.book_append_sheet(wb, ws, "Analysis Results");
    
    // Create summary statistics sheet
    const stats = calculateBatchStatistics();
    const summaryData = [
      ['French Expletive Negation Analysis - Summary Statistics'],
      [''],
      ['Generated:', new Date().toISOString()],
      ['Analysis Mode:', analysisMode],
      ['Total Sentences:', batchResults.length],
      [''],
      ['Classification Breakdown:'],
      ['Expletive Negation:', stats.expletiveCount],
      ['Training Enhanced:', stats.trainingEnhancedCount],
      ['Pure Training:', stats.pureTrainingCount],
      ['Logical Negation:', stats.logicalCount],
      ['No Negation:', stats.noNegationCount],
      [''],
      ['Confidence Distribution:'],
      ['High Confidence (≥80%):', stats.highConfidenceCount],
      ['Medium Confidence (60-79%):', stats.mediumConfidenceCount],
      ['Low Confidence (<60%):', stats.lowConfidenceCount],
      [''],
      ['Trigger Analysis:'],
      ['Sentences with Triggers:', stats.withTriggersCount],
      ['Most Common Trigger:', stats.mostCommonTrigger || 'N/A']
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Format summary sheet
    summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
    
    // Style the title
    if (summaryWs['A1']) {
      summaryWs['A1'].s = {
        font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center" }
      };
    }
    
    // Merge title cell
    summaryWs['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
    
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary Statistics");
    
    // Create detailed breakdown sheet if user training data is available
    if (enableTrainingData && trainingData.length > 0) {
      const userTrainingStatsData = [
        ['User Training Data Analysis'],
        [''],
        ['Total User Examples:', trainingData.length],
        ['User Data Statistics:'],
        ['Total Examples:', trainingStats.totalExamples],
        ['Expletive Examples:', trainingStats.expletiveCount],
        ['Logical Examples:', trainingStats.logicalCount],
        [''],
        ['Sample User Examples (First 10):'],
        ['Text', 'Classification'],
        ...trainingData.slice(0, 10).map(item => [item.text, item.classification || 'N/A'])
      ];
      
      const userTrainingWs = XLSX.utils.aoa_to_sheet(userTrainingStatsData);
      userTrainingWs['!cols'] = [{ wch: 50 }, { wch: 20 }];
      
      // Style the title
      if (userTrainingWs['A1']) {
        userTrainingWs['A1'].s = {
          font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center" }
        };
      }
      
      // Merge title cell
      userTrainingWs['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
      
      // Style the sample data header
      if (userTrainingWs['A9']) {
        userTrainingWs['A9'].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "28a745" } },
          alignment: { horizontal: "center" }
        };
      }
      if (userTrainingWs['B9']) {
        userTrainingWs['B9'].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "28a745" } },
          alignment: { horizontal: "center" }
        };
      }
      
      XLSX.utils.book_append_sheet(wb, userTrainingWs, "User Training Data");
    }
    
    // Write the file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Helper function to calculate batch statistics
  const calculateBatchStatistics = () => {
    const stats = {
      expletiveCount: 0,
      trainingEnhancedCount: 0,
      pureTrainingCount: 0,
      logicalCount: 0,
      noNegationCount: 0,
      highConfidenceCount: 0,
      mediumConfidenceCount: 0,
      lowConfidenceCount: 0,
      withTriggersCount: 0,
      triggers: {}
    };
    
    batchResults.forEach(result => {
      // Count classifications
      if (result.label.includes('✅ EXPLETIVE NEGATION')) stats.expletiveCount++;
      else if (result.label.includes('🎯 TRAINING-ENHANCED')) stats.trainingEnhancedCount++;
      else if (result.label.includes('🤖 PURE TRAINING')) stats.pureTrainingCount++;
      else if (result.label.includes('Negation detected')) stats.logicalCount++;
      else stats.noNegationCount++;
      
      // Count confidence levels
      const confidenceMatch = result.label.match(/(\d+)%/);
      if (confidenceMatch) {
        const confidence = parseInt(confidenceMatch[1]);
        if (confidence >= 80) stats.highConfidenceCount++;
        else if (confidence >= 60) stats.mediumConfidenceCount++;
        else stats.lowConfidenceCount++;
      }
      
      // Count triggers
      const triggerMatch = result.label.match(/Trigger: ([^,\n]+)/);
      if (triggerMatch) {
        stats.withTriggersCount++;
        const trigger = triggerMatch[1];
        stats.triggers[trigger] = (stats.triggers[trigger] || 0) + 1;
      }
    });
    
    // Find most common trigger
    stats.mostCommonTrigger = Object.keys(stats.triggers).reduce((a, b) => 
      stats.triggers[a] > stats.triggers[b] ? a : b, null);
    
    return stats;
  };

  const downloadCSV = (filename, analysisMode) => {
    // Prepare CSV headers
    const headers = ['Sentence_Number', 'Text', 'Analysis_Result', 'Classification_Type', 'Confidence', 'Triggers_Found', 'Analysis_Mode'];
    
    // Process results into CSV format
    const csvData = batchResults.map(result => {
      // Extract classification details from the label
      const isExpletive = result.label.includes('✅ EXPLETIVE NEGATION');
      const isTrainingEnhanced = result.label.includes('🎯 TRAINING-ENHANCED');
      const isPureTraining = result.label.includes('🤖 PURE TRAINING');
      const isLogicalNegation = result.label.includes('Negation detected');
      
      // Extract confidence if available
      const confidenceMatch = result.label.match(/(\d+)%/);
      const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
      
      // Extract triggers if available
      const triggerMatch = result.label.match(/Trigger: ([^,\n]+)/);
      const triggers = triggerMatch ? triggerMatch[1] : 'None';
      
      // Determine classification type
      let classificationType = 'No Negation';
      if (isExpletive) classificationType = 'Expletive Negation';
      else if (isTrainingEnhanced) classificationType = 'Training Enhanced';
      else if (isPureTraining) classificationType = 'Pure Training';
      else if (isLogicalNegation) classificationType = 'Logical Negation';
      
      return [
        result.id,
        `"${result.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${result.label.replace(/"/g, '""')}"`,
        classificationType,
        confidence,
        triggers,
        `"${analysisMode.replace(/"/g, '""')}"`
      ];
    });
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    // Add metadata header
    const metadata = `# French Expletive Negation Analysis - Batch Results\n# Generated: ${new Date().toISOString()}\n# Analysis Mode: ${analysisMode}\n# Total Sentences: ${batchResults.length}\n#\n`;
    
    downloadFile(csvContent, `${filename}.csv`, 'text/csv', metadata);
  };

  const downloadJSON = (filename, analysisMode) => {
    const jsonData = {
      metadata: {
        title: 'French Expletive Negation Analysis - Batch Results',
        generated: new Date().toISOString(),
        analysisMode: analysisMode,
        totalSentences: batchResults.length,
        version: '2.1.0'
      },
      results: batchResults.map(result => {
        // Extract detailed analysis from label
        const isExpletive = result.label.includes('✅ EXPLETIVE NEGATION');
        const isTrainingEnhanced = result.label.includes('🎯 TRAINING-ENHANCED');
        const isPureTraining = result.label.includes('🤖 PURE TRAINING');
        const isLogicalNegation = result.label.includes('Negation detected');
        
        const confidenceMatch = result.label.match(/(\d+)%/);
        const triggerMatch = result.label.match(/Trigger: ([^,\n]+)/);
        
        return {
          sentenceNumber: result.id,
          text: result.text,
          analysisResult: result.label,
          classification: {
            type: isExpletive ? 'expletive_negation' : 
                  isTrainingEnhanced ? 'training_enhanced' :
                  isPureTraining ? 'pure_training' :
                  isLogicalNegation ? 'logical_negation' : 'no_negation',
            confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : null,
            triggers: triggerMatch ? triggerMatch[1] : null
          },
          highlightedText: result.highlightedText
        };
      })
    };
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const downloadTXT = (filename, analysisMode) => {
    let content = `French Expletive Negation Analysis - Batch Results\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Analysis Mode: ${analysisMode}\n`;
    content += `Total Sentences: ${batchResults.length}\n`;
    content += `${'='.repeat(60)}\n\n`;
    
    batchResults.forEach((result, index) => {
      content += `${index + 1}. Sentence #${result.id}\n`;
      content += `   Text: ${result.text}\n`;
      content += `   Analysis: ${result.label}\n`;
      content += `   ${'─'.repeat(50)}\n\n`;
    });
    
    downloadFile(content, `${filename}.txt`, 'text/plain');
  };

  const downloadFile = (content, filename, mimeType, metadata = '') => {
    const fullContent = metadata + content;
    const blob = new Blob([fullContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper functions for UI mode display
  const getCurrentModeDescription = () => {
    if (!useExpletiveLogic && !enableTrainingData) {
      return "📝 Basic Logic Only - Simple 'ne' detection without trigger analysis";
    }
    if (useExpletiveLogic && !enableTrainingData) {
      return "🎯 Rule-Based Expletive Logic Only - Trigger analysis for 'peur que' and 'avant que'";
    }
    if (!useExpletiveLogic && enableTrainingData) {
      if (useTrainingEnhancement && trainingData.length > 0) {
        return `🤖 Pure Training-Based Analysis - ML predictions from ${trainingData.length} user examples`;
      } else {
        return "📚 Training Data Available - Upload data and enable enhancement for pure ML analysis";
      }
    }
    if (useExpletiveLogic && enableTrainingData) {
      if (useTrainingEnhancement && trainingData.length > 0) {
        return `🔄 Hybrid Analysis - Rule-based logic enhanced with ${trainingData.length} user examples`;
      } else {
        return "🔄 Hybrid Mode Available - Upload data and enable enhancement for combined analysis";
      }
    }
    return "Unknown mode";
  };

  const getCurrentModeColor = () => {
    if (!useExpletiveLogic && !enableTrainingData) {
      return "#ff9800"; // Orange for basic
    }
    if (useExpletiveLogic && !enableTrainingData) {
      return "#2196f3"; // Blue for rule-based
    }
    if (!useExpletiveLogic && enableTrainingData) {
      return "#4caf50"; // Green for pure training
    }
    if (useExpletiveLogic && enableTrainingData) {
      return "#9c27b0"; // Purple for hybrid
    }
    return "#666";
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">🔬 French Negation Analysis</h2>
        
        {/* Feature Flag Toggles */}
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '2px solid #2196f3'
        }}>
          <h4>🚩 Analysis Mode (Independent Flags):</h4>
          
          {/* Expletive Logic Toggle */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            <input
              type="checkbox"
              checked={useExpletiveLogic}
              onChange={(e) => setUseExpletiveLogic(e.target.checked)}
              style={{ 
                marginRight: '10px', 
                transform: 'scale(1.2)',
                cursor: 'pointer'
              }}
            />
            {useExpletiveLogic ? '✅ Rule-Based Expletive Logic ENABLED' : '❌ Rule-Based Expletive Logic DISABLED'}
          </label>
          
          {/* Training Data Toggle - Now Independent */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1976d2',
            marginBottom: '10px'
          }}>
            <input
              type="checkbox"
              checked={enableTrainingData}
              onChange={(e) => setEnableTrainingData(e.target.checked)}
              style={{ 
                marginRight: '10px', 
                transform: 'scale(1.2)',
                cursor: 'pointer'
              }}
            />
            {enableTrainingData ? '📚 Training Data Analysis ENABLED' : '📚 Training Data Analysis DISABLED'}
          </label>
          
          {/* Training Enhancement Toggle */}
          {enableTrainingData && (
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#4caf50',
              marginLeft: '20px'
            }}>
              <input
                type="checkbox"
                checked={useTrainingEnhancement}
                onChange={(e) => setUseTrainingEnhancement(e.target.checked)}
                disabled={trainingData.length === 0}
                style={{ 
                  marginRight: '10px', 
                  transform: 'scale(1.0)',
                  cursor: trainingData.length === 0 ? 'not-allowed' : 'pointer'
                }}
              />
              {useTrainingEnhancement ? '🎯 Training Enhancement ACTIVE' : '🎯 Training Enhancement INACTIVE'}
              {trainingData.length === 0 && ' (No training data loaded)'}
            </label>
          )}
          
          {/* Current Analysis Mode Display */}
          <div style={{ 
            marginTop: '15px', 
            padding: '10px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: '4px',
            border: '1px solid #2196f3'
          }}>
            <strong>🎯 Current Analysis Mode:</strong>
            <div style={{ 
              marginTop: '5px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: getCurrentModeColor()
            }}>
              {getCurrentModeDescription()}
            </div>
          </div>
        </div>

        <p>
          {!useExpletiveLogic && !enableTrainingData 
            ? "Basic negation analysis - detects 'ne' and logical negation markers only."
            : useExpletiveLogic && !enableTrainingData
              ? "Rule-based expletive negation analysis for 'peur que' and 'avant que' constructions."
              : !useExpletiveLogic && enableTrainingData
                ? useTrainingEnhancement && trainingData.length > 0
                  ? "Pure training-based analysis using machine learning patterns from your uploaded examples only."
                  : "Training data analysis available - upload your examples for pure ML-based classification."
                : useExpletiveLogic && enableTrainingData
                  ? useTrainingEnhancement && trainingData.length > 0
                    ? "Hybrid analysis combining rule-based logic with your machine learning examples."
                    : "Hybrid analysis mode available - upload your training data for enhanced accuracy."
                  : "Select your preferred analysis approach using the toggles above."
          }
        </p>
        
        {/* Basic Logic Info Box */}
        {!useExpletiveLogic && !enableTrainingData && (
          <div className="info-box" style={{ 
            backgroundColor: '#fff3cd', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <h4>📝 Basic Logic Analyzes:</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Presence of <strong>"ne"</strong> negation</li>
              <li>Logical negation markers: <strong>pas, rien, jamais, plus, personne, aucun, guère</strong></li>
              <li>No trigger-specific analysis</li>
            </ul>
            <p><strong>Example:</strong> "Il ne vient pas" (logical) vs "Il ne vient" (negation without markers)</p>
          </div>
        )}

        {/* Rule-Based Logic Info Box */}
        {useExpletiveLogic && !enableTrainingData && (
          <div className="info-box" style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #2196f3'
          }}>
            <h4>🎯 Rule-Based Expletive Logic:</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><strong>"peur que"</strong> (fear that) + expletive "ne"</li>
              <li><strong>"avant que"</strong> (before) + expletive "ne"</li>
              <li>Logical negation detection with markers</li>
            </ul>
            <p><strong>Example:</strong> "J'ai peur qu'il ne vienne" (expletive) vs "J'ai peur qu'il ne vienne pas" (logical)</p>
          </div>
        )}

        {/* Pure Training Logic Info Box */}
        {!useExpletiveLogic && enableTrainingData && (
          <div className="info-box" style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #4caf50'
          }}>
            <h4>🤖 Pure Training-Based Analysis:</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><strong>Machine learning only</strong> - no rule-based logic interference</li>
              <li><strong>Pattern matching</strong> with your uploaded training examples</li>
              <li><strong>Similarity scoring</strong> and confidence percentages from user data</li>
              <li>Uses <strong>only your examples</strong> - no external datasets</li>
            </ul>
            <p><strong>Advantage:</strong> Pure data-driven predictions from your training data only</p>
          </div>
        )}

        {/* Hybrid Analysis Info Box */}
        {useExpletiveLogic && enableTrainingData && (
          <div className="info-box" style={{ 
            backgroundColor: '#f3e5f5', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #9c27b0'
          }}>
            <h4>🔄 Hybrid Analysis (Rule-Based + Training):</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><strong>Rule-based foundation</strong> with training data enhancement</li>
              <li><strong>Confidence boosting</strong> from similar training examples</li>
              <li><strong>Fallback logic</strong> when training data is insufficient</li>
              <li>Best of both worlds: <strong>linguistic rules + machine learning</strong></li>
            </ul>
            <p><strong>Advantage:</strong> Combines linguistic expertise with data-driven improvements</p>
          </div>
        )}

        {/* Single Sentence Section */}
        <div className="form-group">
          <label htmlFor="sentence-input">Enter French Sentence:</label>
          <div className="input-group">
            <input
              id="sentence-input"
              type="text"
              placeholder="e.g., J'ai peur qu'il ne vienne..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input"
            />
            <button onClick={handleAnalyze} className="button">
              Analyze
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section">
            <h3>Analysis Result:</h3>
            <p className="classification-result" style={{
              padding: '15px',
              backgroundColor: result.includes('✅ EXPLETIVE NEGATION') || result.includes('🎯 TRAINING-ENHANCED') || result.includes('🤖 PURE TRAINING') ? '#d4edda' : 
                             result.includes('Negation detected') ? '#fff3cd' : '#f8f9fa',
              border: `1px solid ${result.includes('✅ EXPLETIVE NEGATION') || result.includes('🎯 TRAINING-ENHANCED') || result.includes('🤖 PURE TRAINING') ? '#c3e6cb' : 
                                  result.includes('Negation detected') ? '#ffeaa7' : '#dee2e6'}`,
              borderRadius: '8px',
              fontWeight: result.includes('✅ EXPLETIVE NEGATION') || result.includes('🎯 TRAINING-ENHANCED') || result.includes('🤖 PURE TRAINING') ? 'bold' : 'normal'
            }}>
              {result}
            </p>
            {highlightedText && (
              <>
                <h3>Highlighted Sentence:</h3>
                <p className="sentence-text" dangerouslySetInnerHTML={{ __html: highlightedText }}></p>
              </>
            )}
          </div>
        )}
      </div>

      {/* User Training Data Section - Completely User-Controlled */}
      {enableTrainingData && (
        <div className="card">
          <h3 className="title">📚 User Training Data Management</h3>
          <div style={{
            backgroundColor: '#e8f5e8',
            border: '1px solid #c3e6cb',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <strong>🎯 Complete User Control:</strong> Upload your own training examples to enhance analysis accuracy. 
            The system uses ONLY your uploaded data - no hidden datasets or external training sources. 
            Perfect for custom research with your specific linguistic examples.
          </div>
          <p>Upload training examples for {useExpletiveLogic ? 'enhanced' : 'pure'} machine learning-based expletive negation detection.</p>
          
          <div className="info-box" style={{ 
            backgroundColor: '#fff3cd', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <h4>📋 Expected File Format (CSV or JSON):</h4>
            <p><strong>CSV columns:</strong> text, has_expletive_ne, trigger, classification</p>
            <p><strong>Example:</strong></p>
            <pre style={{ fontSize: '12px', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
{`text,has_expletive_ne,trigger,classification
"J'ai peur qu'il ne vienne",true,peur que,expletive
"J'ai peur qu'il ne vienne pas",false,peur que,logical
"Avant qu'elle ne parte",true,avant que,expletive`}
            </pre>
          </div>

          <div className="form-group">
            <label htmlFor="training-file-upload">Upload Training Data:</label>
            <div className="input-group">
              <input
                id="training-file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="input"
              />
              {trainingData.length > 0 && (
                <button onClick={clearTrainingData} className="button" style={{ backgroundColor: '#dc3545' }}>
                  Clear Data
                </button>
              )}
            </div>
            {uploadError && (
              <p style={{ color: '#dc3545', marginTop: '10px' }}>{uploadError}</p>
            )}
          </div>

          {trainingStats.totalExamples > 0 && (
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #4caf50'
            }}>
              <h4>📊 Your Training Data Statistics:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Total Examples:</strong> {trainingStats.totalExamples}<br/>
                  <strong>Expletive Examples:</strong> {trainingStats.expletiveExamples}<br/>
                  <strong>Logical Examples:</strong> {trainingStats.logicalExamples}
                </div>
                <div>
                  <strong>"Peur que" Examples:</strong> {trainingStats.peurQueExamples}<br/>
                  <strong>"Avant que" Examples:</strong> {trainingStats.avantQueExamples}<br/>
                  <strong>Last Updated:</strong> {new Date(trainingStats.lastUpdated).toLocaleString()}
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                🔍 <strong>Data Transparency:</strong> Analysis uses only your uploaded examples. No external datasets or hidden training sources.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3 className="title">Batch Analysis</h3>
        <div className="form-group">
          <label htmlFor="batch-input">Enter Multiple Sentences:</label>
          <div className="input-group">
            <textarea
              id="batch-input"
              rows={6}
              placeholder={`Enter multiple sentences (one per line):\nJ'ai peur qu'il ne vienne\nAvant qu'elle ne parte\nJ'ai peur qu'il ne vienne pas`}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="input"
            />
            <button onClick={handleBatchAnalyze} className="button">
              Analyze Batch
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '15px',
          fontSize: '14px'
        }}>
          <strong>💡 Download Options:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>📊 Excel:</strong> Rich formatted spreadsheet with color-coded classifications, multiple sheets (results, statistics, user training data), and professional styling</li>
            <li><strong>📋 CSV:</strong> Excel-compatible format with structured columns (sentence number, text, analysis, classification type, confidence, triggers)</li>
            <li><strong>🔧 JSON:</strong> Structured data format for programming/research with detailed metadata and classification details</li>
            <li><strong>📄 TXT:</strong> Human-readable report format perfect for documentation and sharing</li>
          </ul>
          <em>All formats include analysis mode, timestamp, and complete results. Training data sheets only include your uploaded examples for full transparency.</em>
        </div>

        {batchResults.length > 0 && (
          <div className="result-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Batch Results ({batchResults.length} sentences):</h3>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666', marginRight: '10px' }}>📥 Download:</span>
                <button 
                  onClick={() => downloadBatchResults('excel')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#217346',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Download as Excel with rich formatting and multiple sheets"
                >
                  📊 Excel
                </button>
                <button 
                  onClick={() => downloadBatchResults('csv')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Download as CSV (Excel compatible)"
                >
                  📋 CSV
                </button>
                <button 
                  onClick={() => downloadBatchResults('json')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Download as JSON (structured data)"
                >
                  🔧 JSON
                </button>
                <button 
                  onClick={() => downloadBatchResults('txt')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Download as plain text report"
                >
                  📄 TXT
                </button>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th 
                      onClick={() => handleSort('id')}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontWeight: 'bold',
                        width: '80px'
                      }}
                    >
                      #️⃣ Sentence{getSortIcon('id')}
                    </th>
                    <th 
                      onClick={() => handleSort('text')}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontWeight: 'bold',
                        minWidth: '200px'
                      }}
                    >
                      📝 Text{getSortIcon('text')}
                    </th>
                    <th 
                      onClick={() => handleSort('analysis')}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontWeight: 'bold',
                        minWidth: '250px'
                      }}
                    >
                      🔍 Analysis{getSortIcon('analysis')}
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold',
                      minWidth: '200px'
                    }}>
                      🎨 Highlighted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map(({ id, text, label, highlightedText }, index) => (
                    <tr 
                      key={id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      <td style={{
                        padding: '12px',
                        fontWeight: 'bold',
                        color: '#495057'
                      }}>
                        {id}
                      </td>
                      <td style={{
                        padding: '12px',
                        wordBreak: 'break-word'
                      }}>
                        {text}
                      </td>
                      <td style={{
                        padding: '12px',
                        wordBreak: 'break-word'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: label.includes('✅ EXPLETIVE NEGATION') || label.includes('🎯 TRAINING-ENHANCED') || label.includes('🤖 PURE TRAINING') ? '#d4edda' : 
                                          label.includes('Negation detected') ? '#fff3cd' : 'transparent',
                          border: `1px solid ${label.includes('✅ EXPLETIVE NEGATION') || label.includes('🎯 TRAINING-ENHANCED') || label.includes('🤖 PURE TRAINING') ? '#c3e6cb' : 
                                              label.includes('Negation detected') ? '#ffeaa7' : 'transparent'}`,
                          borderRadius: '4px',
                          fontWeight: label.includes('✅ EXPLETIVE NEGATION') || label.includes('🎯 TRAINING-ENHANCED') || label.includes('🤖 PURE TRAINING') ? 'bold' : 'normal',
                          fontSize: '0.9em'
                        }}>
                          {label}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px',
                        wordBreak: 'break-word'
                      }}>
                        <span dangerouslySetInnerHTML={{ __html: highlightedText }}></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              fontSize: '0.9em',
              color: '#6c757d'
            }}>
              💡 <strong>Tip:</strong> Click on column headers to sort the results. 
              {!useExpletiveLogic && !enableTrainingData
                ? "Yellow highlighted results indicate basic negation detected."
                : useExpletiveLogic && !enableTrainingData
                  ? "Green highlighted results indicate rule-based expletive negation detected."
                  : !useExpletiveLogic && enableTrainingData
                    ? "Green highlighted results indicate pure training-based predictions from your data."
                    : "Green highlighted results indicate hybrid rule-based + your training analysis."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
