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

  // Comprehensive French expletive negation triggers with variations
  const EXPLETIVE_PATTERNS = {
    // Fear expressions that trigger expletive ne (must have 'que')
    peur_que: [
      // avoir peur que constructions
      /\b(?:j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont|elles ont)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:j'avais|tu avais|il avait|elle avait|on avait|nous avions|vous aviez|ils avaient|elles avaient)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:j'aurai|tu auras|il aura|elle aura|on aura|nous aurons|vous aurez|ils auront|elles auront)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:j'aurais|tu aurais|il aurait|elle aurait|on aurait|nous aurions|vous auriez|ils auraient|elles auraient)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Prepositional constructions with que
      /\b(?:par|de|dans|avec|sous)\s+(?:la\s+|une\s+)?(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:en ayant|ayant)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Direct peur que constructions
      /\bpeur\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Faire peur que constructions
      /\b(?:ça|cela)\s+(?:me|te|lui|nous|vous|leur)\s+fait\s+peur\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:me|te|lui|nous|vous|leur)\s+faisant\s+peur\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Nominal constructions with que
      /\bla\s+peur\s+(?:intense\s+|terrible\s+|horrible\s+)?qu[e'](?!\s+pas)\s*/gi,
      
      // Intensity modifiers with que
      /\b(?:tellement|si|très|fort)\s+peur\s+qu[e'](?!\s+pas)\s*/gi
    ],
    
    // Before expressions - temporal constructions
    avant: [
      // Basic temporal constructions
      /\bavant\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:juste|bien|peu|longtemps)\s+avant\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Prepositional phrases
      /\bd'avant\s+qu[e'](?!\s+pas)\s*/gi,
      /\bpeu\s+de\s+temps\s+avant\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Temporal precision
      /\b(?:quelques?|plusieurs|deux|trois|quatre|cinq)\s+(?:minutes?|heures?|jours?|semaines?|mois|ans?)\s+avant\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Complex temporal expressions
      /\b(?:la\s+veille|le\s+jour|la\s+semaine|le\s+mois|l'année)\s+(?:d'|de\s+)?avant\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Immediate anteriority
      /\b(?:tout|juste|immédiatement|directement)\s+avant\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Relative time expressions
      /\bpeu\s+(?:de\s+temps\s+)?avant\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:bien|très|assez)\s+avant\s+qu[e'](?!\s+pas)\s*/gi,
      
      // Compound constructions
      /\b(?:un\s+moment|un\s+instant)\s+avant\s+qu[e'](?!\s+pas)\s*/gi,
      /\b(?:la\s+période|l'époque)\s+(?:d'|de\s+)?avant\s+qu[e'](?!\s+pas)\s*/gi
    ],
    
    // Fear verbs - comprehensive conjugations
    craindre: [
      /\b(?:je\s+crains|tu\s+crains|il\s+craint|elle\s+craint|on\s+craint)\s+qu[e']?\s*/gi,
      /\b(?:nous\s+craignons|vous\s+craignez|ils\s+craignent|elles\s+craignent)\s+qu[e']?\s*/gi,
      /\b(?:j'ai\s+craint|tu\s+as\s+craint|il\s+a\s+craint|elle\s+a\s+craint)\s+qu[e']?\s*/gi,
      /\bcraindr[aei].*qu[e']?\s*/gi // Future and conditional forms
    ],
    
    // Dread/fear verbs
    redouter: [
      /\b(?:je\s+redoute|tu\s+redoutes|il\s+redoute|elle\s+redoute)\s+qu[e']?\s*/gi,
      /\b(?:nous\s+redoutons|vous\s+redoutez|ils\s+redoutent|elles\s+redoutent)\s+qu[e']?\s*/gi,
      /\bredout[aei].*qu[e']?\s*/gi
    ],
    
    // Doubt expressions
    douter: [
      /\b(?:je\s+doute|tu\s+doutes|il\s+doute|elle\s+doute)\s+qu[e']?\s*/gi,
      /\b(?:nous\s+doutons|vous\s+doutez|ils\s+doutent|elles\s+doutent)\s+qu[e']?\s*/gi,
      /\bdout[aei].*qu[e']?\s*/gi
    ],
    
    // Avoid expressions
    eviter: [
      /\b(?:j'évite|tu\s+évites|il\s+évite|elle\s+évite)\s+qu[e']?\s*/gi,
      /\b(?:nous\s+évitons|vous\s+évitez|ils\s+évitent|elles\s+évitent)\s+qu[e']?\s*/gi,
      /\bévit[aei].*qu[e']?\s*/gi,
      /\b(?:évitez|éviter)\s+qu[e']?\s*/gi
    ],
    
    // Prevent expressions
    empecher: [
      /\b(?:j'empêche|tu\s+empêches|il\s+empêche|elle\s+empêche)\s+qu[e']?\s*/gi,
      /\b(?:nous\s+empêchons|vous\s+empêchez|ils\s+empêchent|elles\s+empêchent)\s+qu[e']?\s*/gi,
      /\bempêch[aei].*qu[e']?\s*/gi
    ]
  };

  // Logical negation markers with context
  const LOGICAL_MARKERS = [
    /\bne\s+(?:pas|point)\b/gi,
    /\bne\s+plus\b/gi,
    /\bne\s+jamais\b/gi,
    /\bne\s+rien\b/gi,
    /\bne\s+personne\b/gi,
    /\bne\s+aucun[e]?\b/gi,
    /\bne\s+guère\b/gi,
    /\bne\s+nullement\b/gi,
    /\bn'(?:pas|plus|jamais|rien|personne|aucun|guère)\b/gi
  ];

  // Comprehensive subjunctive patterns commonly used with expletive ne
  const SUBJUNCTIVE_PATTERNS = {
    // être - to be
    etre: /\b(?:sois|soit|soyons|soyez|soient)\b/gi,
    
    // avoir - to have
    avoir: /\b(?:aie|aies|ait|ayons|ayez|aient)\b/gi,
    
    // aller - to go
    aller: /\b(?:aille|ailles|aille|allions|alliez|aillent)\b/gi,
    
    // venir - to come
    venir: /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/gi,
    
    // faire - to do/make
    faire: /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/gi,
    
    // dire - to say
    dire: /\b(?:dise|dises|dise|disions|disiez|disent)\b/gi,
    
    // pouvoir - can/to be able
    pouvoir: /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/gi,
    
    // savoir - to know
    savoir: /\b(?:sache|saches|sache|sachions|sachiez|sachent)\b/gi,
    
    // prendre - to take
    prendre: /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/gi,
    
    // voir - to see
    voir: /\b(?:voie|voies|voie|voyions|voyiez|voient)\b/gi,
    
    // mettre - to put
    mettre: /\b(?:mette|mettes|mette|mettions|mettiez|mettent)\b/gi,
    
    // Common irregular verbs in subjunctive
    irregulars: /\b(?:veuille|veuilles|veuille|voulions|vouliez|veuillent|doive|doives|doive|devions|deviez|doivent)\b/gi
  };

  // Enhanced negation detection with context awareness
  const hasNegation = (text) => {
    // Look for "ne" with proper word boundaries and context
    const nePattern = /\b(?:ne|n')\b/gi;
    const matches = text.match(nePattern);
    
    if (!matches) return false;
    
    // Check for logical negation markers near each "ne"
    const logicalMarkers = /\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|guère|nullement)\b/gi;
    const textAfterNe = text.slice(text.indexOf(matches[0]));
    
    // If there's a logical marker within reasonable distance of "ne", it's likely logical negation
    return !logicalMarkers.test(textAfterNe.split(/[.!?;]/)[0]);
  };

  // Enhanced subjunctive detection
  const hasSubjunctive = (text) => {
    // Check each subjunctive pattern category
    return Object.values(SUBJUNCTIVE_PATTERNS).some(pattern => pattern.test(text));
  };

  // Calculate confidence based on linguistic features
  const calculateConfidence = (text, triggerInfo) => {
    let confidence = 0.5; // Base confidence
    
    // Strong indicators
    if (hasSubjunctive(text)) {
      confidence += 0.2; // Subjunctive is a strong indicator
    }
    
    // Trigger type confidence
    if (triggerInfo.type === 'peur_que') {
      // Fear expressions with 'que' are very reliable indicators
      confidence += 0.15;
      
      // Check for complete construction
      if (text.match(/\b(?:j'ai|tu as|il a|elle a|nous avons|vous avez|ils ont)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e'](?!\s+pas)\s*/i)) {
        confidence += 0.05;
      }
      
      // Check for subjunctive after que
      const queIndex = text.indexOf('que');
      if (queIndex !== -1) {
        const afterQue = text.slice(queIndex + 3);
        if (hasSubjunctive(afterQue)) {
          confidence += 0.05; // Additional boost for subjunctive in correct position
        }
      }
    } else if (triggerInfo.type === 'avant') {
      // Temporal expressions are also reliable
      confidence += 0.1;
      
      // Additional confidence for precise temporal markers
      if (text.match(/\b(?:juste|bien|peu|longtemps)\s+avant\s+qu[e'](?!\s+pas)\s*/i)) {
        confidence += 0.05;
      }
      
      // Check for subjunctive after que
      const queIndex = text.indexOf('que');
      if (queIndex !== -1) {
        const afterQue = text.slice(queIndex + 3);
        if (hasSubjunctive(afterQue)) {
          confidence += 0.05; // Additional boost for subjunctive in correct position
        }
      }
    }
    
    // Context analysis
    if (!text.match(/\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|guère)\b/i)) {
      confidence += 0.1; // No logical negation markers
    }
    
    // Sentence structure analysis
    if (text.match(/\bqu[e']\s+[^.!?]+$/i)) {
      confidence += 0.05; // Proper complement clause structure
    }
    
    return Math.min(confidence, 0.95); // Cap at 95% confidence
  };

  // Detect logical negation markers
  const hasLogicalNegation = (text) => {
    return LOGICAL_MARKERS.some(pattern => pattern.test(text));
  };

  // Find expletive triggers with comprehensive pattern matching
  const findExpletiveTrigger = (text) => {
    const normalizedText = text.toLowerCase()
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    for (const [triggerType, patterns] of Object.entries(EXPLETIVE_PATTERNS)) {
      for (const pattern of patterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          return {
            type: triggerType,
            match: match[0].trim(),
            position: match.index,
            confidence: calculateTriggerConfidence(match[0], triggerType)
          };
        }
      }
    }
    return null;
  };

  // Calculate confidence based on trigger pattern specificity
  const calculateTriggerConfidence = (matchedText, triggerType) => {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for more specific patterns
    if (matchedText.includes("j'ai") || matchedText.includes("nous avons")) confidence += 0.1;
    if (matchedText.includes("grand")) confidence += 0.05; // "grand peur"
    if (matchedText.includes("par peur") || matchedText.includes("de peur")) confidence += 0.1;
    if (triggerType === 'avant' && matchedText.includes("juste")) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  };



  // Extract complement clause after trigger
  const extractComplementClause = (text, triggerMatch) => {
    if (!triggerMatch) return null;
    
    const afterTrigger = text.substring(triggerMatch.position + triggerMatch.match.length);
    // Look for the clause until punctuation or conjunction
    const clauseMatch = afterTrigger.match(/^[^.!?;]+/);
    return clauseMatch ? clauseMatch[0].trim() : null;
  };

  // Advanced expletive negation classification
  const classifyExpletive = (text) => {
    const triggerInfo = findExpletiveTrigger(text);
    const hasNe = hasNegation(text);
    const hasLogical = hasLogicalNegation(text);
    const hasSubj = hasSubjunctive(text);
    
    // No trigger found
    if (!triggerInfo) {
      if (hasNe) {
        return hasLogical 
          ? "Logical negation detected: 'ne' + logical markers found, but no expletive triggers."
          : "Negation found, but no expletive triggers ('peur que', 'avant que', etc.) detected.";
      }
      return "No expletive negation triggers found.";
    }

    // Trigger found, analyze negation type
    if (!hasNe) {
      return `Found '${triggerInfo.match}' trigger but no 'ne' detected. Incomplete expletive construction.`;
    }

    // Calculate confidence
    const confidence = calculateConfidence(text, triggerInfo);
    const confidencePercent = Math.round(confidence * 100);

    // Build detailed analysis
    let result = [];
    
    // Main classification
    if (hasLogical) {
      result.push(`Logical negation detected - Trigger: ${triggerInfo.match}, 'ne' found with logical markers`);
    } else {
      result.push(`✅ EXPLETIVE NEGATION - Trigger: ${triggerInfo.match}`);
    }
    
    // Supporting evidence
    let evidence = [];
    
    // Trigger analysis
    if (triggerInfo.type === 'peur') {
      evidence.push("Fear expression trigger");
      if (text.match(/\b(?:grand[e]?\s+)?peur\b/i)) {
        evidence.push("Intensified fear construction");
      }
    } else if (triggerInfo.type === 'avant') {
      evidence.push("Temporal expression trigger");
      if (text.match(/\b(?:juste|bien|peu|longtemps)\s+avant\b/i)) {
        evidence.push("Precise temporal marker");
      }
    }
    
    // Mood analysis
    if (hasSubj) {
      evidence.push("Subjunctive mood detected");
      // Identify specific subjunctive form
      for (const [category, pattern] of Object.entries(SUBJUNCTIVE_PATTERNS)) {
        if (pattern.test(text)) {
          evidence.push(`Subjunctive form of '${category}'`);
          break;
        }
      }
    }
    
    // Structure analysis
    const complementClause = extractComplementClause(text, triggerInfo);
    if (complementClause) {
      evidence.push("Complete complement clause structure");
    }
    
    // Combine results
    result.push(`Evidence (${confidencePercent}% confidence):`);
    evidence.forEach(e => result.push(`  • ${e}`));
    
    return result.join("\n");
  };

  // Legacy trigger array for backward compatibility
  const TRIGGERS = ["peur que", "avant que"];

  const highlight = (text) => {
    let output = text;
    
    // Highlight expletive triggers using the robust pattern matching
    const triggerInfo = findExpletiveTrigger(text);
    if (triggerInfo) {
      const escapedMatch = triggerInfo.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const triggerRegex = new RegExp(`(${escapedMatch})`, 'gi');
      output = output.replace(triggerRegex, '<span class="highlight-yellow">$1</span>');
    }
    
    // Highlight "ne" and "n'"
    output = output.replace(/\b(ne|n')\b/gi, '<span class="highlight-green">$1</span>');
    
    // Highlight logical negation markers in red
    LOGICAL_MARKERS.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const escapedMatch = match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const markerRegex = new RegExp(`(${escapedMatch})`, 'gi');
        output = output.replace(markerRegex, '<span class="highlight-red">$1</span>');
      });
    });
    
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

      // Detect trigger if not provided using robust pattern matching
      let detectedTrigger = trigger;
      if (!detectedTrigger) {
        const triggerInfo = findExpletiveTrigger(text);
        detectedTrigger = triggerInfo ? triggerInfo.match : '';
      }

      // For backward compatibility, map to simple trigger names
      let simpleTrigger = detectedTrigger;
      if (detectedTrigger) {
        if (detectedTrigger.includes('peur')) simpleTrigger = 'peur que';
        else if (detectedTrigger.includes('avant')) simpleTrigger = 'avant que';
        else if (detectedTrigger.includes('crain')) simpleTrigger = 'craindre';
        else if (detectedTrigger.includes('redout')) simpleTrigger = 'redouter';
        else if (detectedTrigger.includes('dout')) simpleTrigger = 'douter';
        else if (detectedTrigger.includes('évit')) simpleTrigger = 'éviter';
        else if (detectedTrigger.includes('empêch')) simpleTrigger = 'empêcher';
      }

      if (simpleTrigger && (TRIGGERS.includes(simpleTrigger) || ['craindre', 'redouter', 'douter', 'éviter', 'empêcher'].includes(simpleTrigger))) {
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

    const triggerInfo = findExpletiveTrigger(text);
    
    if (!triggerInfo) {
      return baseResult;
    }

    // Map robust trigger to simple trigger for training data lookup
    let simpleTrigger = 'peur que'; // default
    if (triggerInfo.match.includes('avant')) simpleTrigger = 'avant que';
    else if (triggerInfo.match.includes('crain')) simpleTrigger = 'craindre';
    else if (triggerInfo.match.includes('redout')) simpleTrigger = 'redouter';
    else if (triggerInfo.match.includes('dout')) simpleTrigger = 'douter';
    else if (triggerInfo.match.includes('évit')) simpleTrigger = 'éviter';
    else if (triggerInfo.match.includes('empêch')) simpleTrigger = 'empêcher';

    // Find similar examples in training data
    const similarExamples = trainingData.filter(item => 
      item.trigger === simpleTrigger || 
      (item.trigger && item.trigger.includes(simpleTrigger.split(' ')[0]))
    );

    if (similarExamples.length === 0) {
      return baseResult + " (No training examples for this trigger)";
    }

    const expletiveCount = similarExamples.filter(item => item.has_expletive_ne).length;
    const totalCount = similarExamples.length;
    const confidence = Math.round((Math.max(expletiveCount, totalCount - expletiveCount) / totalCount) * 100);

    if (baseResult.includes('✅ EXPLETIVE NEGATION')) {
      return `🎯 TRAINING-ENHANCED: '${triggerInfo.match}' + expletive 'ne' (${confidence}% confidence from ${totalCount} training examples)`;
    } else if (baseResult.includes('logical negation')) {
      return `🎯 TRAINING-ENHANCED: '${triggerInfo.match}' + logical negation (${confidence}% confidence from ${totalCount} training examples)`;
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

    // Simple text normalization
    const normalizedText = text.toLowerCase()
      .replace(/['']/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Find similar examples based purely on text similarity
    const scoredExamples = trainingData.map(item => {
      const exampleText = item.text.toLowerCase();
      const words = normalizedText.split(/\s+/);
      const exampleWords = exampleText.split(/\s+/);
      
      // Calculate word overlap
      const commonWords = words.filter(word => exampleWords.includes(word));
      const similarity = commonWords.length / Math.max(words.length, exampleWords.length);
      
      return { ...item, similarity };
    }).sort((a, b) => b.similarity - a.similarity);

    // Get top matches with good similarity
    const topMatches = scoredExamples.slice(0, 5).filter(item => item.similarity > 0.3);
    
    if (topMatches.length === 0) {
      return "No similar examples found in training data.";
    }

    // Calculate prediction based purely on training examples
    const expletiveCount = topMatches.filter(item => item.has_expletive_ne).length;
    const totalCount = topMatches.length;
    const confidence = Math.round((Math.max(expletiveCount, totalCount - expletiveCount) / totalCount) * 100);
    const avgSimilarity = Math.round((topMatches.reduce((sum, item) => sum + item.similarity, 0) / totalCount) * 100);

    // Most similar example for reference
    const bestMatch = topMatches[0];
    const similarityPhrase = bestMatch.similarity > 0.7 ? "very similar to" : 
                            bestMatch.similarity > 0.5 ? "similar to" : 
                            "somewhat similar to";

    if (expletiveCount > totalCount - expletiveCount) {
      return `🤖 PURE TRAINING: Likely had expletive 'ne' (${confidence}% confidence)\n` +
             `   • Based on ${totalCount} similar examples (${avgSimilarity}% avg similarity)\n` +
             `   • Most ${similarityPhrase}: "${bestMatch.text}"`;
    } else {
      return `🤖 PURE TRAINING: Likely had logical negation (${confidence}% confidence)\n` +
             `   • Based on ${totalCount} similar examples (${avgSimilarity}% avg similarity)\n` +
             `   • Most ${similarityPhrase}: "${bestMatch.text}"`;
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
      
      if (config.key === 'classification') {
        return config.direction === 'asc'
          ? a.classification.localeCompare(b.classification)
          : b.classification.localeCompare(a.classification);
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


  // Determine classification type for batch results
  const determineClassification = (text) => {
    const analysis = classifyNegation(text);
    
    // Check for expletive negation
    if (analysis.includes('✅ EXPLETIVE NEGATION') || 
        analysis.includes('🎯 TRAINING-ENHANCED: Expletive') ||
        analysis.includes('🤖 PURE TRAINING: Likely had expletive')) {
      return useTrainingEnhancement && trainingData.length > 0 ? "Expletive (ML)" : "Expletive";
    }
    
    // Check for logical negation
    if (analysis.includes('Logical negation detected') || 
        analysis.includes('🎯 TRAINING-ENHANCED: Logical') ||
        analysis.includes('🤖 PURE TRAINING: Likely had logical')) {
      return useTrainingEnhancement && trainingData.length > 0 ? "Logical (ML)" : "Logical";
    }
    
    // Check for pure training mode
    if (!useExpletiveLogic && enableTrainingData && useTrainingEnhancement && trainingData.length > 0) {
      return "Pure Training";
    }
    
    // Check for absence of 'ne'
    if (!analysis.toLowerCase().includes('ne')) {
      return "No Negation";
    }
    
    // Check for uncertain cases
    if (analysis.includes('AMBIGUOUS') || 
        analysis.includes('🤔 UNCERTAIN') ||
        analysis.includes('Multiple possible interpretations')) {
      return "Uncertain";
    }
    
    // Default to Uncertain for any other case
    return "Uncertain";
  };


  const predictRemovedNegationType = (text) => {
    // Initialize confidence scores
    let expletiveScore = 0;
    let logicalScore = 0;
    
    // 1. Check for expletive triggers
    const triggerInfo = findExpletiveTrigger(text);
    if (triggerInfo) {
      expletiveScore += 0.4; // Base score for having a trigger
      
      // Check for subjunctive mood
      if (hasSubjunctive(text)) {
        expletiveScore += 0.2;
      }
      
      // Check complement clause structure
      const complementClause = extractComplementClause(text, triggerInfo);
      if (complementClause) {
        expletiveScore += 0.1;
      }
    }
    
    // 2. Check for logical negation context
    const words = text.toLowerCase().split(/\s+/);
    const logicalContextWords = ['jamais', 'plus', 'rien', 'personne', 'aucun', 'guère'];
    const hasLogicalContext = logicalContextWords.some(word => words.includes(word));
    
    if (hasLogicalContext) {
      logicalScore += 0.5;
    }
    
    // 3. Check verb tense and mood patterns
    const verbPatterns = {
      indicative: /\b(?:est|sont|était|étaient|sera|seront)\b/i,
      conditional: /\b(?:serait|seraient|aurait|auraient)\b/i
    };
    
    if (verbPatterns.indicative.test(text)) {
      logicalScore += 0.2;
    }
    if (verbPatterns.conditional.test(text)) {
      expletiveScore += 0.1;
    }
    
    // 4. Consider specific constructions
    if (triggerInfo) {
      if (triggerInfo.type === 'peur' || triggerInfo.type === 'craindre') {
        expletiveScore += 0.2;
      }
      if (triggerInfo.type === 'douter' || triggerInfo.type === 'empecher') {
        expletiveScore += 0.15;
      }
    }
    
    // 5. Normalize scores
    const totalScore = expletiveScore + logicalScore;
    if (totalScore > 0) {
      expletiveScore = expletiveScore / totalScore;
      logicalScore = logicalScore / totalScore;
    }
    
    // 6. Make prediction
    const confidence = Math.max(expletiveScore, logicalScore);
    const predictedType = expletiveScore > logicalScore ? 'expletive' : 'logical';
    
    return {
      type: predictedType,
      confidence: Math.round(confidence * 100),
      evidence: {
        hasTrigger: !!triggerInfo,
        triggerType: triggerInfo ? triggerInfo.type : null,
        hasSubjunctive: hasSubjunctive(text),
        hasLogicalContext: hasLogicalContext
      }
    };
  };

  const formatPredictionResult = (prediction) => {
    const { type, confidence, evidence } = prediction;
    let result = '';
    
    if (type === 'expletive') {
      result = `🔍 PREDICTION: Removed EXPLETIVE negation (${confidence}% confidence)`;
      if (evidence.hasTrigger) {
        result += `\n   • Found expletive trigger: ${evidence.triggerType}`;
      }
      if (evidence.hasSubjunctive) {
        result += '\n   • Subjunctive mood detected';
      }
    } else {
      result = `🔍 PREDICTION: Removed LOGICAL negation (${confidence}% confidence)`;
      if (evidence.hasLogicalContext) {
        result += '\n   • Logical negation context detected';
      }
    }
    
    return result;
  };

  const handleBatchAnalyze = () => {
    if (!batchInput.trim()) {
      setBatchResults([]);
      return;
    }

    const sentences = batchInput.split("\n").filter(line => line.trim());
    const results = sentences.map((sentence, index) => {
      const analysis = classifyNegation(sentence.trim());
      const triggerInfo = findExpletiveTrigger(sentence.trim());
      const hasNe = hasNegation(sentence.trim());
      const hasSubj = hasSubjunctive(sentence.trim());
      
      // Build detailed reasoning
      const reasoning = [];
      
      // Check for trigger patterns
      if (triggerInfo) {
        reasoning.push(`Found trigger pattern: "${triggerInfo.match}"`);
        if (triggerInfo.type === 'peur') {
          reasoning.push('Trigger indicates fear expression');
        } else if (triggerInfo.type === 'avant') {
          reasoning.push('Trigger indicates temporal expression');
        }
      }
      
      // Check for 'ne' presence
      if (hasNe) {
        reasoning.push('Contains "ne" negation marker');
      }
      
      // Check for subjunctive
      if (hasSubj) {
        reasoning.push('Contains subjunctive verb form');
      }
      
      // Check for training data matches if enabled
      if (enableTrainingData && useTrainingEnhancement && trainingData.length > 0) {
        const similarExamples = trainingData.filter(example => 
          example.text.toLowerCase().includes(sentence.toLowerCase()) ||
          sentence.toLowerCase().includes(example.text.toLowerCase())
        );
        if (similarExamples.length > 0) {
          reasoning.push(`Found ${similarExamples.length} similar examples in training data`);
        }
      }
      
      // Determine confidence level
      const confidence = calculateConfidence(sentence.trim(), triggerInfo);
      reasoning.push(`Confidence level: ${Math.round(confidence * 100)}%`);
      
      return {
        id: index + 1,
        text: sentence.trim(),
        highlightedText: highlight(sentence.trim()),
        label: analysis,
        classification: determineClassification(sentence.trim()),
        reasoning: reasoning.join('\n'),
        confidence: confidence
      };
    });
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
      ['Sentence #', 'Text', 'Analysis Result', 'Trigger Indicator', 'Confidence', 'Triggers', 'Analysis Mode'],
      // Data rows
      ...batchResults.map(result => {
        // Extract confidence if available
        const confidenceMatch = result.label.match(/(\d+)%/);
        const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
        
        // Extract triggers if available
        const triggerMatch = result.label.match(/Trigger: ([^,\n]+)/);
        const triggers = triggerMatch ? triggerMatch[1] : 'None';
        
        return [
          result.id,
          result.text,
          result.label,
          result.classification, // Use the direct classification field
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
      ['Pure Training (Uncertain):', stats.pureTrainingCount],
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
      // Count classifications using the corrected classification field
      if (result.classification === 'Expletive' || result.classification === 'Expletive (ML)') {
        stats.expletiveCount++;
      } else if (result.classification === 'Logical' || result.classification === 'Logical (ML)') {
        stats.logicalCount++;
      } else if (result.classification === 'Pure Training') {
        stats.pureTrainingCount++;
      } else {
        stats.noNegationCount++;
      }
      
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
    const headers = ['Sentence_Number', 'Text', 'Analysis_Result', 'Trigger_Indicator', 'Confidence', 'Triggers_Found', 'Analysis_Mode'];
    
    // Process results into CSV format
    const csvData = batchResults.map(result => {
      // Extract confidence if available
      const confidenceMatch = result.label.match(/(\d+)%/);
      const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
      
      // Extract triggers if available
      const triggerMatch = result.label.match(/Trigger: ([^,\n]+)/);
      const triggers = triggerMatch ? triggerMatch[1] : 'None';
      
      return [
        result.id,
        `"${result.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${result.label.replace(/"/g, '""')}"`,
        result.classification, // Use the direct classification field
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
        const confidenceMatch = result.label.match(/(\d+)%/);
        const triggerMatch = result.label.match(/Trigger: ([^,\n]+)/);
        
        return {
          sentenceNumber: result.id,
          text: result.text,
          analysisResult: result.label,
          classification: {
            type: result.classification.toLowerCase().replace(/\s+/g, '_'),
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
        <h2 className="title">🔬 French Expletive Negation System</h2>
        
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
              <li><strong>"peur que" constructions:</strong>
                <ul>
                  <li>All conjugations of "avoir peur que"</li>
                  <li>Prepositional forms (par/de/dans peur que)</li>
                  <li>Intensity modifiers (très/grand peur que)</li>
                </ul>
              </li>
              <li><strong>"avant que" constructions:</strong>
                <ul>
                  <li>Basic temporal markers</li>
                  <li>Time precision (juste/bien/peu avant que)</li>
                  <li>Complex temporal expressions</li>
                </ul>
              </li>
              <li><strong>Subjunctive detection:</strong>
                <ul>
                  <li>Common verbs (être, avoir, aller)</li>
                  <li>Irregular forms</li>
                  <li>Position after "que"</li>
                </ul>
              </li>
              <li><strong>Confidence scoring based on:</strong>
                <ul>
                  <li>Trigger type and completeness</li>
                  <li>Subjunctive presence</li>
                  <li>Complement clause structure</li>
                </ul>
              </li>
            </ul>
            <p><strong>Examples:</strong></p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>"J'ai peur qu'il ne vienne" (expletive)</li>
              <li>"J'ai grand peur qu'il ne soit malade" (expletive with intensity)</li>
              <li>"Avant qu'il ne parte" (temporal expletive)</li>
              <li>"J'ai peur qu'il ne vienne pas" (logical negation)</li>
            </ul>
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
              <li><strong>Text Similarity Only</strong>
                <ul>
                  <li>No rule-based pattern matching</li>
                  <li>No predefined triggers or patterns</li>
                  <li>Pure example-based learning</li>
                </ul>
              </li>
              <li><strong>Similarity Measures</strong>
                <ul>
                  <li>Word overlap analysis</li>
                  <li>Context matching</li>
                  <li>Confidence based on similar examples</li>
                </ul>
              </li>
              <li><strong>Training Data Usage</strong>
                <ul>
                  <li>Uses only your examples</li>
                  <li>No external patterns or rules</li>
                  <li>Transparent example matching</li>
                </ul>
              </li>
            </ul>
            <p><strong>Example Output:</strong></p>
            <pre style={{ 
              fontSize: '12px', 
              backgroundColor: 'white', 
              padding: '10px', 
              borderRadius: '4px',
              margin: '5px 0'
            }}>
{`🤖 PURE TRAINING: Likely had expletive 'ne' (80% confidence)
   • Based on 5 similar examples (75% avg similarity)
   • Most similar to: "J'ai peur qu'il vienne"`}
            </pre>
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
              backgroundColor: result.includes('Logical negation detected') || 
                             result.includes('🎯 TRAINING-ENHANCED: Logical') || 
                             result.includes('🤖 PURE TRAINING: Likely had logical') ? '#fff3cd' :
                             result.includes('✅ EXPLETIVE NEGATION') || 
                             result.includes('🎯 TRAINING-ENHANCED: Expletive') || 
                             result.includes('🤖 PURE TRAINING: Likely had expletive') ? '#d4edda' : 
                             '#f8f9fa',
              border: `1px solid ${result.includes('Logical negation detected') || 
                                  result.includes('🎯 TRAINING-ENHANCED: Logical') || 
                                  result.includes('🤖 PURE TRAINING: Likely had logical') ? '#ffeaa7' :
                                  result.includes('✅ EXPLETIVE NEGATION') || 
                                  result.includes('🎯 TRAINING-ENHANCED: Expletive') || 
                                  result.includes('🤖 PURE TRAINING: Likely had expletive') ? '#c3e6cb' : 
                                  '#dee2e6'}`,
              borderRadius: '8px',
              fontWeight: result.includes('✅ EXPLETIVE NEGATION') || 
                         result.includes('🎯 TRAINING-ENHANCED') || 
                         result.includes('🤖 PURE TRAINING') ? 'bold' : 'normal'
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
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #4caf50'
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
                      onClick={() => handleSort('classification')}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontWeight: 'bold',
                        minWidth: '120px'
                      }}
                    >
                      🎯 Trigger Indicator{getSortIcon('classification')}
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
                  {sortedResults.map(({ id, text, label, highlightedText, classification }, index) => (
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
                        textAlign: 'center'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: 
                            classification === 'Expletive' || classification === 'Expletive (ML)' ? '#d4edda' :
                            classification === 'Logical' || classification === 'Logical (ML)' ? '#fff3cd' :
                            classification === 'Pure Training' ? '#f3e5f5' :
                            '#f8f9fa',
                          color:
                            classification === 'Expletive' || classification === 'Expletive (ML)' ? '#155724' :
                            classification === 'Logical' || classification === 'Logical (ML)' ? '#856404' :
                            classification === 'Pure Training' ? '#6a1b9a' :
                            '#495057',
                          border: `1px solid ${
                            classification === 'Expletive' || classification === 'Expletive (ML)' ? '#c3e6cb' :
                            classification === 'Logical' || classification === 'Logical (ML)' ? '#ffeaa7' :
                            classification === 'Pure Training' ? '#e1bee7' :
                            '#dee2e6'
                          }`
                        }}>
                          {classification}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px',
                        wordBreak: 'break-word'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: label.includes('Logical negation detected') || 
                                        label.includes('🎯 TRAINING-ENHANCED: Logical') || 
                                        label.includes('🤖 PURE TRAINING: Likely had logical') ? '#fff3cd' : 
                                        label.includes('✅ EXPLETIVE NEGATION') || 
                                        label.includes('🎯 TRAINING-ENHANCED: Expletive') || 
                                        label.includes('🤖 PURE TRAINING: Likely had expletive') ? '#d4edda' : 
                                        'transparent',
                          border: `1px solid ${label.includes('Logical negation detected') || 
                                              label.includes('🎯 TRAINING-ENHANCED: Logical') || 
                                              label.includes('🤖 PURE TRAINING: Likely had logical') ? '#ffeaa7' :
                                              label.includes('✅ EXPLETIVE NEGATION') || 
                                              label.includes('🎯 TRAINING-ENHANCED: Expletive') || 
                                              label.includes('🤖 PURE TRAINING: Likely had expletive') ? '#c3e6cb' : 
                                              'transparent'}`,
                          borderRadius: '4px',
                          fontWeight: label.includes('✅ EXPLETIVE NEGATION') || 
                                    label.includes('🎯 TRAINING-ENHANCED') || 
                                    label.includes('🤖 PURE TRAINING') ? 'bold' : 'normal',
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
              💡 <strong>Tip:</strong> Click on column headers to sort the results. The Trigger Indicator column shows color-coded badges for easy identification: 
              <span style={{color: '#155724'}}>🟢 Expletive</span> (including ML predictions), 
              <span style={{color: '#856404'}}>🟡 Logical</span> (including ML predictions), 
              <span style={{color: '#6a1b9a'}}>🟣 Pure Training</span> (uncertain ML predictions). 
              {!useExpletiveLogic && !enableTrainingData
                ? "Analysis results show basic negation detection."
                : useExpletiveLogic && !enableTrainingData
                  ? "Analysis results show rule-based expletive negation detection."
                  : !useExpletiveLogic && enableTrainingData
                    ? "Analysis results show pure training-based predictions from your data."
                    : "Analysis results show hybrid rule-based analysis (enhanced with training data when available)."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
