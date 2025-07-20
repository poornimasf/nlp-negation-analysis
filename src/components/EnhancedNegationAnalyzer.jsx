import React, { useState, useEffect } from 'react';
import './NegationAnalyzer.css';

const EnhancedNegationAnalyzer = () => {
  // Original functionality state
  const [inputText, setInputText] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [results, setResults] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('french');
  const [highlightedText, setHighlightedText] = useState('');
  const [activeTab, setActiveTab] = useState('inference');
  
  // Enhanced functionality state
  const [systemStats, setSystemStats] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [userFeedback, setUserFeedback] = useState({
    negation_detected: null,
    confidence_score: null,
    comments: ''
  });
  
  // Training data state
  const [trainingData, setTrainingData] = useState([]);
  const [trainingStats, setTrainingStats] = useState({
    totalExamples: 0,
    withoutNe: 0,
    withNe: 0,
    lastUpdated: null
  });
  const [uploadError, setUploadError] = useState(null);
  const [learnedPatterns, setLearnedPatterns] = useState({
    french: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
    english: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
    mandarin: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } }
  });

  // Password protection for training data management
  const [isTrainingAuthorized, setIsTrainingAuthorized] = useState(
    localStorage.getItem('training_authorized') === 'true'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Prediction tab state
  const [predictionText, setPredictionText] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  // Batch prediction tab state
  const [batchPredictionInput, setBatchPredictionInput] = useState('');
  const [batchPredictionResults, setBatchPredictionResults] = useState([]);
  const [batchPredictionLoading, setBatchPredictionLoading] = useState(false);
  const [batchPredictionStats, setBatchPredictionStats] = useState(null);

  // Research-specific state for expletive inference
  const [inferenceMode, setInferenceMode] = useState(false);
  const [inferenceResults, setInferenceResults] = useState(null);
  const [researchDataset, setResearchDataset] = useState([]);
  const [evaluationMetrics, setEvaluationMetrics] = useState(null);
  const [inferenceText, setInferenceText] = useState('');
  const [inferenceLoading, setInferenceLoading] = useState(false);

  // Set your secure password here (in production, use environment variables)
  const TRAINING_PASSWORD = 'Buffalo25';

  // Constants from original component
  const TRIGGERS = {
    french: {
      en: ["craindre", "avoir peur que", "peur que", "redouter", "avant que", "regretter"],
      nonEn: ["commencer", "arrêter", "cesser", "décider", "oublier"],
    },
    english: {
      en: ["afraid", "fear", "regret", "prevent", "before"],
      nonEn: ["start", "stop", "decide", "quit"],
    },
    mandarin: {
      en: ["怕", "抱歉", "避免", "前"],
      nonEn: ["开始", "停止", "决定"],
    },
  };

  // Load system statistics on component mount
  useEffect(() => {
    loadSystemStats();
    loadExistingTrainingData();
  }, []);

  const loadExistingTrainingData = async () => {
    try {
      // In a real implementation, you would load the Excel file from the data folder
      // For now, we'll simulate loading some training patterns
      const mockTrainingPatterns = {
        french: {
          withNe: {
            patterns: [
              { text: "Je crains qu'il ne vienne", classification: "expletive", subjects: ["il"], verbs: ["vienne"] },
              { text: "J'ai peur qu'elle ne soit malade", classification: "expletive", subjects: ["elle"], verbs: ["soit"] },
              { text: "Je redoute qu'ils ne partent", classification: "expletive", subjects: ["ils"], verbs: ["partent"] }
            ],
            statistics: {
              commonConstructions: {
                "il vienne": 15,
                "elle soit": 12,
                "ils partent": 8
              }
            }
          },
          withoutNe: {
            patterns: [
              { text: "Je pense qu'il viendra", classification: "logical", subjects: ["il"], verbs: ["viendra"] },
              { text: "Je crois qu'elle est malade", classification: "logical", subjects: ["elle"], verbs: ["est"] },
              { text: "Je sais qu'ils partiront", classification: "logical", subjects: ["ils"], verbs: ["partiront"] }
            ],
            statistics: {
              commonConstructions: {
                "il viendra": 20,
                "elle est": 18,
                "ils partiront": 10
              }
            }
          }
        },
        english: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
        mandarin: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } }
      };

      setLearnedPatterns(mockTrainingPatterns);
      
      // Update training stats
      const totalWithNe = mockTrainingPatterns.french.withNe.patterns.length;
      const totalWithoutNe = mockTrainingPatterns.french.withoutNe.patterns.length;
      
      setTrainingStats({
        totalExamples: totalWithNe + totalWithoutNe,
        withNe: totalWithNe,
        withoutNe: totalWithoutNe,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading existing training data:', error);
    }
  };

  // Helper functions from original component
  const hasNegation = (text, lang) => {
    const patterns = {
      french: /\bne\b([^a-zA-Z]|\s|$)/i,
      english: /\bnot\b|\bnever\b|\bno\b|\bnobody\b/i,
      mandarin: /不|没|别/,
    };
    return patterns[lang].test(text);
  };

  const highlightNegation = (text, lang) => {
    const patterns = {
      french: /(\bne\b)/gi,
      english: /(\bnot\b|\bnever\b|\bno\b|\bnobody\b)/gi,
      mandarin: /(不|没|别)/g,
    };
    
    return text.replace(patterns[lang], '<mark>$1</mark>');
  };

  // Advanced expletive vs logical negation classification
  const extractComplement = (text, trigger) => {
    if (!trigger) return text;
    const triggerIndex = text.indexOf(trigger);
    if (triggerIndex === -1) return text;
    return text.substring(triggerIndex + trigger.length);
  };

  const classifyNegation = (text, lang) => {
    const lowerText = text.toLowerCase();
    const enTrigger = TRIGGERS[lang]?.en.find(trigger => lowerText.includes(trigger));
    const nonEnTrigger = TRIGGERS[lang]?.nonEn.find(trigger => lowerText.includes(trigger));
    const negation = hasNegation(lowerText, lang);
    
    if (!negation) return "No negation detected.";

    const matchedTrigger = enTrigger || nonEnTrigger || "";
    const relevantClause = extractComplement(lowerText, matchedTrigger);
    const clauseHasNeg = hasNegation(relevantClause, lang);

    // Check for full logical negation (ne + pas/rien/jamais/etc.)
    const isFullNegation = /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i.test(relevantClause);
    if (isFullNegation) return "Logically consistent negation. Not expletive.";

    if (!clauseHasNeg) return "Negation found, but not in the complement clause. No expletive negation.";

    // Special case for "peur que" constructions
    if (/\bpeur que\b[^.?!]*\b(il|elle|je|tu|nous|vous|ils|elles)\b[^.?!]{0,10}\b(s'agisse|soit|ait|aille|vienne|tombe|manque)\b/i.test(lowerText) && !/\bne\b/i.test(relevantClause)) {
      return "EN-trigger + logically consistent negation";
    }

    // Classify based on trigger type and negation pattern
    if (enTrigger) {
      if (/\b(peur|craindre|redouter|regretter) que\b[^.?!]*\bne\b(?!\s+(pas|rien|jamais|plus|aucun))/i.test(lowerText)) {
        return "EN-trigger + expletive negation";
      }
      return "EN-trigger + logically consistent negation";
    } else if (nonEnTrigger) {
      return "Non-EN-trigger + logically inconsistent negation";
    } else {
      return "Trigger not clearly identified.";
    }
  };

  // Pattern extraction for advanced analysis
  const extractPeurQuePatterns = (text) => {
    const patterns = {
      peurQue: [],
      expletiveNe: [],
      context: [],
      subjects: [],
      verbs: []
    };
    
    // Enhanced regex to capture all "peur que" variations
    const peurQueRegex = /\b(?:(?:avoir|par|de|dans\s+la)\s+)?peur\s+que\b[^.!?]*[.!?]/gi;
    const neRegex = /\bne\b(?!\s+(pas|plus|jamais|rien|personne|aucun|guère))[^.!?]*?(?=\b(soit|ait|fasse|vienne|parte|tombe|mange|dise|prenne|mette|comprenne|sache|puisse|veuille)\b)/gi;
    const subjectRegex = /\b(je|tu|il|elle|nous|vous|ils|elles)\b/gi;
    const verbRegex = /\b(soit|ait|fasse|vienne|parte|tombe|mange|dise|prenne|mette|comprenne|sache|puisse|veuille)\b/gi;

    let match;
    while ((match = peurQueRegex.exec(text)) !== null) {
      patterns.peurQue.push({
        full: match[0],
        context: text.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30)
      });
    }
    
    while ((match = neRegex.exec(text)) !== null) {
      patterns.expletiveNe.push({
        pattern: match[0],
        context: text.slice(Math.max(0, match.index - 20), match.index + match[0].length + 20)
      });
    }
    
    patterns.subjects = text.match(subjectRegex) || [];
    patterns.verbs = text.match(verbRegex) || [];
    
    return patterns;
  };

  const calculatePatternScore = (testPatterns, learnedPatterns) => {
    if (!learnedPatterns || learnedPatterns.length === 0) return 0;
    
    let score = 0;
    const weights = {
      subject: 0.3,
      verb: 0.3,
      construction: 0.4
    };

    const subjectMatch = testPatterns.subjects.some(subject =>
      learnedPatterns.some(p => p.subjects && p.subjects.includes(subject))
    );
    if (subjectMatch) score += weights.subject;

    const verbMatch = testPatterns.verbs.some(verb =>
      learnedPatterns.some(p => p.verbs && p.verbs.includes(verb))
    );
    if (verbMatch) score += weights.verb;

    const constructionMatch = testPatterns.peurQue.some(({ full }) =>
      learnedPatterns.some(p => 
        p.peurQue && p.peurQue.some(learned => learned.full && learned.full.includes(full))
      )
    );
    if (constructionMatch) score += weights.construction;

    return score;
  };

  // Enhanced classification combining rules and learning
  const enhancedClassifyNegation = (text, lang) => {
    const basicClassification = classifyNegation(text, lang);
    
    if (lang === 'french' && learnedPatterns.french) {
      const patterns = extractPeurQuePatterns(text);
      const stats = learnedPatterns.french;
      
      // Enhanced "peur que" pattern analysis
      if (patterns.peurQue.length > 0) {
        const hasExpletiveNe = patterns.expletiveNe.length > 0;
        const hasSubjunctive = patterns.verbs.some(verb => 
          ['soit', 'ait', 'vienne', 'comprenne', 'sache', 'puisse', 'veuille'].includes(verb.toLowerCase())
        );
        
        // Strong indicator for expletive negation in "peur que" constructions
        if (hasExpletiveNe && hasSubjunctive) {
          return "Expletive negation in 'peur que' construction (high confidence)";
        }
        
        // Check against training data patterns
        if (trainingData.length > 0) {
          const peurQueTrainingMatches = trainingData.filter(item => 
            item.text && item.text.toLowerCase().includes('peur que')
          );
          
          if (peurQueTrainingMatches.length > 0) {
            const expletiveMatches = peurQueTrainingMatches.filter(item =>
              item.classification?.toLowerCase().includes('expletive') ||
              item.classification?.toLowerCase().includes('with')
            );
            
            const expletiveRatio = expletiveMatches.length / peurQueTrainingMatches.length;
            
            if (expletiveRatio > 0.7) {
              return "Likely expletive negation (based on 'peur que' training patterns)";
            } else if (expletiveRatio < 0.3) {
              return "Likely logical negation (based on 'peur que' training patterns)";
            }
          }
        }
      }
      
      // Original pattern scoring logic
      const withNeScore = calculatePatternScore(patterns, stats.withNe?.patterns || []);
      const withoutNeScore = calculatePatternScore(patterns, stats.withoutNe?.patterns || []);
      
      if (withNeScore > withoutNeScore && withNeScore > 0.6) {
        return "Expletive negation (high confidence from training data)";
      } else if (withoutNeScore > withNeScore && withoutNeScore > 0.6) {
        return "Logical negation (high confidence from training data)";
      } else if (patterns.expletiveNe.length > 0) {
        const hasLearnedPattern = patterns.subjects.some(subj => 
          patterns.verbs.some(verb => 
            stats.withNe?.statistics?.commonConstructions?.[`${subj} ${verb}`]
          )
        );
        
        if (hasLearnedPattern) {
          return "Likely expletive negation (based on learned patterns)";
        }
      }
    }

    return basicClassification;
  };

  // Training data management functions
  const validateTrainingData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.every(row => 
      typeof row === 'object' && 
      Object.keys(row).length >= 2
    );
  };

  const processTrainingData = (data) => {
    const processed = data.map((row, index) => ({
      id: index + 1,
      text: Object.values(row)[0] || '',
      classification: Object.values(row)[1] || '',
      language: language,
      timestamp: new Date().toISOString()
    }));

    setTrainingData(processed);
    
    // Update training statistics
    const stats = {
      totalExamples: processed.length,
      withoutNe: processed.filter(item => 
        item.classification?.toLowerCase().includes('without') || 
        item.classification?.toLowerCase().includes('logical')
      ).length,
      withNe: processed.filter(item => 
        item.classification?.toLowerCase().includes('with') || 
        item.classification?.toLowerCase().includes('expletive')
      ).length,
      lastUpdated: new Date().toISOString()
    };
    
    setTrainingStats(stats);
    
    // Process patterns for learning (simplified version)
    processLearningPatterns(processed);
  };

  const processLearningPatterns = (data) => {
    const patterns = {
      french: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
      english: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
      mandarin: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } }
    };

    data.forEach(item => {
      const lang = item.language || 'french';
      const isWithNe = item.classification?.toLowerCase().includes('with') || 
                      item.classification?.toLowerCase().includes('expletive');
      
      const category = isWithNe ? 'withNe' : 'withoutNe';
      
      if (patterns[lang] && patterns[lang][category]) {
        patterns[lang][category].patterns.push({
          text: item.text,
          classification: item.classification,
          id: item.id
        });
      }
    });

    setLearnedPatterns(patterns);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      // For demo purposes, we'll simulate file processing
      // In production, you'd use a library like xlsx to parse Excel files
      const text = await file.text();
      let jsonData;

      if (file.name.endsWith('.json')) {
        jsonData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing (for demo)
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        jsonData = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
          });
          return obj;
        });
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.');
      }

      if (!validateTrainingData(jsonData)) {
        setUploadError("Invalid file format. Please ensure the file has at least two columns.");
        return;
      }

      processTrainingData(jsonData);
      alert(`Successfully processed ${jsonData.length} training examples!`);
      
    } catch (error) {
      setUploadError(`Error processing file: ${error.message}`);
    }
  };

  const clearTrainingData = () => {
    if (window.confirm('Are you sure you want to clear all training data?')) {
      setTrainingData([]);
      setTrainingStats({
        totalExamples: 0,
        withoutNe: 0,
        withNe: 0,
        lastUpdated: null
      });
      setLearnedPatterns({
        french: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
        english: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
        mandarin: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } }
      });
    }
  };

  // Prediction function for expletive negation likelihood
  const predictExpletiveNegation = (text) => {
    if (!text.trim()) return null;

    const normalizedText = text.toLowerCase().trim();
    let expletiveScore = 0;
    let logicalScore = 0;
    let totalIndicators = 0;
    const foundPatterns = [];

    // Analyze patterns from training data
    const frenchPatterns = learnedPatterns.french;
    
    // Check for expletive negation indicators (comprehensive coverage for training data)
    const expletiveIndicators = [
      // Core "peur que" patterns
      'peur qu', 'peur que', 'ai peur qu', 'as peur qu', 'a peur qu', 'avons peur qu', 'avez peur qu', 'ont peur qu',
      'avoir peur qu', 'avoir peur que', 'par peur qu', 'par peur que', 'de peur qu', 'de peur que', 'dans la peur qu', 'dans la peur que',
      
      // Craindre patterns (all conjugations)
      'craindre qu', 'craindre que', 'crains qu', 'crains que', 'craint qu', 'craint que', 
      'craignons qu', 'craignons que', 'craignez qu', 'craignez que', 'craignent qu', 'craignent que',
      
      // Redouter patterns (all conjugations)
      'redouter qu', 'redouter que', 'redoute qu', 'redoute que', 'redoutes qu', 'redoutes que',
      'redoutons qu', 'redoutons que', 'redoutez qu', 'redoutez que', 'redoutent qu', 'redoutent que',
      
      // Douter patterns (all conjugations)
      'douter qu', 'douter que', 'doute qu', 'doute que', 'doutes qu', 'doutes que',
      'doutons qu', 'doutons que', 'doutez qu', 'doutez que', 'doutent qu', 'doutent que',
      
      // Éviter patterns (all conjugations)
      'éviter qu', 'éviter que', 'évite qu', 'évite que', 'évites qu', 'évites que',
      'évitons qu', 'évitons que', 'évitez qu', 'évitez que', 'évitent qu', 'évitent que',
      
      // Empêcher patterns (all conjugations)
      'empêcher qu', 'empêcher que', 'empêche qu', 'empêche que', 'empêches qu', 'empêches que',
      'empêchons qu', 'empêchons que', 'empêchez qu', 'empêchez que', 'empêchent qu', 'empêchent que',
      
      // Appréhender patterns
      'appréhender qu', 'appréhender que', 'appréhende qu', 'appréhende que', 'appréhendes qu', 'appréhendes que',
      'appréhendons qu', 'appréhendons que', 'appréhendez qu', 'appréhendez que', 'appréhendent qu', 'appréhendent que',
      
      // Prendre garde patterns
      'prendre garde qu', 'prendre garde que', 'prends garde qu', 'prends garde que', 'prend garde qu', 'prend garde que',
      'prenons garde qu', 'prenons garde que', 'prenez garde qu', 'prenez garde que', 'prennent garde qu', 'prennent garde que',
      
      // Se garder patterns
      'se garder qu', 'se garder que', 'me garde qu', 'me garde que', 'te garde qu', 'te garde que',
      'se garde qu', 'se garde que', 'nous gardons qu', 'nous gardons que', 'vous gardez qu', 'vous gardez que', 'se gardent qu', 'se gardent que',
      
      // Nier patterns
      'nier qu', 'nier que', 'nie qu', 'nie que', 'nies qu', 'nies que',
      'nions qu', 'nions que', 'niez qu', 'niez que', 'nient qu', 'nient que',
      
      // Contester patterns
      'contester qu', 'contester que', 'conteste qu', 'conteste que', 'contestes qu', 'contestes que',
      'contestons qu', 'contestons que', 'contestez qu', 'contestez que', 'contestent qu', 'contestent que',
      
      // Désespérer patterns
      'désespérer qu', 'désespérer que', 'désespère qu', 'désespère que', 'désespères qu', 'désespères que',
      'désespérons qu', 'désespérons que', 'désespérez qu', 'désespérez que', 'désespèrent qu', 'désespèrent que',
      
      // Fixed expressions
      'il s\'en faut qu', 'il s\'en faut que', 'peu s\'en faut qu', 'peu s\'en faut que',
      'avant qu', 'avant que', 'à moins qu', 'à moins que', 'de crainte qu', 'de crainte que', 'sans qu', 'sans que'
    ];

    // Check for logical negation indicators (comprehensive patterns)
    const logicalIndicators = [
      // Standard logical negation patterns
      'ne pas', 'ne plus', 'ne jamais', 'ne rien', 'ne personne',
      'ne guère', 'ne point', 'ne nullement', 'ne aucun', 'ne nul',
      'ne aucune', 'ne nulle part', 'ne que',
      
      // Contracted forms
      'n\'ai pas', 'n\'as pas', 'n\'a pas', 'n\'avons pas', 'n\'avez pas', 'n\'ont pas',
      'n\'ai plus', 'n\'as plus', 'n\'a plus', 'n\'avons plus', 'n\'avez plus', 'n\'ont plus',
      'n\'ai jamais', 'n\'as jamais', 'n\'a jamais', 'n\'avons jamais', 'n\'avez jamais', 'n\'ont jamais',
      
      // Verb-specific logical negations
      'ne sais pas', 'ne sait pas', 'ne savons pas', 'ne savez pas', 'ne savent pas',
      'ne veux pas', 'ne veut pas', 'ne voulons pas', 'ne voulez pas', 'ne veulent pas',
      'ne peux pas', 'ne peut pas', 'ne pouvons pas', 'ne pouvez pas', 'ne peuvent pas',
      'ne vais pas', 'ne va pas', 'ne allons pas', 'ne allez pas', 'ne vont pas',
      'ne fais pas', 'ne fait pas', 'ne faisons pas', 'ne faites pas', 'ne font pas',
      
      // Thinking/believing verbs with logical negation
      'ne pense pas', 'ne penses pas', 'ne pensons pas', 'ne pensez pas', 'ne pensent pas',
      'ne crois pas', 'ne croit pas', 'ne croyons pas', 'ne croyez pas', 'ne croient pas',
      'ne dis pas', 'ne dit pas', 'ne disons pas', 'ne dites pas', 'ne disent pas'
    ];

    // Analyze expletive patterns
    expletiveIndicators.forEach(pattern => {
      if (normalizedText.includes(pattern)) {
        expletiveScore += 3;
        totalIndicators++;
        foundPatterns.push({ type: 'expletive', pattern, weight: 3 });
      }
    });

    // Analyze logical patterns
    logicalIndicators.forEach(pattern => {
      if (normalizedText.includes(pattern)) {
        logicalScore += 2;
        totalIndicators++;
        foundPatterns.push({ type: 'logical', pattern, weight: 2 });
      }
    });

    // Check for "ne" without typical negation words (potential expletive)
    const neMatches = normalizedText.match(/\bne\b/g);
    const negationWords = ['pas', 'plus', 'jamais', 'rien', 'personne', 'guère', 'point', 'nullement', 'aucun', 'nul'];
    
    if (neMatches) {
      const hasNegationWord = negationWords.some(word => normalizedText.includes(word));
      if (!hasNegationWord) {
        expletiveScore += 2;
        totalIndicators++;
        foundPatterns.push({ type: 'expletive', pattern: 'ne without negation word', weight: 2 });
      }
    }

    // Enhanced training data pattern matching for "peur que" constructions
    if (trainingData.length > 0) {
      // Check for direct pattern matches from training data
      const trainingMatches = trainingData.filter(item => {
        if (!item.text) return false;
        
        const trainingText = item.text.toLowerCase();
        const inputWords = normalizedText.split(/\s+/);
        const trainingWords = trainingText.split(/\s+/);
        
        // Check for similar "peur que" constructions
        if (normalizedText.includes('peur qu') && trainingText.includes('peur qu')) {
          return true;
        }
        
        // Check for similar expletive trigger words
        const expletiveTriggers = ['craindre', 'crains', 'redouter', 'redoute', 'douter', 'doute', 'éviter', 'évite', 'empêcher', 'empêche'];
        const hasCommonTrigger = expletiveTriggers.some(trigger => 
          normalizedText.includes(trigger) && trainingText.includes(trigger)
        );
        
        if (hasCommonTrigger) {
          return true;
        }
        
        // Check for similar sentence structure (first 20 characters)
        if (normalizedText.substring(0, 20) === trainingText.substring(0, 20)) {
          return true;
        }
        
        // Check for common subject-verb patterns with "ne"
        const textSubjects = normalizedText.match(/\b(je|tu|il|elle|nous|vous|ils|elles)\b/g) || [];
        const trainingSubjects = trainingText.match(/\b(je|tu|il|elle|nous|vous|ils|elles)\b/g) || [];
        
        const hasCommonSubject = textSubjects.some(subj => trainingSubjects.includes(subj));
        const bothHaveNe = normalizedText.includes(' ne ') && trainingText.includes(' ne ');
        
        return hasCommonSubject && bothHaveNe;
      });
      
      trainingMatches.forEach(item => {
        const isExpletive = item.classification?.toLowerCase().includes('expletive') || 
                           item.classification?.toLowerCase().includes('with') ||
                           item.classification?.toLowerCase().includes('ne');
        
        if (isExpletive) {
          expletiveScore += 3; // Higher weight for training data matches
          totalIndicators++;
          foundPatterns.push({ 
            type: 'training_expletive', 
            pattern: `training: ${item.classification}`, 
            weight: 3 
          });
        } else {
          logicalScore += 3;
          totalIndicators++;
          foundPatterns.push({ 
            type: 'training_logical', 
            pattern: `training: ${item.classification}`, 
            weight: 3 
          });
        }
      });
    }

    // Special handling for "peur que" constructions based on training data patterns
    if (normalizedText.includes('peur qu')) {
      const peurQuePatterns = extractPeurQuePatterns(normalizedText);
      
      if (peurQuePatterns.peurQue.length > 0) {
        // Check if this matches learned "peur que" patterns
        const hasExpletiveNe = peurQuePatterns.expletiveNe.length > 0;
        const hasSubjunctive = peurQuePatterns.verbs.some(verb => 
          ['soit', 'ait', 'vienne', 'comprenne', 'sache', 'puisse', 'veuille', 'fasse', 'parte'].includes(verb.toLowerCase())
        );
        
        // Strong indicator for expletive negation in "peur que" constructions
        if (hasExpletiveNe && hasSubjunctive) {
          expletiveScore += 4; // Very high confidence for "peur que" + expletive "ne" + subjunctive
          totalIndicators++;
          foundPatterns.push({ 
            type: 'peur_que_expletive', 
            pattern: 'peur que + expletive ne + subjunctive', 
            weight: 4 
          });
        } else if (normalizedText.includes('peur qu') && normalizedText.includes(' ne ') && !normalizedText.includes('ne pas')) {
          // "Peur que" with "ne" but no "pas" is likely expletive
          expletiveScore += 3;
          totalIndicators++;
          foundPatterns.push({ 
            type: 'peur_que_ne', 
            pattern: 'peur que + ne (likely expletive)', 
            weight: 3 
          });
        }
      }
    }

    // Check for mixed patterns (both expletive trigger + logical negation)
    const hasExpletiveTrigger = foundPatterns.some(p => p.type === 'expletive');
    const hasLogicalNegation = foundPatterns.some(p => p.type === 'logical');
    
    if (hasExpletiveTrigger && hasLogicalNegation) {
      // When both are present, check which is stronger
      const expletiveWeight = foundPatterns.filter(p => p.type.includes('expletive')).reduce((sum, p) => sum + p.weight, 0);
      const logicalWeight = foundPatterns.filter(p => p.type.includes('logical')).reduce((sum, p) => sum + p.weight, 0);
      
      // Add a mixed pattern indicator
      foundPatterns.push({
        type: 'mixed_pattern',
        pattern: `mixed: expletive(${expletiveWeight}) vs logical(${logicalWeight})`,
        weight: 1
      });
    }

    // Calculate likelihood percentages
    const totalScore = expletiveScore + logicalScore;
    const expletiveLikelihood = totalScore > 0 ? Math.round((expletiveScore / totalScore) * 100) : 0;
    const logicalLikelihood = totalScore > 0 ? Math.round((logicalScore / totalScore) * 100) : 0;

    // Determine confidence level
    let confidence = 'Low';
    if (totalIndicators >= 3) confidence = 'High';
    else if (totalIndicators >= 2) confidence = 'Medium';

    return {
      expletiveLikelihood,
      logicalLikelihood,
      confidence,
      totalIndicators,
      foundPatterns,
      analysis: {
        hasNe: neMatches ? neMatches.length : 0,
        expletiveIndicators: foundPatterns.filter(p => p.type === 'expletive').length,
        logicalIndicators: foundPatterns.filter(p => p.type === 'logical').length,
        trainingMatches: foundPatterns.filter(p => p.type.includes('training')).length
      }
    };
  };

  // Research-specific inference algorithm for original expletive negation
  const inferOriginalExpletiveNegation = (modifiedText, researchDataset = []) => {
    if (!modifiedText.trim()) return null;

    const normalizedText = modifiedText.toLowerCase().trim();
    let inferenceScore = 0;
    let totalIndicators = 0;
    const foundEvidence = [];
    const reasoning = {
      trigger_found: false,
      subjunctive_present: false,
      similar_training_examples: 0,
      linguistic_context: [],
      pattern_matches: []
    };

    // Step 1: Identify expletive trigger patterns (strong indicators)
    const expletiveTriggers = [
      // Core "peur que" patterns
      'peur qu', 'peur que', 'ai peur qu', 'as peur qu', 'a peur qu', 
      'avons peur qu', 'avez peur qu', 'ont peur qu',
      'avoir peur qu', 'avoir peur que', 'par peur qu', 'par peur que', 
      'de peur qu', 'de peur que',
      
      // Craindre patterns
      'crains qu', 'craint qu', 'craignons qu', 'craignez qu', 'craignent qu',
      'craindre qu', 'craindre que',
      
      // Redouter patterns  
      'redoute qu', 'redoutes qu', 'redoutons qu', 'redoutez qu', 'redoutent qu',
      'redouter qu', 'redouter que',
      
      // Douter patterns
      'doute qu', 'doutes qu', 'doutons qu', 'doutez qu', 'doutent qu',
      'douter qu', 'douter que',
      
      // Éviter patterns
      'évite qu', 'évites qu', 'évitons qu', 'évitez qu', 'évitent qu',
      'éviter qu', 'éviter que',
      
      // Empêcher patterns
      'empêche qu', 'empêches qu', 'empêchons qu', 'empêchez qu', 'empêchent qu',
      'empêcher qu', 'empêcher que'
    ];

    // Check for expletive triggers
    const foundTriggers = expletiveTriggers.filter(trigger => normalizedText.includes(trigger));
    if (foundTriggers.length > 0) {
      inferenceScore += 4; // High weight for expletive triggers
      totalIndicators++;
      reasoning.trigger_found = true;
      reasoning.linguistic_context.push(`Expletive trigger found: ${foundTriggers[0]}`);
      foundEvidence.push({ 
        type: 'expletive_trigger', 
        pattern: foundTriggers[0], 
        weight: 4,
        confidence: 0.9 
      });
    }

    // Step 2: Check for subjunctive mood (very strong indicator for expletive context)
    const subjunctiveVerbs = [
      'soit', 'ait', 'vienne', 'comprenne', 'sache', 'puisse', 'veuille', 
      'fasse', 'parte', 'aille', 'tombe', 'manque', 'arrive', 'devienne',
      'prenne', 'mette', 'dise', 'voie', 'entende', 'sorte', 'finisse'
    ];

    const foundSubjunctive = subjunctiveVerbs.filter(verb => normalizedText.includes(verb));
    if (foundSubjunctive.length > 0) {
      inferenceScore += 3; // High weight for subjunctive
      totalIndicators++;
      reasoning.subjunctive_present = true;
      reasoning.linguistic_context.push(`Subjunctive mood: ${foundSubjunctive[0]}`);
      foundEvidence.push({ 
        type: 'subjunctive_mood', 
        pattern: foundSubjunctive[0], 
        weight: 3,
        confidence: 0.85 
      });
    }

    // Step 3: Advanced pattern matching with research dataset
    if (researchDataset.length > 0) {
      const similarPatterns = researchDataset.filter(item => {
        if (!item.original_text || !item.modified_text) return false;
        
        const similarity = calculateTextSimilarity(normalizedText, item.modified_text.toLowerCase());
        return similarity > 0.7;
      });

      reasoning.similar_training_examples = similarPatterns.length;
      
      if (similarPatterns.length > 0) {
        // Weight based on ground truth from research dataset
        const expletiveExamples = similarPatterns.filter(item => item.had_expletive_ne === true);
        const expletiveRatio = expletiveExamples.length / similarPatterns.length;
        
        if (expletiveRatio > 0.6) {
          inferenceScore += 3;
          totalIndicators++;
          reasoning.pattern_matches.push(`${expletiveExamples.length}/${similarPatterns.length} similar examples had expletive ne`);
          foundEvidence.push({ 
            type: 'research_pattern_match', 
            pattern: `${expletiveExamples.length} similar expletive examples`, 
            weight: 3,
            confidence: expletiveRatio 
          });
        }
      }
    }

    // Step 4: Contextual linguistic analysis
    // Check for complement clause structure (que + subject + verb)
    const complementPattern = /que\s+(?:il|elle|je|tu|nous|vous|ils|elles|on)\s+\w+/i;
    if (complementPattern.test(normalizedText)) {
      inferenceScore += 1;
      totalIndicators++;
      reasoning.linguistic_context.push('Complement clause structure detected');
      foundEvidence.push({ 
        type: 'complement_structure', 
        pattern: 'que + subject + verb', 
        weight: 1,
        confidence: 0.6 
      });
    }

    // Step 5: Check for absence of logical negation markers
    const logicalNegationMarkers = ['pas', 'plus', 'jamais', 'rien', 'personne', 'guère', 'point'];
    const hasLogicalMarkers = logicalNegationMarkers.some(marker => normalizedText.includes(marker));
    
    if (!hasLogicalMarkers && foundTriggers.length > 0) {
      inferenceScore += 2; // Absence of logical negation in expletive context
      totalIndicators++;
      reasoning.linguistic_context.push('No logical negation markers found');
      foundEvidence.push({ 
        type: 'absence_logical_negation', 
        pattern: 'no pas/plus/jamais', 
        weight: 2,
        confidence: 0.7 
      });
    }

    // Step 6: Calculate confidence and make inference
    const maxPossibleScore = 12; // 4 + 3 + 3 + 1 + 2 - 1
    const rawConfidence = Math.min(inferenceScore / maxPossibleScore, 1.0);
    
    // Adjust confidence based on number of indicators
    let adjustedConfidence = rawConfidence;
    if (totalIndicators >= 3) adjustedConfidence = Math.min(rawConfidence + 0.1, 1.0);
    if (totalIndicators >= 4) adjustedConfidence = Math.min(rawConfidence + 0.2, 1.0);

    // Determine inference result
    let inference = 'uncertain';
    let likelihood = 50;
    
    if (adjustedConfidence >= 0.7) {
      inference = 'likely_had_expletive';
      likelihood = Math.round(adjustedConfidence * 100);
    } else if (adjustedConfidence >= 0.4) {
      inference = 'possibly_had_expletive';
      likelihood = Math.round(adjustedConfidence * 100);
    } else {
      inference = 'unlikely_had_expletive';
      likelihood = Math.round(adjustedConfidence * 100);
    }

    return {
      inference,
      likelihood,
      confidence: adjustedConfidence,
      confidence_level: adjustedConfidence >= 0.8 ? 'High' : 
                       adjustedConfidence >= 0.6 ? 'Medium' : 'Low',
      total_indicators: totalIndicators,
      inference_score: inferenceScore,
      found_evidence: foundEvidence,
      reasoning,
      analysis: {
        expletive_triggers: foundTriggers.length,
        subjunctive_verbs: foundSubjunctive.length,
        similar_patterns: reasoning.similar_training_examples,
        linguistic_features: reasoning.linguistic_context.length
      }
    };
  };

  // Helper function for text similarity calculation
  const calculateTextSimilarity = (text1, text2) => {
    const words1 = text1.split(/\s+/).filter(w => w.length > 2);
    const words2 = text2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = (2 * commonWords.length) / (words1.length + words2.length);
    
    return similarity;
  };

  // Research dataset processing for training pairs
  const processResearchDataset = (data) => {
    const processed = data.map((item, index) => ({
      id: index + 1,
      original_text: item.original_text || item.text,
      modified_text: item.modified_text || item.text,
      had_expletive_ne: item.had_expletive_ne || item.classification?.toLowerCase().includes('expletive'),
      classification: item.classification,
      expletive_type: item.expletive_type || 'general'
    }));
    
    setResearchDataset(processed);
    return processed;
  };

  // Batch inference evaluation for research
  const evaluateInferenceBatch = async (sentences, groundTruth = []) => {
    if (!sentences || sentences.length === 0) return null;
    
    const results = [];
    let correctInferences = 0;
    let totalEvaluated = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const inference = inferOriginalExpletiveNegation(sentence, researchDataset);
      
      if (inference) {
        results.push({
          id: i + 1,
          text: sentence,
          ...inference
        });
        
        // Compare with ground truth if available
        if (groundTruth[i] !== undefined) {
          const predicted = inference.inference === 'likely_had_expletive';
          const actual = groundTruth[i];
          if (predicted === actual) correctInferences++;
          totalEvaluated++;
        }
      }
    }
    
    // Calculate evaluation metrics
    const metrics = {
      total_sentences: sentences.length,
      total_evaluated: totalEvaluated,
      accuracy: totalEvaluated > 0 ? (correctInferences / totalEvaluated) : 0,
      high_confidence_count: results.filter(r => r.confidence_level === 'High').length,
      medium_confidence_count: results.filter(r => r.confidence_level === 'Medium').length,
      low_confidence_count: results.filter(r => r.confidence_level === 'Low').length,
      average_confidence: results.length > 0 ? 
        results.reduce((sum, r) => sum + r.confidence, 0) / results.length : 0,
      likely_expletive_count: results.filter(r => r.inference === 'likely_had_expletive').length,
      possibly_expletive_count: results.filter(r => r.inference === 'possibly_had_expletive').length,
      unlikely_expletive_count: results.filter(r => r.inference === 'unlikely_had_expletive').length
    };
    
    setEvaluationMetrics(metrics);
    return { results, metrics };
  };

  // Handle single inference analysis
  const handleInference = async () => {
    if (!inferenceText.trim()) return;
    
    setInferenceLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
      
      const result = inferOriginalExpletiveNegation(inferenceText, researchDataset);
      setInferenceResults(result);
    } catch (error) {
      console.error('Inference error:', error);
    } finally {
      setInferenceLoading(false);
    }
  };

  // Handle prediction analysis
  const handlePrediction = async () => {
    if (!predictionText.trim()) return;
    
    setPredictionLoading(true);
    
    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = predictExpletiveNegation(predictionText);
      setPredictionResult(result);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  // Handle batch prediction analysis
  const handleBatchPrediction = async () => {
    if (!batchPredictionInput.trim()) return;
    
    setBatchPredictionLoading(true);
    setBatchPredictionResults([]);
    setBatchPredictionStats(null);
    
    try {
      // Split input into sentences
      const sentences = batchPredictionInput
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (sentences.length === 0) {
        setBatchPredictionLoading(false);
        return;
      }

      const results = [];
      let totalExpletive = 0;
      let totalLogical = 0;
      let highConfidenceCount = 0;
      let mediumConfidenceCount = 0;
      let lowConfidenceCount = 0;

      // Process each sentence with a small delay for better UX
      for (let i = 0; i < sentences.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const sentence = sentences[i];
        const prediction = predictExpletiveNegation(sentence);
        
        if (prediction) {
          results.push({
            id: i + 1,
            text: sentence,
            ...prediction
          });

          // Update statistics
          if (prediction.expletiveLikelihood > prediction.logicalLikelihood) {
            totalExpletive++;
          } else if (prediction.logicalLikelihood > prediction.expletiveLikelihood) {
            totalLogical++;
          }

          // Count confidence levels
          switch (prediction.confidence) {
            case 'High':
              highConfidenceCount++;
              break;
            case 'Medium':
              mediumConfidenceCount++;
              break;
            case 'Low':
              lowConfidenceCount++;
              break;
          }
        }
      }

      // Calculate overall statistics
      const stats = {
        totalSentences: sentences.length,
        expletiveLikely: totalExpletive,
        logicalLikely: totalLogical,
        uncertain: sentences.length - totalExpletive - totalLogical,
        expletivePercentage: Math.round((totalExpletive / sentences.length) * 100),
        logicalPercentage: Math.round((totalLogical / sentences.length) * 100),
        uncertainPercentage: Math.round(((sentences.length - totalExpletive - totalLogical) / sentences.length) * 100),
        highConfidence: highConfidenceCount,
        mediumConfidence: mediumConfidenceCount,
        lowConfidence: lowConfidenceCount,
        averageIndicators: results.length > 0 ? 
          Math.round(results.reduce((sum, r) => sum + r.totalIndicators, 0) / results.length * 10) / 10 : 0
      };

      setBatchPredictionResults(results);
      setBatchPredictionStats(stats);
      
    } catch (error) {
      console.error('Batch prediction error:', error);
    } finally {
      setBatchPredictionLoading(false);
    }
  };

  // Password protection functions
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordInput === TRAINING_PASSWORD) {
      setIsTrainingAuthorized(true);
      localStorage.setItem('training_authorized', 'true');
      setPasswordInput('');
      
      // Log successful access (optional)
      console.log('Training access granted at:', new Date().toISOString());
    } else {
      setPasswordError('Invalid password. Please try again.');
      setPasswordInput('');
      
      // Log failed attempt (optional)
      console.warn('Failed training access attempt at:', new Date().toISOString());
    }
  };

  const revokeTrainingAccess = () => {
    if (window.confirm('Are you sure you want to revoke training access?')) {
      setIsTrainingAuthorized(false);
      localStorage.removeItem('training_authorized');
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const loadSystemStats = async () => {
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the stats
      const mockStats = {
        learning_enabled: true,
        supported_languages: ['en', 'es', 'fr'],
        total_patterns_learned: 1247,
        user_feedback_count: 89,
        average_confidence_improvement: 0.23
      };
      setSystemStats(mockStats);
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setResults(null);
    setFeedbackMode(false);

    try {
      // Enhanced analysis with original highlighting
      const mockAnalysis = await simulateEnhancedAnalysis(inputText, language);
      setResults(mockAnalysis);
      setHighlightedText(highlightNegation(inputText, language));
    } catch (error) {
      console.error('Analysis error:', error);
      setResults({
        error: 'Analysis failed. Please try again.',
        negation_detected: false,
        confidence_score: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeBatch = async () => {
    if (!batchInput.trim()) return;

    setLoading(true);
    setBatchResults([]);

    try {
      const lines = batchInput.split('\n').filter(line => line.trim());
      const results = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const analysis = await simulateEnhancedAnalysis(line, language);
          results.push({
            id: i + 1,
            text: line,
            ...analysis,
            highlighted: highlightNegation(line, language)
          });
        }
      }

      setBatchResults(results);
    } catch (error) {
      console.error('Batch analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateEnhancedAnalysis = async (text, lang) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use sophisticated expletive vs logical negation classification
    const classification = enhancedClassifyNegation(text, lang);
    const negationDetected = hasNegation(text, lang);
    
    // Extract patterns for detailed analysis
    const patterns = lang === 'french' ? extractPeurQuePatterns(text) : {};
    
    // Enhanced analysis simulation with knowledge base features
    const negationWords = {
      french: ['ne', 'pas', 'jamais', 'rien', 'personne'],
      english: ['not', 'no', 'never', 'nothing', 'nobody', "don't", "doesn't", "won't", "can't"],
      mandarin: ['不', '没', '别']
    };
    
    const textLower = text.toLowerCase();
    let matches = [];
    let baseConfidence = 0;
    
    negationWords[lang]?.forEach(word => {
      if (textLower.includes(word.toLowerCase())) {
        matches.push(word);
        baseConfidence += 0.3;
      }
    });

    // Add trigger words to matches if found
    const enTrigger = TRIGGERS[lang]?.en.find(trigger => textLower.includes(trigger));
    const nonEnTrigger = TRIGGERS[lang]?.nonEn.find(trigger => textLower.includes(trigger));
    if (enTrigger) matches.push(`EN-trigger: ${enTrigger}`);
    if (nonEnTrigger) matches.push(`Non-EN-trigger: ${nonEnTrigger}`);

    // Determine if this is expletive negation
    const isExpletive = classification.toLowerCase().includes('expletive');
    const isLogical = classification.toLowerCase().includes('logical') || classification.toLowerCase().includes('consistent');
    
    // Adjust confidence based on classification certainty
    if (isExpletive || isLogical) {
      baseConfidence = Math.max(baseConfidence, 0.7);
    }

    // Simulate knowledge base enhancement
    const kbEnhanced = matches.length > 0 && Math.random() > 0.3;
    const kbConfidenceBoost = kbEnhanced ? 0.15 : 0;
    
    const finalConfidence = Math.min(baseConfidence + kbConfidenceBoost, 1.0);

    return {
      negation_detected: negationDetected,
      confidence_score: finalConfidence,
      matches: matches,
      language: lang,
      classification: classification,
      classification_type: isExpletive ? 'expletive' : isLogical ? 'logical' : 'uncertain',
      patterns_found: patterns,
      kb_enhanced: kbEnhanced,
      similar_patterns_count: kbEnhanced ? Math.floor(Math.random() * 10) + 1 : 0,
      pattern_type: matches.length > 1 ? 'complex' : 'simple',
      processing_time_ms: Math.floor(Math.random() * 200) + 50
    };
  };

  const submitFeedback = async () => {
    if (!results) return;

    try {
      // Simulate feedback submission to knowledge base
      const feedbackData = {
        original_text: inputText,
        original_result: results,
        user_correction: userFeedback,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting feedback:', feedbackData);
      
      // In production, this would call your feedback API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Thank you for your feedback! This helps improve our system.');
      setFeedbackMode(false);
      setUserFeedback({
        negation_detected: null,
        confidence_score: null,
        comments: ''
      });

      // Reload stats to show updated learning metrics
      loadSystemStats();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50'; // Green
    if (confidence >= 0.6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="negation-analyzer">
      <div className="header">
        <h1>Enhanced Expletive Negation Analyzer</h1>
        <p>AI-powered analysis of expletive vs logical negation with continuous learning</p>
        
        {systemStats && (
          <div className="system-stats">
            <div className="stat-item">
              <span className="stat-label">Patterns Learned:</span>
              <span className="stat-value">{systemStats.total_patterns_learned?.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">User Feedback:</span>
              <span className="stat-value">{systemStats.user_feedback_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy Improvement:</span>
              <span className="stat-value">+{(systemStats.average_confidence_improvement * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'inference' ? 'active' : ''}`}
          onClick={() => setActiveTab('inference')}
        >
          Expletive Inference
        </button>
        <button 
          className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single Text Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          Batch Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'prediction' ? 'active' : ''}`}
          onClick={() => setActiveTab('prediction')}
        >
          Expletive Prediction
        </button>
        <button 
          className={`tab-button ${activeTab === 'batch-prediction' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch-prediction')}
        >
          Batch Prediction
        </button>
        <button 
          className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          Training Data Management
        </button>
      </div>

      {/* Language Selector */}
      <div className="language-selector">
        <label htmlFor="language">Language:</label>
        <select 
          id="language" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="french">French</option>
          <option value="english">English</option>
          <option value="mandarin">Mandarin</option>
        </select>
      </div>

      {/* Single Text Analysis Tab */}
      {activeTab === 'single' && (
        <div className="input-section">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to analyze for negation patterns..."
            rows={4}
            className="text-input"
          />

          <button 
            onClick={analyzeText} 
            disabled={loading || !inputText.trim()}
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>

          {/* Single Analysis Results */}
          {results && (
            <div className="results-section">
              <h3>Analysis Results</h3>
              
              <div className="result-card">
                <div className="result-header">
                  <span className={`negation-status ${results.negation_detected ? 'detected' : 'not-detected'}`}>
                    {results.negation_detected ? '✓ Negation Detected' : '✗ No Negation Detected'}
                  </span>
                  
                  <div className="confidence-badge">
                    <span 
                      className="confidence-score"
                      style={{ color: getConfidenceColor(results.confidence_score) }}
                    >
                      {(results.confidence_score * 100).toFixed(1)}% ({getConfidenceLabel(results.confidence_score)})
                    </span>
                  </div>
                </div>

                {/* Classification Results */}
                {results.classification && (
                  <div className="classification-section">
                    <h4>Classification Analysis:</h4>
                    <div className={`classification-result ${results.classification_type}`}>
                      <span className="classification-text">{results.classification}</span>
                      {results.classification_type && (
                        <span className={`classification-badge ${results.classification_type}`}>
                          {results.classification_type === 'expletive' ? '🔸 Expletive' : 
                           results.classification_type === 'logical' ? '🔹 Logical' : '❓ Uncertain'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Highlighted Text */}
                {highlightedText && (
                  <div className="highlighted-text">
                    <h4>Highlighted Text:</h4>
                    <div 
                      className="text-highlight" 
                      dangerouslySetInnerHTML={{ __html: highlightedText }}
                    />
                  </div>
                )}

                {results.matches && results.matches.length > 0 && (
                  <div className="matches-section">
                    <h4>Detected Patterns:</h4>
                    <div className="matches-list">
                      {results.matches.map((match, index) => (
                        <span key={index} className="match-tag">{match}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="analysis-details">
                  <div className="detail-item">
                    <span className="detail-label">Pattern Type:</span>
                    <span className="detail-value">{results.pattern_type || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Language:</span>
                    <span className="detail-value">{results.language?.toUpperCase()}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Processing Time:</span>
                    <span className="detail-value">{results.processing_time_ms}ms</span>
                  </div>

                  {results.kb_enhanced && (
                    <div className="kb-enhancement">
                      <span className="enhancement-badge">🧠 Knowledge Base Enhanced</span>
                      <span className="similar-patterns">
                        {results.similar_patterns_count} similar patterns found
                      </span>
                    </div>
                  )}
                </div>

                {/* Feedback Section */}
                <div className="feedback-section">
                  <button 
                    onClick={() => setFeedbackMode(!feedbackMode)}
                    className="feedback-toggle"
                  >
                    {feedbackMode ? 'Cancel Feedback' : 'Provide Feedback'}
                  </button>

                  {feedbackMode && (
                    <div className="feedback-form">
                      <h4>Help Improve Our System</h4>
                      
                      <div className="feedback-field">
                        <label>Was negation correctly detected?</label>
                        <div className="radio-group">
                          <label>
                            <input
                              type="radio"
                              name="negation_feedback"
                              value="true"
                              onChange={(e) => setUserFeedback({
                                ...userFeedback,
                                negation_detected: e.target.value === 'true'
                              })}
                            />
                            Yes
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="negation_feedback"
                              value="false"
                              onChange={(e) => setUserFeedback({
                                ...userFeedback,
                                negation_detected: e.target.value === 'true'
                              })}
                            />
                            No
                          </label>
                        </div>
                      </div>

                      <div className="feedback-field">
                        <label>Confidence Rating (0-100%):</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={userFeedback.confidence_score || 50}
                          onChange={(e) => setUserFeedback({
                            ...userFeedback,
                            confidence_score: parseInt(e.target.value) / 100
                          })}
                        />
                        <span>{Math.round((userFeedback.confidence_score || 0.5) * 100)}%</span>
                      </div>

                      <div className="feedback-field">
                        <label>Additional Comments:</label>
                        <textarea
                          value={userFeedback.comments}
                          onChange={(e) => setUserFeedback({
                            ...userFeedback,
                            comments: e.target.value
                          })}
                          placeholder="Any additional feedback or corrections..."
                          rows={3}
                        />
                      </div>

                      <button onClick={submitFeedback} className="submit-feedback">
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Analysis Tab */}
      {activeTab === 'batch' && (
        <div className="input-section">
          <textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Enter multiple lines of text to analyze (one per line)..."
            rows={8}
            className="text-input"
          />

          <button 
            onClick={analyzeBatch} 
            disabled={loading || !batchInput.trim()}
            className="analyze-button"
          >
            {loading ? 'Analyzing Batch...' : 'Analyze Batch'}
          </button>

          {/* Batch Results */}
          {batchResults.length > 0 && (
            <div className="results-section">
              <h3>Batch Analysis Results ({batchResults.length} items)</h3>
              
              <div className="batch-summary">
                <div className="summary-stat">
                  <span className="stat-label">Negation Detected:</span>
                  <span className="stat-value">
                    {batchResults.filter(r => r.negation_detected).length} / {batchResults.length}
                  </span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Average Confidence:</span>
                  <span className="stat-value">
                    {(batchResults.reduce((sum, r) => sum + r.confidence_score, 0) / batchResults.length * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="batch-results">
                {batchResults.map((result, index) => (
                  <div key={index} className="batch-result-item">
                    <div className="result-header">
                      <span className="result-id">#{result.id}</span>
                      <span className={`negation-status ${result.negation_detected ? 'detected' : 'not-detected'}`}>
                        {result.negation_detected ? '✓' : '✗'}
                      </span>
                      <span 
                        className="confidence-score"
                        style={{ color: getConfidenceColor(result.confidence_score) }}
                      >
                        {(result.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div 
                      className="result-text" 
                      dangerouslySetInnerHTML={{ __html: result.highlighted }}
                    />
                    
                    {result.matches && result.matches.length > 0 && (
                      <div className="result-matches">
                        {result.matches.map((match, i) => (
                          <span key={i} className="match-tag small">{match}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expletive Prediction Tab */}
      {activeTab === 'prediction' && (
        <div className="input-section">
          <div className="prediction-header">
            <h3>Expletive Negation Prediction</h3>
            <p className="prediction-description">
              Analyze the likelihood that a French sentence contains expletive negation based on linguistic patterns and training data.
            </p>
          </div>
          
          <textarea
            value={predictionText}
            onChange={(e) => setPredictionText(e.target.value)}
            placeholder="Enter French text to predict expletive negation likelihood..."
            className="text-input prediction-input"
            rows="4"
          />
          
          <div className="button-group">
            <button 
              onClick={handlePrediction}
              disabled={!predictionText.trim() || predictionLoading}
              className="analyze-button"
            >
              {predictionLoading ? 'Analyzing...' : 'Predict Expletive Negation'}
            </button>
            <button 
              onClick={() => {
                setPredictionText('');
                setPredictionResult(null);
              }}
              className="clear-button"
            >
              Clear
            </button>
          </div>

          {predictionResult && (
            <div className="prediction-results">
              <h4>Prediction Results</h4>
              
              <div className="prediction-summary">
                <div className="likelihood-scores">
                  <div className="score-item expletive">
                    <span className="score-label">Expletive Negation Likelihood:</span>
                    <span className="score-value">{predictionResult.expletiveLikelihood}%</span>
                  </div>
                  <div className="score-item logical">
                    <span className="score-label">Logical Negation Likelihood:</span>
                    <span className="score-value">{predictionResult.logicalLikelihood}%</span>
                  </div>
                </div>
                
                <div className="confidence-indicator">
                  <span className="confidence-label">Confidence Level:</span>
                  <span className={`confidence-badge ${predictionResult.confidence.toLowerCase()}`}>
                    {predictionResult.confidence}
                  </span>
                </div>
              </div>

              <div className="prediction-analysis">
                <h5>Analysis Details</h5>
                <div className="analysis-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Indicators Found:</span>
                    <span className="stat-value">{predictionResult.totalIndicators}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">"Ne" Occurrences:</span>
                    <span className="stat-value">{predictionResult.analysis.hasNe}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Expletive Indicators:</span>
                    <span className="stat-value">{predictionResult.analysis.expletiveIndicators}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Logical Indicators:</span>
                    <span className="stat-value">{predictionResult.analysis.logicalIndicators}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Training Data Matches:</span>
                    <span className="stat-value">{predictionResult.analysis.trainingMatches}</span>
                  </div>
                </div>
              </div>

              {predictionResult.foundPatterns.length > 0 && (
                <div className="found-patterns">
                  <h5>Detected Patterns</h5>
                  <div className="patterns-list">
                    {predictionResult.foundPatterns.map((pattern, index) => (
                      <div key={index} className={`pattern-item ${pattern.type}`}>
                        <span className="pattern-text">{pattern.pattern}</span>
                        <span className="pattern-type">{pattern.type.replace('_', ' ')}</span>
                        <span className="pattern-weight">Weight: {pattern.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="prediction-interpretation">
                <h5>Interpretation</h5>
                <div className="interpretation-text">
                  {predictionResult.expletiveLikelihood > predictionResult.logicalLikelihood ? (
                    <p className="expletive-likely">
                      <strong>Expletive negation is more likely</strong> in this text. 
                      The sentence probably contains "ne" that doesn't actually negate the meaning 
                      but is used for stylistic or grammatical reasons.
                    </p>
                  ) : predictionResult.logicalLikelihood > predictionResult.expletiveLikelihood ? (
                    <p className="logical-likely">
                      <strong>Logical negation is more likely</strong> in this text. 
                      The sentence probably contains standard French negation that actually 
                      negates the meaning of the verb or clause.
                    </p>
                  ) : (
                    <p className="uncertain">
                      <strong>Uncertain prediction</strong> - the text shows equal likelihood 
                      for both expletive and logical negation. More context or analysis may be needed.
                    </p>
                  )}
                  
                  <p className="confidence-note">
                    Confidence level is <strong>{predictionResult.confidence.toLowerCase()}</strong> 
                    based on {predictionResult.totalIndicators} linguistic indicator(s) found.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Prediction Tab */}
      {activeTab === 'batch-prediction' && (
        <div className="input-section">
          <div className="prediction-header">
            <h3>Batch Expletive Negation Prediction</h3>
            <p className="prediction-description">
              Analyze multiple French sentences at once to predict expletive negation likelihood. 
              Separate sentences with periods, exclamation marks, or question marks.
            </p>
          </div>
          
          <textarea
            value={batchPredictionInput}
            onChange={(e) => setBatchPredictionInput(e.target.value)}
            placeholder="Enter multiple French sentences separated by punctuation (. ! ?)...

Example:
Je crains qu'il ne vienne demain. Il ne mange pas de légumes. J'ai peur qu'elle ne comprenne mal. Nous ne partons jamais en vacances."
            className="text-input batch-prediction-input"
            rows="8"
          />
          
          <div className="button-group">
            <button 
              onClick={handleBatchPrediction}
              disabled={!batchPredictionInput.trim() || batchPredictionLoading}
              className="analyze-button"
            >
              {batchPredictionLoading ? 'Analyzing Batch...' : 'Predict Batch Expletive Negation'}
            </button>
            <button 
              onClick={() => {
                setBatchPredictionInput('');
                setBatchPredictionResults([]);
                setBatchPredictionStats(null);
              }}
              className="clear-button"
            >
              Clear All
            </button>
          </div>

          {batchPredictionLoading && (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <p>Processing {batchPredictionInput.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences...</p>
            </div>
          )}

          {batchPredictionStats && (
            <div className="batch-prediction-stats">
              <h4>Batch Analysis Summary</h4>
              
              <div className="stats-overview">
                <div className="stats-grid">
                  <div className="stat-card total">
                    <div className="stat-number">{batchPredictionStats.totalSentences}</div>
                    <div className="stat-label">Total Sentences</div>
                  </div>
                  <div className="stat-card expletive">
                    <div className="stat-number">{batchPredictionStats.expletiveLikely}</div>
                    <div className="stat-label">Likely Expletive</div>
                    <div className="stat-percentage">{batchPredictionStats.expletivePercentage}%</div>
                  </div>
                  <div className="stat-card logical">
                    <div className="stat-number">{batchPredictionStats.logicalLikely}</div>
                    <div className="stat-label">Likely Logical</div>
                    <div className="stat-percentage">{batchPredictionStats.logicalPercentage}%</div>
                  </div>
                  <div className="stat-card uncertain">
                    <div className="stat-number">{batchPredictionStats.uncertain}</div>
                    <div className="stat-label">Uncertain</div>
                    <div className="stat-percentage">{batchPredictionStats.uncertainPercentage}%</div>
                  </div>
                </div>

                <div className="confidence-breakdown">
                  <h5>Confidence Distribution</h5>
                  <div className="confidence-stats">
                    <div className="confidence-item high">
                      <span className="confidence-count">{batchPredictionStats.highConfidence}</span>
                      <span className="confidence-label">High Confidence</span>
                    </div>
                    <div className="confidence-item medium">
                      <span className="confidence-count">{batchPredictionStats.mediumConfidence}</span>
                      <span className="confidence-label">Medium Confidence</span>
                    </div>
                    <div className="confidence-item low">
                      <span className="confidence-count">{batchPredictionStats.lowConfidence}</span>
                      <span className="confidence-label">Low Confidence</span>
                    </div>
                  </div>
                  <div className="average-indicators">
                    <span className="avg-label">Average Indicators per Sentence:</span>
                    <span className="avg-value">{batchPredictionStats.averageIndicators}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {batchPredictionResults.length > 0 && (
            <div className="batch-prediction-results">
              <h4>Detailed Results ({batchPredictionResults.length} sentences)</h4>
              
              <div className="results-list">
                {batchPredictionResults.map((result) => (
                  <div key={result.id} className="batch-result-item">
                    <div className="result-header">
                      <span className="sentence-number">#{result.id}</span>
                      <span className={`confidence-badge ${result.confidence.toLowerCase()}`}>
                        {result.confidence}
                      </span>
                    </div>
                    
                    <div className="sentence-text">
                      "{result.text}"
                    </div>
                    
                    <div className="prediction-scores">
                      <div className="score-bar">
                        <div className="score-section expletive" style={{width: `${result.expletiveLikelihood}%`}}>
                          <span className="score-label">Expletive: {result.expletiveLikelihood}%</span>
                        </div>
                        <div className="score-section logical" style={{width: `${result.logicalLikelihood}%`}}>
                          <span className="score-label">Logical: {result.logicalLikelihood}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="result-details">
                      <div className="indicators-summary">
                        <span className="indicators-count">{result.totalIndicators} indicators</span>
                        <span className="ne-count">{result.analysis.hasNe} "ne"</span>
                        <span className="expletive-indicators">{result.analysis.expletiveIndicators} expletive</span>
                        <span className="logical-indicators">{result.analysis.logicalIndicators} logical</span>
                        {result.analysis.trainingMatches > 0 && (
                          <span className="training-matches">{result.analysis.trainingMatches} training matches</span>
                        )}
                      </div>
                      
                      {result.foundPatterns.length > 0 && (
                        <div className="patterns-summary">
                          <strong>Patterns:</strong>
                          {result.foundPatterns.slice(0, 3).map((pattern, idx) => (
                            <span key={idx} className={`pattern-tag ${pattern.type}`}>
                              {pattern.pattern}
                            </span>
                          ))}
                          {result.foundPatterns.length > 3 && (
                            <span className="more-patterns">+{result.foundPatterns.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Training Data Management Tab */}
      {activeTab === 'training' && (
        <div className="training-section">
          {!isTrainingAuthorized ? (
            // Password Gate
            <div className="password-gate">
              <div className="password-gate-content">
                <div className="lock-icon">🔒</div>
                <h3>Admin Access Required</h3>
                <p>Training data management requires administrator privileges to prevent unauthorized model modifications.</p>
                
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="password-input-group">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter admin password"
                      className="password-input"
                      autoFocus
                    />
                    <button type="submit" className="password-submit">
                      Access Training
                    </button>
                  </div>
                  
                  {passwordError && (
                    <div className="password-error">
                      <strong>⚠️ {passwordError}</strong>
                    </div>
                  )}
                </form>

                <div className="password-info">
                  <h4>Why is this protected?</h4>
                  <ul>
                    <li>Prevents unauthorized users from uploading malicious training data</li>
                    <li>Maintains model quality and accuracy</li>
                    <li>Protects against data poisoning attacks</li>
                    <li>Ensures only trusted administrators can modify training datasets</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // Authorized Training Interface
            <div>
              <div className="training-header">
                <h3>🎯 Training Data Management</h3>
                <div className="training-controls">
                  <span className="authorized-indicator">✅ Authorized Access</span>
                  <button onClick={revokeTrainingAccess} className="revoke-access-btn">
                    Revoke Access
                  </button>
                </div>
              </div>

              <div className="training-upload">
            <h3>Upload Training Data</h3>
            <p>Upload a CSV or JSON file with training examples to improve the model's accuracy.</p>
            
            <div className="upload-area">
              <label htmlFor="file-upload" className="upload-label">
                Choose File (CSV, JSON)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileUpload}
                className="file-input"
              />
              
              {uploadError && (
                <div className="error-message">
                  <strong>Error:</strong> {uploadError}
                </div>
              )}
            </div>

            <div className="file-format-info">
              <h4>Expected File Format:</h4>
              <ul>
                <li><strong>CSV:</strong> First column = text, Second column = classification</li>
                <li><strong>JSON:</strong> Array of objects with text and classification fields</li>
                <li><strong>Classifications:</strong> "with ne", "without ne", "expletive", "logical", etc.</li>
              </ul>
              
              <div className="example-format">
                <strong>Example CSV:</strong>
                <pre>
{`text,classification
"Je crains qu'il ne vienne",with ne
"Je pense qu'il viendra",without ne
"J'ai peur qu'il ne soit malade",expletive`}
                </pre>
              </div>
            </div>
          </div>

          {/* Training Statistics */}
          {trainingStats.totalExamples > 0 && (
            <div className="training-stats">
              <h3>Training Data Statistics</h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{trainingStats.totalExamples}</div>
                  <div className="stat-label">Total Examples</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{trainingStats.withNe}</div>
                  <div className="stat-label">With Negation</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{trainingStats.withoutNe}</div>
                  <div className="stat-label">Without Negation</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">
                    {trainingStats.totalExamples > 0 
                      ? Math.round((trainingStats.withNe / trainingStats.totalExamples) * 100)
                      : 0}%
                  </div>
                  <div className="stat-label">Negation Ratio</div>
                </div>
              </div>

              {trainingStats.lastUpdated && (
                <div className="last-updated">
                  <strong>Last Updated:</strong> {new Date(trainingStats.lastUpdated).toLocaleString()}
                </div>
              )}

              <div className="training-actions">
                <button onClick={clearTrainingData} className="clear-button">
                  Clear Training Data
                </button>
              </div>
            </div>
          )}

          {/* Training Data Preview */}
          {trainingData.length > 0 && (
            <div className="training-preview">
              <h3>Training Data Preview (First 10 items)</h3>
              
              <div className="training-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Text</th>
                      <th>Classification</th>
                      <th>Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingData.slice(0, 10).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td className="text-cell">{item.text}</td>
                        <td className="classification-cell">
                          <span className={`classification-tag ${
                            item.classification?.toLowerCase().includes('with') || 
                            item.classification?.toLowerCase().includes('expletive') 
                              ? 'with-negation' : 'without-negation'
                          }`}>
                            {item.classification}
                          </span>
                        </td>
                        <td>{item.language}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {trainingData.length > 10 && (
                  <div className="table-footer">
                    Showing 10 of {trainingData.length} training examples
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model Protection Notice */}
          <div className="model-protection-notice">
            <h4>🔒 Model Protection</h4>
            <p>
              Training data is stored locally and used to enhance analysis accuracy. 
              The core model remains unchanged to ensure consistency across updates.
              Your training data helps improve confidence scoring and pattern recognition.
            </p>
          </div>
            </div>
          )}
        </div>
      )}

      {/* Expletive Inference Tab */}
      {activeTab === 'inference' && (
        <div className="inference-section">
          <div className="inference-header">
            <h3>🔬 Expletive Negation Inference</h3>
            <p className="inference-description">
              Infer whether a French sentence originally contained expletive negation ("ne") based on linguistic patterns, 
              even when "ne" has been removed or never existed. This tool is designed for research on expletive negation patterns.
            </p>
            
            {researchDataset.length > 0 && (
              <div className="research-dataset-info">
                <span className="dataset-indicator">📊 Research Dataset: {researchDataset.length} training pairs loaded</span>
              </div>
            )}
          </div>

          <div className="inference-modes">
            <div className="mode-selector">
              <button 
                className={`mode-button ${!inferenceMode ? 'active' : ''}`}
                onClick={() => setInferenceMode(false)}
              >
                Single Sentence Inference
              </button>
              <button 
                className={`mode-button ${inferenceMode ? 'active' : ''}`}
                onClick={() => setInferenceMode(true)}
              >
                Batch Evaluation Mode
              </button>
            </div>
          </div>

          {!inferenceMode ? (
            // Single Sentence Inference Mode
            <div className="single-inference">
              <div className="inference-input-section">
                <label htmlFor="inference-text">French Sentence (with or without "ne"):</label>
                <textarea
                  id="inference-text"
                  value={inferenceText}
                  onChange={(e) => setInferenceText(e.target.value)}
                  placeholder="Enter a French sentence to infer original expletive negation presence...
Examples:
- J'ai peur qu'il vienne (removed 'ne')
- Je crains qu'elle soit malade (never had 'ne')
- Il faut qu'on parte maintenant (check for expletive context)"
                  className="text-input inference-input"
                  rows="4"
                />
              </div>

              <div className="button-group">
                <button 
                  onClick={handleInference}
                  disabled={!inferenceText.trim() || inferenceLoading}
                  className="analyze-button inference-button"
                >
                  {inferenceLoading ? 'Analyzing...' : 'Infer Original Expletive Negation'}
                </button>
                <button 
                  onClick={() => {
                    setInferenceText('');
                    setInferenceResults(null);
                  }}
                  className="clear-button"
                >
                  Clear
                </button>
              </div>

              {inferenceResults && (
                <div className="inference-results">
                  <h4>Inference Results</h4>
                  
                  <div className="inference-summary">
                    <div className="inference-conclusion">
                      <div className={`inference-badge ${inferenceResults.inference}`}>
                        {inferenceResults.inference === 'likely_had_expletive' ? '✅ Likely Had Expletive "Ne"' :
                         inferenceResults.inference === 'possibly_had_expletive' ? '❓ Possibly Had Expletive "Ne"' :
                         '❌ Unlikely Had Expletive "Ne"'}
                      </div>
                      <div className="likelihood-score">
                        <span className="likelihood-label">Likelihood:</span>
                        <span className="likelihood-value">{inferenceResults.likelihood}%</span>
                      </div>
                      <div className="confidence-indicator">
                        <span className="confidence-label">Confidence:</span>
                        <span className={`confidence-badge ${inferenceResults.confidence_level.toLowerCase()}`}>
                          {inferenceResults.confidence_level} ({Math.round(inferenceResults.confidence * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="inference-analysis">
                    <h5>Analysis Details</h5>
                    <div className="analysis-grid">
                      <div className="analysis-item">
                        <span className="analysis-label">Total Indicators:</span>
                        <span className="analysis-value">{inferenceResults.total_indicators}</span>
                      </div>
                      <div className="analysis-item">
                        <span className="analysis-label">Inference Score:</span>
                        <span className="analysis-value">{inferenceResults.inference_score}/12</span>
                      </div>
                      <div className="analysis-item">
                        <span className="analysis-label">Expletive Triggers:</span>
                        <span className="analysis-value">{inferenceResults.analysis.expletive_triggers}</span>
                      </div>
                      <div className="analysis-item">
                        <span className="analysis-label">Subjunctive Verbs:</span>
                        <span className="analysis-value">{inferenceResults.analysis.subjunctive_verbs}</span>
                      </div>
                      <div className="analysis-item">
                        <span className="analysis-label">Similar Patterns:</span>
                        <span className="analysis-value">{inferenceResults.analysis.similar_patterns}</span>
                      </div>
                      <div className="analysis-item">
                        <span className="analysis-label">Linguistic Features:</span>
                        <span className="analysis-value">{inferenceResults.analysis.linguistic_features}</span>
                      </div>
                    </div>
                  </div>

                  {inferenceResults.found_evidence.length > 0 && (
                    <div className="evidence-section">
                      <h5>Supporting Evidence</h5>
                      <div className="evidence-list">
                        {inferenceResults.found_evidence.map((evidence, index) => (
                          <div key={index} className={`evidence-item ${evidence.type}`}>
                            <div className="evidence-header">
                              <span className="evidence-type">
                                {evidence.type === 'expletive_trigger' ? '🎯 Expletive Trigger' :
                                 evidence.type === 'subjunctive_mood' ? '📝 Subjunctive Mood' :
                                 evidence.type === 'research_pattern_match' ? '📊 Research Pattern' :
                                 evidence.type === 'complement_structure' ? '🔗 Complement Structure' :
                                 evidence.type === 'absence_logical_negation' ? '🚫 No Logical Negation' :
                                 evidence.type}
                              </span>
                              <span className="evidence-weight">Weight: {evidence.weight}</span>
                              <span className="evidence-confidence">
                                Confidence: {Math.round(evidence.confidence * 100)}%
                              </span>
                            </div>
                            <div className="evidence-pattern">
                              Pattern: "{evidence.pattern}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inferenceResults.reasoning.linguistic_context.length > 0 && (
                    <div className="reasoning-section">
                      <h5>Linguistic Reasoning</h5>
                      <ul className="reasoning-list">
                        {inferenceResults.reasoning.linguistic_context.map((reason, index) => (
                          <li key={index} className="reasoning-item">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="inference-interpretation">
                    <h5>Research Interpretation</h5>
                    <div className="interpretation-text">
                      {inferenceResults.inference === 'likely_had_expletive' ? (
                        <p className="likely-interpretation">
                          <strong>High likelihood of original expletive negation.</strong> The sentence shows strong 
                          linguistic indicators typical of expletive "ne" constructions. This suggests the original 
                          sentence likely contained expletive "ne" that was either removed or is contextually implied.
                        </p>
                      ) : inferenceResults.inference === 'possibly_had_expletive' ? (
                        <p className="possible-interpretation">
                          <strong>Moderate likelihood of original expletive negation.</strong> The sentence contains 
                          some indicators of expletive context, but the evidence is not conclusive. Additional 
                          context or linguistic analysis may be needed.
                        </p>
                      ) : (
                        <p className="unlikely-interpretation">
                          <strong>Low likelihood of original expletive negation.</strong> The sentence lacks strong 
                          indicators of expletive "ne" constructions and is more likely to represent standard 
                          French syntax without expletive negation.
                        </p>
                      )}
                      
                      <p className="methodology-note">
                        <em>This inference is based on linguistic pattern analysis, subjunctive mood detection, 
                        expletive trigger identification, and comparison with research training data.</em>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Batch Evaluation Mode
            <div className="batch-inference">
              <div className="batch-inference-info">
                <h4>📊 Batch Evaluation for Research</h4>
                <p>
                  Upload your research dataset with original/modified sentence pairs to evaluate 
                  the inference algorithm's performance on your specific data.
                </p>
              </div>

              <div className="research-dataset-upload">
                <h5>Research Dataset Format</h5>
                <div className="format-requirements">
                  <p><strong>Required columns:</strong></p>
                  <ul>
                    <li><code>original_text</code> - Original sentence with expletive "ne"</li>
                    <li><code>modified_text</code> - Modified sentence (with "ne" removed)</li>
                    <li><code>had_expletive_ne</code> - Boolean (true/false) ground truth</li>
                    <li><code>classification</code> - Optional classification label</li>
                  </ul>
                </div>

                <div className="dataset-upload-section">
                  <input
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Process research dataset file
                        console.log('Research dataset file selected:', file.name);
                      }
                    }}
                    className="file-input"
                  />
                  <p className="upload-help">
                    Upload CSV, JSON, or Excel file with your research dataset
                  </p>
                </div>
              </div>

              {evaluationMetrics && (
                <div className="evaluation-metrics">
                  <h5>📈 Evaluation Results</h5>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-value">{Math.round(evaluationMetrics.accuracy * 100)}%</div>
                      <div className="metric-label">Accuracy</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{evaluationMetrics.total_sentences}</div>
                      <div className="metric-label">Total Sentences</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{Math.round(evaluationMetrics.average_confidence * 100)}%</div>
                      <div className="metric-label">Avg Confidence</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{evaluationMetrics.high_confidence_count}</div>
                      <div className="metric-label">High Confidence</div>
                    </div>
                  </div>

                  <div className="inference-distribution">
                    <h6>Inference Distribution</h6>
                    <div className="distribution-bars">
                      <div className="distribution-item">
                        <span className="distribution-label">Likely Expletive:</span>
                        <div className="distribution-bar">
                          <div 
                            className="distribution-fill likely" 
                            style={{width: `${(evaluationMetrics.likely_expletive_count / evaluationMetrics.total_sentences) * 100}%`}}
                          ></div>
                        </div>
                        <span className="distribution-count">{evaluationMetrics.likely_expletive_count}</span>
                      </div>
                      <div className="distribution-item">
                        <span className="distribution-label">Possibly Expletive:</span>
                        <div className="distribution-bar">
                          <div 
                            className="distribution-fill possible" 
                            style={{width: `${(evaluationMetrics.possibly_expletive_count / evaluationMetrics.total_sentences) * 100}%`}}
                          ></div>
                        </div>
                        <span className="distribution-count">{evaluationMetrics.possibly_expletive_count}</span>
                      </div>
                      <div className="distribution-item">
                        <span className="distribution-label">Unlikely Expletive:</span>
                        <div className="distribution-bar">
                          <div 
                            className="distribution-fill unlikely" 
                            style={{width: `${(evaluationMetrics.unlikely_expletive_count / evaluationMetrics.total_sentences) * 100}%`}}
                          ></div>
                        </div>
                        <span className="distribution-count">{evaluationMetrics.unlikely_expletive_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="inference-methodology">
            <h4>🔬 Research Methodology</h4>
            <div className="methodology-details">
              <div className="methodology-step">
                <h6>1. Expletive Trigger Detection</h6>
                <p>Identifies French constructions that typically require expletive "ne": peur que, craindre, redouter, douter, éviter, empêcher</p>
              </div>
              <div className="methodology-step">
                <h6>2. Subjunctive Mood Analysis</h6>
                <p>Detects subjunctive verb forms that often co-occur with expletive negation in French</p>
              </div>
              <div className="methodology-step">
                <h6>3. Pattern Similarity Matching</h6>
                <p>Compares input against research dataset to find similar constructions with known expletive status</p>
              </div>
              <div className="methodology-step">
                <h6>4. Contextual Linguistic Analysis</h6>
                <p>Analyzes complement clause structure and absence of logical negation markers</p>
              </div>
              <div className="methodology-step">
                <h6>5. Confidence Scoring</h6>
                <p>Weighted scoring system combining all indicators with confidence calibration</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="footer">
        <p>
          This system continuously learns from user feedback and improves over time.
          {systemStats?.learning_enabled && (
            <span className="learning-indicator"> 🔄 Learning Mode: Active</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default EnhancedNegationAnalyzer;
