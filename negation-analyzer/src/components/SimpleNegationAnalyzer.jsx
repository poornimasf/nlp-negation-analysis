import React, { useState } from 'react';
import './NegationAnalyzer.css';
import * as XLSX from 'xlsx';
import { LOGICAL_NEGATION_PATTERNS } from '../utils/patterns';
import EnhancedPatternMatcher from '../utils/EnhancedPatternMatcher';

export default function SimpleNegationAnalyzer() {
  // Basic state
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Feature flags
  const [useExpletiveLogic, setUseExpletiveLogic] = useState(false);
  const [enableTrainingData, setEnableTrainingData] = useState(true);
  const [useBinaryClassifier, setUseBinaryClassifier] = useState(false);
  
  // Training data state
  const [trainingData, setTrainingData] = useState([]);
  const [trainingStats, setTrainingStats] = useState({
    totalExamples: 0,
    expletiveExamples: 0,
    logicalExamples: 0,
    peurQueExamples: 0,
    avantQueExamples: 0,
    peuSenFautExamples: 0,
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

    // Peu s'en faut expressions
    peu_sen_faut: [
      // Basic construction
      /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+(?:que?|qu[''])\s*/gi,
      
      // Variations with intensifiers
      /\b(?:très|si|tellement)\s+peu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+(?:que?|qu[''])\s*/gi,
      
      // Impersonal constructions
      /\bil\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+(?:de\s+)?peu\s+(?:que?|qu[''])\s*/gi,
      
      // Question forms
      /\bs['']en\s+(?:faut|fallait|faudra|faudrait)[-]?t[-]?il\s+(?:de\s+)?peu\s+(?:que?|qu[''])\s*/gi,
      
      // Temporal variations
      /\bpeu\s+s['']en\s+est\s+fallu\s+(?:que?|qu[''])\s*/gi,
      /\bpeu\s+s['']en\s+serait\s+fallu\s+(?:que?|qu[''])\s*/gi,
      
      // Additional variations
      /\bpeu\s+s['']en\s+faut\s+(?:que?|qu[''])\s*/gi,
      /\bil\s+s['']en\s+faut\s+de\s+peu\s+(?:que?|qu[''])\s*/gi
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

  // Simple binary classifier for comparison with k-NN
  const classifyWithBinaryClassifier = (text) => {
    if (trainingData.length === 0) {
      return "No training data available for binary classifier.";
    }

    // Simple feature extraction
    const features = {
      hasPeurQue: /\b(peur|crainte)\s+que?\b/i.test(text),
      hasAvantQue: /\bavant\s+que?\b/i.test(text),
      hasPeuSenFaut: /\b(peu\s+s'en\s+faut|s'en\s+faut)/i.test(text),
      hasSubjunctive: hasSubjunctive(text),
      hasNegationMarkers: /\b(pas|jamais|plus|rien|personne)\b/i.test(text)
    };

    // Simple scoring based on linguistic patterns
    let score = 0;
    let reasoning = [];

    if (features.hasPeurQue) {
      score += 0.8;
      reasoning.push("'peur que' construction detected");
    }
    if (features.hasAvantQue) {
      score += 0.7;
      reasoning.push("'avant que' temporal construction");
    }
    if (features.hasPeuSenFaut) {
      score += 0.9;
      reasoning.push("'peu s'en faut' construction");
    }
    if (features.hasSubjunctive) {
      score += 0.3;
      reasoning.push("subjunctive mood present");
    }
    if (features.hasNegationMarkers) {
      score -= 0.5;
      reasoning.push("logical negation markers found");
    }

    const prediction = score > 0.5 ? 'expletive' : 'logical';
    const confidence = Math.round(Math.min(Math.abs(score) * 100, 95));

    const predictionText = prediction === 'expletive' ? 
      "Removed 'ne' was likely expletive" : 
      "Removed 'ne' was likely logical";

    let output = `🎯 BINARY CLASSIFIER: ${predictionText} (${confidence}% confidence)\n`;
    output += `   • Simple rule-based scoring (score: ${score.toFixed(2)})\n`;
    
    if (reasoning.length > 0) {
      output += `   • Linguistic analysis: ${reasoning.join('; ')}\n`;
    }
    
    output += `   • Binary classifier using linguistic pattern weights`;

    return output;
  };

  // Enhanced negation detection with context awareness
  const hasNegation = (text) => {
    if (!text || typeof text !== 'string') {
      return false;
    }
    
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
    if (!text || typeof text !== 'string') {
      return false;
    }
    
    // Check each subjunctive pattern category
    return Object.values(SUBJUNCTIVE_PATTERNS).some(pattern => pattern.test(text));
  };

  // Calculate confidence based on linguistic features and LLM insights (for removed 'ne' prediction)
  const calculateConfidence = async (text, triggerInfo) => {
    let confidence = 0.3; // Lower base confidence since we're predicting removed 'ne'
    
    // Primary indicator: Trigger pattern presence
    if (triggerInfo && triggerInfo.type) {
      if (triggerInfo.type === 'peur_que') {
        confidence += 0.4; // Strong indicator for expletive
        
        // Additional confidence for complete fear constructions
        if (text.match(/\b(?:j'ai|tu as|il a|elle a|nous avons|vous avez|ils ont)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e']/i)) {
          confidence += 0.1;
        }
      } else if (triggerInfo.type === 'avant') {
        confidence += 0.3; // Good indicator for expletive
        
        // Additional confidence for precise temporal markers
        if (text.match(/\b(?:juste|bien|peu|longtemps)\s+avant\s+qu[e']/i)) {
          confidence += 0.1;
        }
      } else if (triggerInfo.type === 'peu_sen_faut') {
        confidence += 0.4; // Strong indicator for expletive
        
        // Additional confidence for specific constructions
        if (text.match(/\bil\s+s['']en\s+faut/i)) {
          confidence += 0.1;
        }
        if (text.match(/\b(?:très|si|tellement)\s+peu\s+s['']en/i)) {
          confidence += 0.05;
        }
      }
    }
    
    // Secondary indicator: Subjunctive mood (strong indicator for expletive context)
    if (hasSubjunctive(text)) {
      confidence += 0.2;
      
      // Check if subjunctive appears after trigger pattern
      if (triggerInfo) {
        const queIndex = text.indexOf('que');
        if (queIndex !== -1) {
          const afterQue = text.slice(queIndex + 3);
          if (hasSubjunctive(afterQue)) {
            confidence += 0.1; // Bonus for proper subjunctive placement
          }
        }
      }
    }
    
    // Get LLM syntax analysis for removed 'ne' prediction
    try {
      const syntaxAnalysis = await EnhancedPatternMatcher.analyzeSyntacticContext(text);
      
      if (syntaxAnalysis) {
        // Weight LLM analysis heavily since it's context-aware
        confidence = (confidence * 0.6) + (syntaxAnalysis.confidence * 0.4);
        
        // Additional boost for high LLM confidence in expletive prediction
        if (syntaxAnalysis.isExpletive && syntaxAnalysis.confidence > 0.8) {
          confidence = Math.min(confidence + 0.1, 0.95);
        }
      }
    } catch (error) {
      console.error('LLM syntax analysis failed:', error);
      // Continue with rule-based confidence
    }
    
    // Include LLM validation if available
    if (triggerInfo && triggerInfo.llmValidation) {
      if (triggerInfo.llmValidation.isExpletive) {
        confidence = (confidence + triggerInfo.llmValidation.confidence) / 2;
      } else {
        // LLM suggests logical negation
        confidence = confidence * 0.5; // Reduce confidence for expletive
      }
    }
    
    // Sentence structure analysis (complement clause structure)
    if (text.match(/\bqu[e']\s+[^.!?]+$/i)) {
      confidence += 0.05; // Proper complement clause structure
    }
    
    // Note: We no longer check for absence of logical markers since 'ne' was removed
    // The task is specifically to predict the type of the removed 'ne'
    
    return Math.min(confidence, 0.95);
  };

  // Detect logical negation markers
  const hasLogicalNegation = (text) => {
    if (!text || typeof text !== 'string') {
      return false;
    }
    
    return LOGICAL_MARKERS.some(pattern => pattern.test(text));
  };

  // Find expletive triggers with comprehensive pattern matching
  const findExpletiveTrigger = async (text) => {
    if (!text || typeof text !== 'string') {
      console.log('Invalid text input:', text);
      return null;
    }

    const normalizedText = text.toLowerCase()
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    console.log('Analyzing text:', normalizedText);

    try {
      const enhancedMatch = await EnhancedPatternMatcher.findExpletiveTrigger(
        normalizedText,
        EXPLETIVE_PATTERNS
      );

      if (!enhancedMatch) {
        console.log('No trigger found');
        return null;
      }

      console.log('Found enhanced match:', enhancedMatch);
      const mappedType = mapTriggerType(enhancedMatch.type);
      console.log('Mapped type:', mappedType);

      // Include LLM insights in the result
      return {
        ...enhancedMatch,
        mappedType,
        llmValidation: enhancedMatch.llmValidation || null,
        enhancedReasoning: enhancedMatch.enhancedReasoning || ''
      };
    } catch (error) {
      console.error('Enhanced pattern matching failed:', error);
      // Fallback to basic pattern matching
      for (const [triggerType, patterns] of Object.entries(EXPLETIVE_PATTERNS)) {
        for (const pattern of patterns) {
          try {
            const match = normalizedText.match(pattern);
            if (match) {
              const mappedType = mapTriggerType(triggerType);
              return {
                type: triggerType,
                mappedType,
                match: match[0].trim(),
                position: match.index,
                confidence: calculateTriggerConfidence(match[0], triggerType)
              };
            }
          } catch (patternError) {
            console.error('Pattern matching error:', patternError);
            continue;
          }
        }
      }
      return null;
    }
  };

  // Calculate confidence based on trigger pattern specificity
  const calculateTriggerConfidence = (matchedText, triggerType) => {
    if (!matchedText || !triggerType) {
      return 0.5; // Default confidence if missing information
    }

    let confidence = 0.7; // Base confidence
    
    // Higher confidence for more specific patterns
    if (matchedText.includes("j'ai") || matchedText.includes("nous avons")) confidence += 0.1;
    if (matchedText.includes("grand")) confidence += 0.05; // "grand peur"
    if (matchedText.includes("par peur") || matchedText.includes("de peur")) confidence += 0.1;
    if (triggerType === 'avant' && matchedText.includes("juste")) confidence += 0.05;
    
    // Special handling for peu s'en faut
    if (triggerType === 'peu_sen_faut') {
      if (matchedText.includes("il s'en")) confidence += 0.1; // Impersonal construction
      if (matchedText.includes("très") || matchedText.includes("tellement")) confidence += 0.05; // Intensifiers
      if (matchedText.includes("est fallu") || matchedText.includes("serait fallu")) confidence += 0.05; // Past/conditional
    }
    
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

  // Advanced expletive negation classification for removed 'ne' prediction
  const classifyExpletive = async (text) => {
    const triggerInfo = await findExpletiveTrigger(text);
    const hasSubj = hasSubjunctive(text);
    
    // Initialize analysis components
    let classification = '';
    let confidence = 0;
    let details = [];

    // Context: We're predicting whether a removed 'ne' was expletive or logical
    details.push({
      aspect: "Task Context",
      finding: "Predicting type of removed 'ne' marker",
      impact: "Analysis focuses on trigger patterns and subjunctive mood",
      confidence: 1.0
    });

    // No trigger found - likely logical negation
    if (!triggerInfo) {
      classification = "LIKELY LOGICAL NEGATION";
      confidence = 0.75;
      details.push({
        aspect: "Trigger Analysis",
        finding: "No expletive trigger patterns detected",
        impact: "Removed 'ne' was likely logical negation",
        confidence: 0.75
      });
      return formatDetailedResult(classification, confidence, details);
    }

    // Analyze trigger pattern
    details.push({
      aspect: "Trigger Pattern",
      finding: `Found ${triggerInfo.type === 'peur_que' ? 'fear expression' : 
                        triggerInfo.type === 'peu_sen_faut' ? 'peu s\'en faut expression' : 
                        'temporal expression'} (${triggerInfo.match})`,
      impact: "Strong indicator that removed 'ne' was expletive",
      confidence: 0.6
    });

    let supportingEvidence = 0.6; // Start with trigger evidence

    // Check for subjunctive mood (crucial for expletive context)
    if (hasSubj) {
      // Check if subjunctive appears after the trigger
      const triggerIndex = text.indexOf(triggerInfo.match);
      if (triggerIndex !== -1) {
        const afterTrigger = text.slice(triggerIndex + triggerInfo.match.length);
        if (hasSubjunctive(afterTrigger)) {
          supportingEvidence += 0.3;
          details.push({
            aspect: "Verbal Mood",
            finding: "Subjunctive follows trigger pattern",
            impact: "Strong evidence for expletive negation context",
            confidence: 0.3
          });
        }
      }
    } else {
      details.push({
        aspect: "Verbal Mood",
        finding: "No subjunctive detected",
        impact: "Weakens evidence for expletive negation",
        confidence: -0.1
      });
      supportingEvidence -= 0.1;
    }

    // Include LLM analysis if available
    if (triggerInfo.llmValidation) {
      if (triggerInfo.llmValidation.isExpletive) {
        supportingEvidence += 0.2;
        details.push({
          aspect: "LLM Analysis",
          finding: "CroissantLLM predicts expletive negation",
          impact: triggerInfo.llmValidation.justification || "Supports expletive classification",
          confidence: triggerInfo.llmValidation.confidence
        });
      } else {
        supportingEvidence -= 0.2;
        details.push({
          aspect: "LLM Analysis",
          finding: "CroissantLLM predicts logical negation",
          impact: triggerInfo.llmValidation.justification || "Contradicts expletive classification",
          confidence: triggerInfo.llmValidation.confidence
        });
      }
    }

    // Make classification decision
    if (supportingEvidence >= 0.7) {
      classification = "✅ EXPLETIVE NEGATION";
      confidence = Math.min(0.95, supportingEvidence);
      details.push({
        aspect: "Final Classification",
        finding: "Strong evidence for expletive negation",
        impact: "Removed 'ne' was likely expletive",
        confidence: confidence
      });
    } else if (supportingEvidence >= 0.4) {
      classification = "LIKELY EXPLETIVE NEGATION";
      confidence = supportingEvidence;
      details.push({
        aspect: "Final Classification",
        finding: "Moderate evidence for expletive negation",
        impact: "Removed 'ne' was probably expletive",
        confidence: confidence
      });
    } else if (supportingEvidence >= 0.2) {
      // Lower threshold - still lean toward logical but with less certainty
      classification = "LIKELY LOGICAL NEGATION";
      confidence = 0.7 - supportingEvidence; // Inverse confidence for logical
      details.push({
        aspect: "Final Classification",
        finding: "Limited expletive evidence found",
        impact: "Removed 'ne' was probably logical",
        confidence: confidence
      });
    } else {
      // Very little evidence either way
      classification = "LIKELY LOGICAL NEGATION";
      confidence = 0.8; // Higher confidence for logical when no expletive triggers
      details.push({
        aspect: "Final Classification",
        finding: "No significant expletive indicators",
        impact: "Removed 'ne' was likely logical negation",
        confidence: confidence
      });
    }

    return formatDetailedResult(classification, confidence, details);
  };

  // Format detailed result with consistent bullet points
  const formatDetailedResult = (classification, confidence, details) => {
    let result = [];
    
    // Add classification and confidence
    result.push(classification);
    result.push(`(${Math.round(confidence * 100)}% confidence)\n`);
    
    // Add evidence as bullets with proper indentation
    if (Array.isArray(details)) {
      details.forEach(d => {
        if (typeof d === 'string') {
          result.push(`• ${d}`);
        } else {
          result.push(`• ${d.finding}`);
          if (d.impact && !d.impact.includes("additional evidence")) {
            result.push(`  ↳ ${d.impact}`);
          }
        }
      });
    }
    
    return result.join('\n');
  };

  // Legacy trigger array for backward compatibility
  const TRIGGERS = ["peur que", "avant que", "peu s'en faut"];
  
  // Map trigger types to their simple forms
  const mapTriggerType = (triggerType) => {
    switch(triggerType) {
      case 'peur_que': return 'peur que';
      case 'avant': return 'avant que';
      case 'peu_sen_faut': return 'peu s\'en faut';
      default: return triggerType;
    }
  };

  const highlight = (text) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    let output = text;
    
    // Highlight expletive triggers using the robust pattern matching
    try {
      // Since findExpletiveTrigger is async, we'll skip LLM highlighting for now
      // and just do basic pattern highlighting
      for (const [triggerType, patterns] of Object.entries(EXPLETIVE_PATTERNS)) {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            const escapedMatch = match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const triggerRegex = new RegExp(`(${escapedMatch})`, 'gi');
            output = output.replace(triggerRegex, '<span class="highlight-yellow">$1</span>');
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error in trigger highlighting:', error);
    }
    
    // Highlight "ne" and "n'"
    output = output.replace(/\b(ne|n')\b/gi, '<span class="highlight-green">$1</span>');
    
    // Highlight logical negation markers in red
    LOGICAL_MARKERS.forEach(pattern => {
      try {
        const matches = [...text.matchAll(pattern)];
        matches.forEach(match => {
          const escapedMatch = match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const markerRegex = new RegExp(`(${escapedMatch})`, 'gi');
          output = output.replace(markerRegex, '<span class="highlight-red">$1</span>');
        });
      } catch (error) {
        console.error('Error in logical marker highlighting:', error);
      }
    });
    
    return output;
  };

  // Enhanced classification with detailed logical negation analysis
  const classifyBasic = (text) => {
    const lowerText = text.toLowerCase();
    const hasNe = hasNegation(lowerText);
    
    if (!hasNe) {
      return "No 'ne' negation detected.";
    }
    
    // Check for logical negation with enhanced detection
    const logicalAnalysis = detectLogicalNegation(text);
    
    if (logicalAnalysis.isLogical) {
      return formatLogicalResult(logicalAnalysis);
    }
    
    return "Negation detected: 'ne' without logical markers.";
  };

  // Enhanced logical negation detection with evidence collection
  const detectLogicalNegation = (text) => {
    let evidence = [];
    let maxConfidence = 0;
    let foundPatterns = [];
    let details = [];

    // Check each category of patterns
    for (const [category, info] of Object.entries(LOGICAL_NEGATION_PATTERNS)) {
      for (const pattern of info.patterns) {
        const matches = text.match(pattern);
        if (matches) {
          foundPatterns.push({
            category,
            match: matches[0],
            confidence: info.confidence,
            description: info.description
          });
          maxConfidence = Math.max(maxConfidence, info.confidence);
        }
      }
    }

    // No logical negation found
    if (foundPatterns.length === 0) {
      return {
        isLogical: false,
        confidence: 0,
        evidence: [],
        details: []
      };
    }

    // Sort patterns by confidence
    foundPatterns.sort((a, b) => b.confidence - a.confidence);

    // Build evidence and details
    foundPatterns.forEach(pattern => {
      evidence.push(`Found ${pattern.description.toLowerCase()}: "${pattern.match}"`);
      details.push({
        aspect: pattern.description,
        finding: `Detected "${pattern.match}"`,
        impact: `Strong indicator of logical negation (${Math.round(pattern.confidence * 100)}% confidence)`,
        confidence: pattern.confidence
      });
    });

    // Additional context analysis
    const hasVerb = /\b(?:est|sont|a|ont|fait|va|vont)\b/i.test(text);
    if (hasVerb) {
      evidence.push("Complete verb construction present");
      details.push({
        aspect: "Verb Construction",
        finding: "Complete grammatical structure",
        impact: "Supports logical negation classification",
        confidence: 0.1
      });
    }

    // Check for reinforcing elements
    const hasReinforcement = /\bdu\s+tout\b|\bvraiment\b|\babsolument\b/i.test(text);
    if (hasReinforcement) {
      evidence.push("Contains negation reinforcement");
      details.push({
        aspect: "Reinforcement",
        finding: "Additional negative emphasis",
        impact: "Strengthens logical negation classification",
        confidence: 0.05
      });
    }

    // Final confidence calculation
    const finalConfidence = Math.min(0.95, maxConfidence + (hasVerb ? 0.05 : 0) + (hasReinforcement ? 0.05 : 0));

    return {
      isLogical: true,
      confidence: finalConfidence,
      evidence,
      details
    };
  };

  // Format logical negation result
  const formatLogicalResult = (analysis) => {
    if (!analysis.isLogical) return null;

    const result = [];
    
    // Main classification
    result.push("✅ LOGICAL NEGATION DETECTED");
    result.push(`(${Math.round(analysis.confidence * 100)}% confidence)\n`);

    // Evidence section
    result.push("📚 ANALYSIS DETAILS:");
    analysis.details.forEach(detail => {
      result.push(`• ${detail.finding}`);
      if (detail.impact) {
        result.push(`  ↳ ${detail.impact}`);
      }
    });

    return result.join('\n');
  };

  // Training data processing functions for removed 'ne' prediction
  const processTrainingData = (data) => {
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

    data.forEach((row, index) => {
      // Handle different possible column names for removed 'ne' data
      const text = row.text || row.sentence || row.example || '';
      const hasExpletive = row.has_expletive_ne || row.expletive || row.is_expletive || false;
      const trigger = row.trigger || row.construction || '';
      const classification = row.classification || row.type || '';

      if (!text || !text.trim()) return;

      // Convert string boolean values for removed 'ne' classification
      const isExpletive = typeof hasExpletive === 'string' 
        ? hasExpletive.toLowerCase() === 'true' || hasExpletive.toLowerCase() === 'expletive'
        : Boolean(hasExpletive);

      // Detect trigger if not provided using pattern matching (for removed 'ne' context)
      let detectedTrigger = trigger;
      if (!detectedTrigger) {
        // Use basic pattern detection since we can't await here
        const lowerText = text.toLowerCase();
        if (lowerText.includes('peur') && lowerText.includes('que')) {
          detectedTrigger = 'peur que';
        } else if (lowerText.includes('avant') && lowerText.includes('que')) {
          detectedTrigger = 'avant que';
        } else if (lowerText.includes('peu s\'en faut') || lowerText.includes('s\'en faut')) {
          detectedTrigger = 'peu s\'en faut';
        }
      }

      // For backward compatibility, map to simple trigger names
      let simpleTrigger = detectedTrigger;
      if (detectedTrigger) {
        if (detectedTrigger.includes('peur')) simpleTrigger = 'peur que';
        else if (detectedTrigger.includes('avant')) simpleTrigger = 'avant que';
        else if (detectedTrigger.includes('peu s\'en') || detectedTrigger.includes('s\'en faut')) simpleTrigger = 'peu s\'en faut';
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
          classification: classification || (isExpletive ? 'expletive' : 'logical'),
          context: 'removed_ne_prediction' // Add context marker
        };

        processedData.push(processedRow);
        stats.totalExamples++;
        
        if (isExpletive) {
          stats.expletiveExamples++;
        } else {
          stats.logicalExamples++;
        }

        // Count by trigger type for removed 'ne' statistics
        if (simpleTrigger === 'peur que') {
          stats.peurQueExamples++;
        } else if (simpleTrigger === 'avant que') {
          stats.avantQueExamples++;
        } else if (simpleTrigger === 'peu s\'en faut') {
          stats.peuSenFautExamples++;
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

  // Enhanced classification using training data for removed 'ne' prediction (hybrid mode)
  const classifyWithTraining = async (text) => {
    // Get rule-based analysis for removed 'ne' prediction
    let ruleBasedResult = await classifyExpletive(text);
    
    // Format rule-based result with a header
    ruleBasedResult = '📚 RULE-BASED ANALYSIS:\n' + ruleBasedResult.split('\n').map(line => {
      // Skip empty lines
      if (!line.trim()) return '';
      // Add bullet points to non-empty lines that don't start with special characters
      if (!line.startsWith('✅') && !line.startsWith('•') && line.trim()) {
        return '• ' + line;
      }
      return line;
    }).join('\n');
    
    if (trainingData.length === 0) {
      return ruleBasedResult;
    }

    const triggerInfo = await findExpletiveTrigger(text);
    
    if (!triggerInfo) {
      return ruleBasedResult + '\n\n🤖 TRAINING DATA: No trigger detected - cannot match with training examples';
    }

    // Map robust trigger to simple trigger for training data lookup (removed 'ne' context)
    let simpleTrigger = 'peur que'; // default
    if (triggerInfo.match.includes('avant')) simpleTrigger = 'avant que';
    else if (triggerInfo.match.includes('peu s\'en faut') || triggerInfo.match.includes('s\'en faut')) simpleTrigger = 'peu s\'en faut';
    else if (triggerInfo.match.includes('crain')) simpleTrigger = 'craindre';
    else if (triggerInfo.match.includes('redout')) simpleTrigger = 'redouter';
    else if (triggerInfo.match.includes('dout')) simpleTrigger = 'douter';
    else if (triggerInfo.match.includes('évit')) simpleTrigger = 'éviter';
    else if (triggerInfo.match.includes('empêch')) simpleTrigger = 'empêcher';

    // Find similar examples in training data for removed 'ne' prediction
    const similarExamples = trainingData.filter(item => 
      item.trigger === simpleTrigger || 
      (item.trigger && item.trigger.includes(simpleTrigger.split(' ')[0]))
    );

    if (similarExamples.length === 0) {
      return ruleBasedResult + `\n\n🤖 TRAINING DATA: No examples found for "${simpleTrigger}" trigger pattern`;
    }

    const expletiveCount = similarExamples.filter(item => item.has_expletive_ne).length;
    const totalCount = similarExamples.length;
    const confidence = Math.round((Math.max(expletiveCount, totalCount - expletiveCount) / totalCount) * 100);

    // Format training-based result with detailed information for removed 'ne' prediction
    let trainingResult = '\n\n🤖 TRAINING DATA ANALYSIS:\n';
    if (expletiveCount > totalCount - expletiveCount) {
      trainingResult += `• Prediction: Removed 'ne' was expletive\n`;
      trainingResult += `• Confidence: ${confidence}%\n`;
      trainingResult += `• Based on ${totalCount} similar "${simpleTrigger}" examples\n`;
      trainingResult += `• ${expletiveCount}/${totalCount} examples had expletive 'ne'\n`;
      trainingResult += `• Training data supports expletive classification for this construction`;
    } else {
      trainingResult += `• Prediction: Removed 'ne' was logical\n`;
      trainingResult += `• Confidence: ${confidence}%\n`;
      trainingResult += `• Based on ${totalCount} similar "${simpleTrigger}" examples\n`;
      trainingResult += `• ${totalCount - expletiveCount}/${totalCount} examples had logical 'ne'\n`;
      trainingResult += `• Training data suggests logical negation for this construction`;
    }

    // Combine rule-based and training results with clear separation
    return ruleBasedResult + trainingResult;
  };

  // Main classification function that uses either rule-based OR training data (no hybrid)
  const classifyNegation = async (text) => {
    // Training-based analysis (training flag on, expletive flag off)
    if (!useExpletiveLogic && enableTrainingData && useTrainingEnhancement && trainingData.length > 0) {
      // Use binary classifier if enabled, otherwise use standard training
      return useBinaryClassifier ? classifyWithBinaryClassifier(text) : classifyPureTraining(text);
    }
    
    // Rule-based expletive logic (expletive flag on, training flag off)
    if (useExpletiveLogic && !enableTrainingData) {
      return await classifyExpletive(text);
    }
    
    // Basic logic only (both flags off)
    if (!useExpletiveLogic && !enableTrainingData) {
      return classifyBasic(text);
    }
    
    // If both are enabled, prioritize rule-based (no hybrid)
    if (useExpletiveLogic) {
      return await classifyExpletive(text);
    } else if (enableTrainingData && useTrainingEnhancement && trainingData.length > 0) {
      return useBinaryClassifier ? classifyWithBinaryClassifier(text) : classifyPureTraining(text);
    } else {
      return classifyBasic(text);
    }
  };

  // Pure training-based classification for removed 'ne' type prediction
  const classifyPureTraining = (text) => {
    if (trainingData.length === 0) {
      return "No training data available for removed 'ne' type prediction.";
    }

    // Simple text normalization
    const normalizedText = text.toLowerCase()
      .replace(/['']/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Find similar examples based on text similarity for removed 'ne' prediction
    const scoredExamples = trainingData.map(item => {
      const exampleText = item.text.toLowerCase();
      const words = normalizedText.split(/\s+/);
      const exampleWords = exampleText.split(/\s+/);
      
      // Calculate word overlap
      const commonWords = words.filter(word => exampleWords.includes(word));
      const similarity = commonWords.length / Math.max(words.length, exampleWords.length);
      
      // Boost similarity for trigger pattern matches (important for removed 'ne' prediction)
      let triggerBoost = 0;
      const triggers = ['peur', 'avant', 'peu s\'en faut', 'craindre', 'redouter'];
      triggers.forEach(trigger => {
        if (normalizedText.includes(trigger) && exampleText.includes(trigger)) {
          triggerBoost += 0.2; // Significant boost for matching trigger patterns
        }
      });
      
      return { ...item, similarity: Math.min(similarity + triggerBoost, 1.0) };
    }).sort((a, b) => b.similarity - a.similarity);

    // Get top matches with good similarity
    const topMatches = scoredExamples.slice(0, 5).filter(item => item.similarity > 0.3);
    
    if (topMatches.length === 0) {
      return "No similar examples found in training data for removed 'ne' type prediction.";
    }

    // Calculate prediction based on training examples of removed 'ne' classification
    const expletiveCount = topMatches.filter(item => item.has_expletive_ne).length;
    const totalCount = topMatches.length;
    const confidence = Math.round((Math.max(expletiveCount, totalCount - expletiveCount) / totalCount) * 100);
    const avgSimilarity = Math.round((topMatches.reduce((sum, item) => sum + item.similarity, 0) / totalCount) * 100);

    // Most similar example for reference
    const bestMatch = topMatches[0];
    const similarityPhrase = bestMatch.similarity > 0.7 ? "very similar to" : 
                            bestMatch.similarity > 0.5 ? "similar to" : 
                            "somewhat similar to";

    // Format result with context about removed 'ne' prediction
    if (expletiveCount > totalCount - expletiveCount) {
      return `🤖 PURE TRAINING: Removed 'ne' was likely expletive (${confidence}% confidence)\n` +
             `   • Based on ${totalCount} similar examples (${avgSimilarity}% avg similarity)\n` +
             `   • Most ${similarityPhrase}: "${bestMatch.text}"\n` +
             `   • Training data suggests expletive context for this construction`;
    } else {
      return `🤖 PURE TRAINING: Removed 'ne' was likely logical (${confidence}% confidence)\n` +
             `   • Based on ${totalCount} similar examples (${avgSimilarity}% avg similarity)\n` +
             `   • Most ${similarityPhrase}: "${bestMatch.text}"\n` +
             `   • Training data suggests logical negation context`;
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


  // Determine classification type for batch results
  const determineClassification = async (text) => {
    const analysis = await classifyNegation(text);
    console.log('Analysis result:', analysis);
    
    // Get the first line which contains the main classification
    const firstLine = analysis.split('\n')[0];
    console.log('First line:', firstLine);
    
    // Check for explicit logical negation detection
    if (firstLine.includes('Logical negation detected') ||
        firstLine.includes('LIKELY LOGICAL NEGATION') ||
        firstLine.includes('Removed \'ne\' was likely logical') ||
        firstLine.includes('🎯 BINARY CLASSIFIER') && firstLine.includes('likely logical')) {
      return "Logical";
    }
    
    // Check for explicit expletive negation detection (strong indicators)
    if (firstLine.includes('✅ EXPLETIVE NEGATION') ||
        firstLine.includes('🎯 BINARY CLASSIFIER') && firstLine.includes('likely expletive')) {
      return "Expletive";
    }
    
    // Check for likely expletive indicators
    if (firstLine.includes('LIKELY EXPLETIVE NEGATION') ||
        firstLine.includes('Removed \'ne\' was likely expletive') ||
        firstLine.includes('peu s\'en faut')) {
      return "Expletive";
    }
    
    // Check for ML-enhanced detections
    if (firstLine.includes('🎯 TRAINING-ENHANCED: Logical') ||
        firstLine.includes('🤖 PURE TRAINING: Removed \'ne\' was likely logical')) {
      return useTrainingEnhancement && trainingData.length > 0 ? "Logical (ML)" : "Logical";
    }
    
    if (firstLine.includes('🎯 TRAINING-ENHANCED: Expletive') ||
        firstLine.includes('🤖 PURE TRAINING: Removed \'ne\' was likely expletive')) {
      return useTrainingEnhancement && trainingData.length > 0 ? "Expletive (ML)" : "Expletive";
    }
    
    // Check for no negation cases
    if (firstLine.includes('No negation markers found')) {
      return "No Negation";
    }
    
    // Look deeper into the analysis for training data suggestions
    if (analysis.includes('🤖 TRAINING DATA ANALYSIS:')) {
      const lines = analysis.split('\n');
      const trainingLine = lines.find(line => 
        line.includes('Prediction: Removed \'ne\' was expletive') ||
        line.includes('Prediction: Removed \'ne\' was logical')
      );
      
      if (trainingLine) {
        if (trainingLine.includes('expletive')) {
          return "Expletive (ML)";
        } else if (trainingLine.includes('logical')) {
          return "Logical (ML)";
        }
      }
    }
    
    // Check for moderate confidence predictions that should not be "Uncertain"
    if (firstLine.includes('UNCERTAIN - POSSIBLY LOGICAL')) {
      // If there's some evidence pointing to logical, classify as logical with lower confidence
      return "Logical";
    }
    
    // Check for trigger patterns even in uncertain cases
    try {
      const triggerInfo = await findExpletiveTrigger(text);
      if (triggerInfo) {
        // If we found a trigger pattern, lean toward expletive even if uncertain
        if (triggerInfo.type === 'peur_que' || 
            triggerInfo.type === 'avant' || 
            triggerInfo.type === 'peu_sen_faut') {
          console.log('Found trigger pattern, classifying as Expletive:', triggerInfo);
          return "Expletive";
        }
      } else {
        // No trigger found, more likely to be logical
        return "Logical";
      }
    } catch (error) {
      console.error('Error checking trigger patterns:', error);
    }
    
    // Only use Uncertain for truly ambiguous cases
    if (firstLine.includes('AMBIGUOUS') || 
        firstLine.includes('🤔 UNCERTAIN') ||
        firstLine.includes('Multiple possible interpretations')) {
      return "Uncertain";
    }
    
    // Default fallback - if we can't determine, check for any indicators
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes('expletive') && !lowerAnalysis.includes('not expletive')) {
      return "Expletive";
    } else if (lowerAnalysis.includes('logical') && !lowerAnalysis.includes('not logical')) {
      return "Logical";
    }
    
    // Final fallback to Uncertain only if truly unclear
    return "Uncertain";
  };




  const handleBatchAnalyze = async () => {
    if (!batchInput.trim()) {
      setBatchResults([]);
      return;
    }

    setBatchLoading(true);
    const sentences = batchInput.split("\n").filter(line => line.trim());
    setBatchProgress({ current: 0, total: sentences.length });
    const results = [];
    
    try {
      for (let index = 0; index < sentences.length; index++) {
        setBatchProgress({ current: index + 1, total: sentences.length });
        const sentence = sentences[index];
        
        try {
          const analysis = await classifyNegation(sentence.trim());
          const triggerInfo = await findExpletiveTrigger(sentence.trim());
          const hasNe = hasNegation(sentence.trim());
          const hasSubj = hasSubjunctive(sentence.trim());
          
          // Build detailed reasoning
          const reasoning = [];
          
          // Check for trigger patterns
          if (triggerInfo && triggerInfo.match) {
            const triggerType = triggerInfo.mappedType || mapTriggerType(triggerInfo.type);
            reasoning.push(`Found trigger pattern: "${triggerInfo.match}" (${triggerType})`);
            
            if (triggerInfo.type === 'peur_que') {
              reasoning.push('Trigger indicates fear expression');
            } else if (triggerInfo.type === 'avant') {
              reasoning.push('Trigger indicates temporal expression');
            } else if (triggerInfo.type === 'peu_sen_faut') {
              reasoning.push('Trigger indicates expletive construction');
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
          const confidence = await calculateConfidence(sentence.trim(), triggerInfo);
          reasoning.push(`Confidence level: ${Math.round(confidence * 100)}%`);
          
          results.push({
            id: index + 1,
            text: sentence.trim(),
            highlightedText: highlight(sentence.trim()),
            label: analysis,
            classification: await determineClassification(sentence.trim()),
            reasoning: reasoning.join('\n'),
            confidence: confidence,
            trigger: triggerInfo ? (triggerInfo.mappedType || mapTriggerType(triggerInfo.type)) : null
          });
        } catch (error) {
          console.error(`Error processing sentence ${index + 1}:`, error);
          // Add error result
          results.push({
            id: index + 1,
            text: sentence.trim(),
            highlightedText: sentence.trim(),
            label: `Error: ${error.message}`,
            classification: "Error",
            reasoning: `Processing failed: ${error.message}`,
            confidence: 0,
            trigger: null
          });
        }
      }
      
      setBatchResults(results);
    } catch (error) {
      console.error('Batch analysis failed:', error);
      setBatchResults([]);
    } finally {
      setBatchLoading(false);
      setBatchProgress({ current: 0, total: 0 });
    }
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
    
    // Prepare main results data (removed Triggers and Analysis Mode columns)
    const resultsData = [
      // Header row
      ['Sentence #', 'Text', 'Analysis Result', 'Prediction', 'Confidence'],
      // Data rows
      ...batchResults.map(result => {
        // Extract confidence if available
        const confidenceMatch = result.label.match(/(\d+)%/);
        const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
        
        return [
          result.id,
          result.text,
          result.label,
          result.classification, // Use the direct classification field
          confidence
        ];
      })
    ];
    
    // Create main results worksheet
    const ws = XLSX.utils.aoa_to_sheet(resultsData);
    
    // Set column widths (updated for fewer columns)
    ws['!cols'] = [
      { wch: 10 },  // Sentence #
      { wch: 40 },  // Text
      { wch: 60 },  // Analysis Result
      { wch: 20 },  // Classification
      { wch: 12 }   // Confidence
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
      ['French Negation Type Prediction - Summary Statistics'],
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
    // Prepare CSV headers (removed Triggers_Found and Analysis_Mode)
    const headers = ['Sentence_Number', 'Text', 'Analysis_Result', 'Prediction', 'Confidence'];
    
    // Process results into CSV format
    const csvData = batchResults.map(result => {
      // Extract confidence if available
      const confidenceMatch = result.label.match(/(\d+)%/);
      const confidence = confidenceMatch ? confidenceMatch[1] + '%' : 'N/A';
      
      return [
        result.id,
        `"${result.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${result.label.replace(/"/g, '""')}"`,
        result.classification, // Use the direct classification field
        confidence
      ];
    });
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    // Add metadata header
    const metadata = `# French Negation Type Prediction - Batch Results\n# Generated: ${new Date().toISOString()}\n# Total Sentences: ${batchResults.length}\n#\n`;
    
    downloadFile(csvContent, `${filename}.csv`, 'text/csv', metadata);
  };

  const downloadJSON = (filename, analysisMode) => {
    const jsonData = {
      metadata: {
        title: 'French Negation Type Prediction - Batch Results',
        generated: new Date().toISOString(),
        totalSentences: batchResults.length,
        version: '2.5.0'
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
            confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : null
          },
          highlightedText: result.highlightedText
        };
      })
    };
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const downloadTXT = (filename, analysisMode) => {
    let content = `French Negation Type Prediction - Batch Results\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Total Sentences: ${batchResults.length}\n`;
    content += `${'='.repeat(60)}\n\n`;
    
    batchResults.forEach((result, index) => {
      content += `${index + 1}. Sentence #${result.id}\n`;
      content += `   Text: ${result.text}\n`;
      content += `   Prediction: ${result.classification}\n`;
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
      return "📝 Basic Logic Only - Simple trigger detection to predict removed 'ne' type";
    }
    if (useExpletiveLogic && !enableTrainingData) {
      return "🎯 Rule-Based Logic Only - French linguistic patterns + CroissantLLM for removed 'ne' prediction";
    }
    if (!useExpletiveLogic && enableTrainingData) {
      if (useTrainingEnhancement && trainingData.length > 0) {
        const methodType = useBinaryClassifier ? "Binary Classifier (rule-based scoring)" : "k-NN (similarity matching)";
        return `🤖 Pure Training-Based Analysis - ${methodType} prediction of removed 'ne' type from ${trainingData.length} user examples`;
      } else {
        return "📚 Training Data Available - Upload data for pure ML-based removed 'ne' type prediction";
      }
    }
    // If both are enabled, rule-based takes priority
    if (useExpletiveLogic) {
      return "🎯 Rule-Based Logic - French linguistic patterns + CroissantLLM for removed 'ne' prediction";
    } else {
      return "🤖 Training-Based Analysis - ML prediction from user examples";
    }
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
      <div className="card" style={{ marginTop: '20px' }}>
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
            <>
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

              {/* Binary Classifier Toggle */}
              {useTrainingEnhancement && trainingData.length > 0 && (
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#e53e3e',
                  marginLeft: '40px',
                  marginTop: '8px'
                }}>
                  <input
                    type="checkbox"
                    checked={useBinaryClassifier}
                    onChange={(e) => setUseBinaryClassifier(e.target.checked)}
                    style={{ 
                      marginRight: '10px', 
                      transform: 'scale(0.9)',
                      cursor: 'pointer'
                    }}
                  />
                  {useBinaryClassifier ? '🎯 Binary Classifier ACTIVE' : '🎯 Binary Classifier INACTIVE'}
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#718096',
                    fontStyle: 'italic',
                    marginLeft: '8px'
                  }}>
                    (Rule-based scoring vs k-NN)
                  </span>
                </label>
              )}
            </>
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
            ? "Basic analysis - detects trigger patterns and predicts whether removed 'ne' markers were logical or expletive."
            : useExpletiveLogic && !enableTrainingData
              ? "Rule-based prediction of removed 'ne' type using French linguistic patterns for 'peur que', 'avant que', and 'peu s'en faut' constructions."
              : !useExpletiveLogic && enableTrainingData
                ? useTrainingEnhancement && trainingData.length > 0
                  ? "Pure machine learning prediction of removed 'ne' type using patterns from your uploaded examples only."
                  : "Training data analysis available - upload examples to predict removed 'ne' type using pure ML classification."
                : useExpletiveLogic
                  ? "Rule-based prediction using French linguistic patterns and CroissantLLM enhancement."
                  : "Select your preferred approach for predicting whether removed 'ne' markers were expletive or logical."
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
            <h4>📝 Basic Logic Predicts:</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Type of <strong>removed "ne"</strong> markers</li>
              <li>Uses trigger patterns: <strong>peur que, avant que, peu s'en faut</strong></li>
              <li>Considers subjunctive mood placement</li>
              <li>No advanced linguistic analysis</li>
            </ul>
            <p><strong>Task:</strong> Given "J'ai peur qu'il vienne" (ne removed), predict if the missing "ne" was expletive or logical</p>
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
            <h4>🎯 Rule-Based Prediction of Removed "Ne" Type:</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><strong>"peur que" constructions:</strong>
                <ul>
                  <li>All conjugations of "avoir peur que"</li>
                  <li>Prepositional forms (par/de/dans peur que)</li>
                  <li>Intensity modifiers (très/grand peur que)</li>
                  <li>→ Predicts removed "ne" was <strong>expletive</strong></li>
                </ul>
              </li>
              <li><strong>"avant que" constructions:</strong>
                <ul>
                  <li>Basic temporal markers</li>
                  <li>Time precision (juste/bien/peu avant que)</li>
                  <li>Complex temporal expressions</li>
                  <li>→ Predicts removed "ne" was <strong>expletive</strong></li>
                </ul>
              </li>
              <li><strong>"peu s'en faut" constructions:</strong>
                <ul>
                  <li>Basic: "peu s'en faut que"</li>
                  <li>Impersonal: "il s'en faut de peu que"</li>
                  <li>With intensifiers and temporal variations</li>
                  <li>→ Predicts removed "ne" was <strong>expletive</strong></li>
                </ul>
              </li>
              <li><strong>Enhanced with CroissantLLM:</strong>
                <ul>
                  <li>French syntax validation</li>
                  <li>Context-aware confidence scoring</li>
                  <li>Subjunctive mood analysis</li>
                </ul>
              </li>
            </ul>
            <p><strong>Examples:</strong></p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>"J'ai peur qu'il vienne" → <strong>Expletive</strong> (removed "ne" was expletive)</li>
              <li>"Avant qu'elle parte" → <strong>Expletive</strong> (removed "ne" was expletive)</li>
              <li>"Peu s'en faut qu'il réussisse" → <strong>Expletive</strong> (removed "ne" was expletive)</li>
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
            <h4>🤖 Pure Training-Based Prediction of Removed "Ne" Type:</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><strong>Text Similarity Only</strong>
                <ul>
                  <li>No rule-based pattern matching</li>
                  <li>No predefined triggers or patterns</li>
                  <li>Pure example-based learning</li>
                  <li>Predicts removed "ne" type from similar examples</li>
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
                  <li>Learns patterns of removed "ne" classification</li>
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
{`🤖 PURE TRAINING: Removed 'ne' was likely expletive (80% confidence)
   • Based on 5 similar examples (75% avg similarity)
   • Most similar to: "J'ai peur qu'il vienne"`}
            </pre>
          </div>
        )}

          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '15px',
            border: '1px solid #2196f3',
            fontSize: '14px'
          }}>
            <strong>📋 Analysis Mode:</strong> Choose either Rule-Based Logic OR Training Data Analysis. 
            If both are enabled, Rule-Based Logic takes priority.
          </div>
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
          <p>Upload training examples for {useExpletiveLogic ? 'enhanced' : 'pure'} machine learning-based prediction of removed "ne" type (expletive vs logical).</p>
          
          <div className="info-box" style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #4caf50'
          }}>
            <h4>📋 Expected File Format (JSON):</h4>
            <p><strong>Required fields:</strong> text, has_expletive_ne, trigger, classification</p>
            <p><strong>Example JSON:</strong></p>
            <pre style={{ fontSize: '12px', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
{`{
  "examples": [
    {
      "text": "J'ai peur qu'il ne vienne",
      "has_expletive_ne": true,
      "trigger": "peur que",
      "classification": "expletive"
    },
    {
      "text": "Avant qu'elle ne parte",
      "has_expletive_ne": true,
      "trigger": "avant que",
      "classification": "expletive"
    },
    {
      "text": "Peu s'en faut qu'il ne pleuve",
      "has_expletive_ne": true,
      "trigger": "peu s'en faut",
      "classification": "expletive"
    },
    {
      "text": "Il s'en faut de peu qu'elle ne vienne",
      "has_expletive_ne": true,
      "trigger": "peu s'en faut",
      "classification": "expletive"
    }
  ]
}`}
            </pre>
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
              <strong>💡 Tips:</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                <li>Supported triggers: "peur que", "avant que", "peu s'en faut"</li>
                <li>has_expletive_ne: true/false indicates presence of expletive negation</li>
                <li>classification: "expletive" or "logical"</li>
              </ul>
            </div>
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

            {/* Preview Section */}
            {trainingData.length > 0 && (
              <div style={{ 
                marginTop: '20px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#495057' }}>
                  🔍 Training Data Preview
                </h4>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#e9ecef',
                        position: 'sticky',
                        top: 0
                      }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Text</th>
                        <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Trigger</th>
                        <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Type</th>
                        <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Valid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingData.slice(0, 10).map((item, index) => {
                        // Validate trigger type - updated to handle peu s'en faut
                        const isValidTrigger = item.trigger && (
                          TRIGGERS.includes(item.trigger.toLowerCase()) || 
                          ['craindre', 'redouter', 'douter', 'éviter', 'empêcher'].includes(item.trigger.toLowerCase()) ||
                          item.trigger.toLowerCase() === "peu s'en faut"
                        );
                        
                        // Check for proper structure
                        const hasValidStructure = item.text && 
                          typeof item.has_expletive_ne !== 'undefined' &&
                          item.trigger &&
                          item.classification;

                        return (
                          <tr key={index} style={{ 
                            borderBottom: '1px solid #dee2e6',
                            backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                          }}>
                            <td style={{ padding: '8px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.text}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.9em',
                                backgroundColor: isValidTrigger ? '#e8f5e9' : '#ffebee',
                                color: isValidTrigger ? '#2e7d32' : '#c62828',
                                border: `1px solid ${isValidTrigger ? '#c8e6c9' : '#ffcdd2'}`
                              }}>
                                {item.trigger}
                              </span>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.9em',
                                backgroundColor: item.has_expletive_ne ? '#e3f2fd' : '#fff3e0',
                                color: item.has_expletive_ne ? '#1565c0' : '#ef6c00',
                                border: `1px solid ${item.has_expletive_ne ? '#bbdefb' : '#ffe0b2'}`
                              }}>
                                {item.has_expletive_ne ? 'Expletive' : 'Logical'}
                              </span>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              {hasValidStructure ? (
                                <span style={{ color: '#2e7d32' }}>✓</span>
                              ) : (
                                <span style={{ color: '#c62828' }}>✗</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {trainingData.length > 10 && (
                  <div style={{ 
                    marginTop: '10px', 
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '0.9em'
                  }}>
                    Showing first 10 of {trainingData.length} examples
                  </div>
                )}
              </div>
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
                  <strong>"Peu s'en faut" Examples:</strong> {trainingStats.peuSenFautExamples}<br/>
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
          <label htmlFor="batch-input">Enter Multiple Sentences (with "ne" removed):</label>
          <div className="input-group">
            <textarea
              id="batch-input"
              rows={6}
              placeholder={`Enter sentences with "ne" removed (one per line):\nJ'ai peur qu'il vienne\nAvant qu'elle parte\nPeu s'en faut qu'il réussisse`}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="input"
            />
            <button 
              onClick={handleBatchAnalyze} 
              className="button"
              disabled={batchLoading}
              style={{
                backgroundColor: batchLoading ? '#ccc' : '#3182ce',
                cursor: batchLoading ? 'not-allowed' : 'pointer',
                opacity: batchLoading ? 0.7 : 1
              }}
            >
              {batchLoading ? '🔄 Processing...' : 'Analyze Batch'}
            </button>
          </div>
        </div>


        {/* Loading indicator */}
        {batchLoading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '20px 0',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#495057', marginBottom: '5px' }}>
              Processing Batch Analysis...
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
              {batchProgress.total > 0 
                ? `Analyzing sentence ${batchProgress.current} of ${batchProgress.total}`
                : `Analyzing ${batchInput.split('\n').filter(line => line.trim()).length} sentences with CroissantLLM enhancement`
              }
            </div>
            <div style={{ 
              width: '300px', 
              height: '6px', 
              backgroundColor: '#e9ecef', 
              borderRadius: '3px', 
              margin: '15px auto',
              overflow: 'hidden'
            }}>
              <div style={{
                width: batchProgress.total > 0 ? `${(batchProgress.current / batchProgress.total) * 100}%` : '100%',
                height: '100%',
                backgroundColor: '#007bff',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
                animation: batchProgress.total === 0 ? 'loading 2s ease-in-out infinite' : 'none'
              }}></div>
            </div>
            {batchProgress.total > 0 && (
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
                {Math.round((batchProgress.current / batchProgress.total) * 100)}% complete
              </div>
            )}
          </div>
        )}

        {batchResults.length > 0 && !batchLoading && (
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
                      🔮 Prediction{getSortIcon('classification')}
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
              💡 <strong>Tip:</strong> Click on column headers to sort the results. The Prediction column shows color-coded badges for easy identification: 
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
