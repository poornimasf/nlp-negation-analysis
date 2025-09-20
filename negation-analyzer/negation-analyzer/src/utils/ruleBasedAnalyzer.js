/**
 * Enhanced Rule-based analyzer with September 2025 empirical corpus insights
 * Based on 5,000 balanced training examples across 5 trigger types
 * Implements empirical hierarchy: Register > Trigger-Specific > Semantic > Subjunctive Paradox
 */

import { EnhancedSemanticAnalyzer } from './enhancedSemanticAnalyzer.js';

// Core patterns - UPDATED with September 2025 empirical findings
const TRIGGER_PATTERNS = {
    // All triggers show 50% baseline in balanced corpus, adjusted by context
    AVANT_QUE: {
        pattern: /\b(?:avant\s+(?:que|qu['']))\b/i,
        name: 'avant que',
        requiresSubjunctive: true,
        allowsExpletive: true,
        baselineRate: 0.5,  // 50% baseline from balanced corpus
        subjunctiveRate: 0.421,  // 42.1% when subjunctive present (empirical)
        semanticField: 'temporal'
    },
    PEUR_QUE: {
        pattern: /\b(?:peur\s+(?:que|qu['']))\b/i,
        name: 'peur que',
        requiresSubjunctive: true,
        allowsExpletive: true,
        baselineRate: 0.5,  // 50% baseline from balanced corpus
        emotionalRate: 0.507,  // 50.7% in emotional contexts (empirical)
        semanticField: 'emotional'
    },
    SEN_FAUT_QUE: {
        pattern: /\b(?:(?:peu\s+)?s['']en\s+(?:faut|fallut|est\s+fallu))\b/i,
        name: 'sen faut que',
        requiresSubjunctive: true,
        allowsExpletive: true,
        baselineRate: 0.5,  // 50% baseline from balanced corpus
        literaryRate: 0.744,  // 74.4% in formal/literary contexts (empirical)
        semanticField: 'logical'
    },
    MOINS_PLUS: {
        pattern: /\b(?:plus|moins)\s+.*\s+(?:que|qu[''])\b/i,
        name: 'moins plus',
        requiresSubjunctive: false,
        allowsExpletive: true,
        baselineRate: 0.5,  // 50% baseline from balanced corpus
        semanticField: 'logical'
    },
    AVANT_DE: {
        pattern: /\b(?:avant\s+de?)\b/i,
        name: 'avant de',
        requiresSubjunctive: false,
        allowsExpletive: true,
        baselineRate: 0.5,  // 50% baseline from balanced corpus
        emotionalRate: 0.636,  // 63.6% in emotional contexts (empirical)
        semanticField: 'temporal'
    }
};

// Register patterns - PRIMARY PREDICTOR (2.43x correlation)
const REGISTER_PATTERNS = {
    LITERARY: {
        pattern: /\b(?:fallut|eût|fût|submergeât|contempla|irréparable|naguère|jadis|désormais|guère|point)\b/i,
        expletiveBoost: 0.744,  // 74.4% expletive rate in literary contexts
        confidence: 0.9
    },
    FORMAL: {
        pattern: /\b(?:il\s+convient\s+de|par\s+conséquent|en\s+conséquence|ainsi|donc|monsieur|madame|veuillez)\b/i,
        expletiveBoost: 0.667,  // 66.7% expletive rate in formal contexts
        confidence: 0.8
    },
    TECHNICAL: {
        pattern: /\b(?:système|processus|données|paramètres|installation|configuration|procédure|utiliser|stocker)\b/i,
        expletiveReduction: 0.3,  // Technical contexts reduce expletive likelihood
        confidence: 0.7
    },
    CONVERSATIONAL: {
        pattern: /\b(?:bon|allez|dépêche|faut\s+qu'on|ça|ouais|nan|ben|alors)\b/i,
        expletiveReduction: 0.2,  // Conversational contexts reduce expletive likelihood
        confidence: 0.6
    }
};

// Subjunctive patterns with comprehensive verb coverage
const SUBJUNCTIVE_PATTERNS = {
    // Basic verbs
    ETRE: /\b(?:sois|soit|soyons|soyez|soient)\b/i,
    AVOIR: /\b(?:aie|ait|ayons|ayez|aient)\b/i,
    FAIRE: /\b(?:fasse|fasses|fassions|fassiez|fassent)\b/i,
    ALLER: /\b(?:aille|ailles|allions|alliez|aillent)\b/i,
    VENIR: /\b(?:vienne|viennes|venions|veniez|viennent)\b/i,
    
    // Modal verbs
    POUVOIR: /\b(?:puisse|puisses|puissions|puissiez|puissent)\b/i,
    DEVOIR: /\b(?:doive|doives|devions|deviez|doivent)\b/i,
    VOULOIR: /\b(?:veuille|veuilles|voulions|vouliez|veuillent)\b/i,
    
    // Common verbs
    SAVOIR: /\b(?:sache|saches|sachions|sachiez|sachent)\b/i,
    PRENDRE: /\b(?:prenne|prennes|prenions|preniez|prennent)\b/i,
    METTRE: /\b(?:mette|mettes|mettions|mettiez|mettent)\b/i,
    DIRE: /\b(?:dise|dises|disions|disiez|disent)\b/i,
    VOIR: /\b(?:voie|voies|voyions|voyiez|voient)\b/i,
    FINIR: /\b(?:finisse|finisses|finissions|finissiez|finissent)\b/i,
    PARTIR: /\b(?:parte|partes|partions|partiez|partent)\b/i,
    
    // Reflexive verbs (including s'/se forms)
    ACCROCHER: /\b(?:s['']|se\s+)?(?:accroche|accroches|accrochions|accrochiez|accrochent)\b/i,
    ATTENDRE: /\b(?:s['']|se\s+)?(?:attende|attendes|attendions|attendiez|attendent)\b/i,
    OCCUPER: /\b(?:s['']|se\s+)?(?:occupe|occupes|occupions|occupiez|occupent)\b/i,
    INQUIETER: /\b(?:s['']|se\s+)?(?:inquiète|inquiètes|inquiétions|inquiétiez|inquiètent)\b/i,
    LEVER: /\b(?:s['']|se\s+)?(?:lève|lèves|levions|leviez|lèvent)\b/i,
    ASSEOIR: /\b(?:s['']|se\s+)?(?:asseye|asseyes|asseyions|asseyiez|asseyent|assoie|assoies|assoyions|assoyiez|assoient)\b/i,
    TENIR: /\b(?:s['']|se\s+)?(?:tienne|tiennes|tenions|teniez|tiennent)\b/i,
    
    // Generic patterns for regular verbs
    ER_VERBS: /\b(?:s['']|se\s+)?(?:\w+e|\w+es|\w+ions|\w+iez|\w+ent)\b/i,
    IR_VERBS: /\b(?:s['']|se\s+)?(?:\w+isse|\w+isses|\w+issions|\w+issiez|\w+issent)\b/i,
    RE_VERBS: /\b(?:s['']|se\s+)?(?:\w+e|\w+es|\w+ions|\w+iez|\w+ent)\b/i
};

/**
 * Check if a verb form matches subjunctive patterns
 * @param {string} verb - Verb to check
 * @returns {Object|null} - Match information if found
 */
const checkSubjunctiveForm = (verb) => {
    // First check specific verb patterns
    for (const [type, pattern] of Object.entries(SUBJUNCTIVE_PATTERNS)) {
        if (pattern.test(verb)) {
            return {
                type,
                pattern,
                isSpecificMatch: type !== 'ER_VERBS' && type !== 'IR_VERBS' && type !== 'RE_VERBS'
            };
        }
    }
    return null;
};

/**
 * Analyze complement clause structure
 * @param {string} text - Text after trigger
 * @returns {Object} - Complement clause analysis
 */
const analyzeComplementClause = (text) => {
    // Check for proper que/qu' usage
    const properQueUsage = /\b(?:que\s+\w+|qu[']\w+)\b/i.test(text);
    
    // Check for subject after que/qu'
    const hasSubjectAfterQue = /\b(?:que|qu[''])(?:\s+\w+){1,2}\b/i.test(text);
    
    // Find potential verb forms
    const words = text.split(/\s+/);
    let verbInfo = null;
    
    for (const word of words) {
        const subjunctiveMatch = checkSubjunctiveForm(word);
        if (subjunctiveMatch) {
            verbInfo = {
                verb: word,
                ...subjunctiveMatch,
                position: text.indexOf(word)
            };
            break;
        }
    }

    // Check for complete verbal structure
    const hasCompleteVerbalStructure = verbInfo !== null && 
        /\b(?:que|qu[''])(?:\s+\w+){1,3}\s+/.test(text.slice(0, verbInfo?.position || text.length));

    return {
        properQueUsage,
        hasSubjectAfterQue,
        hasCompleteVerbalStructure,
        hasSubjunctive: verbInfo !== null,
        verbInfo,
        text: text.trim()
    };
};

/**
 * Enhanced rule-based analysis with corpus-driven semantic analysis
 * Addresses the critical overcorrection problem identified in corpus analysis
 */
export const analyzeTextEnhanced = (text, mode = 'sentence') => {
    console.log('🔬 EMPIRICAL ANALYSIS 2025: Starting analysis with September 2025 corpus findings');
    
    const semantic = new EnhancedSemanticAnalyzer();
    
    // Phase 1: Logical negation check (unchanged - still highest priority)
    const logicalContext = semantic.analyzeSemanticContext(text);
    if (logicalContext.hasLogicalNegation && logicalContext.confidence > 0.7) {
        return {
            type: 'No Expletive',
            prediction: 'No Expletive',
            confidence: logicalContext.confidence,
            reasoning: `Strong logical negation context detected: ${logicalContext.primaryIndicator}`,
            correctionApplied: 'logical-override',
            empiricalBasis: 'Logical negation always overrides expletive contexts',
            hierarchyLevel: 'Priority 0: Logical Override'
        };
    }
    
    // Phase 2: Register Analysis (NEW - Primary empirical predictor)
    const registerAnalysis = analyzeRegister(text);
    console.log('📊 REGISTER ANALYSIS:', registerAnalysis);
    
    // Phase 3: Trigger Detection with empirical rates
    const triggerAnalysis = analyzeTriggers(text);
    console.log('🎯 TRIGGER ANALYSIS:', triggerAnalysis);
    
    // Phase 4: Subjunctive Paradox Check (NEW - empirical finding)
    const subjunctiveAnalysis = analyzeSubjunctiveParadox(text);
    console.log('⚠️ SUBJUNCTIVE PARADOX:', subjunctiveAnalysis);
    
    // Phase 5: Semantic Field Analysis
    const semanticField = analyzeSemanticField(text, triggerAnalysis.trigger);
    console.log('🧠 SEMANTIC FIELD:', semanticField);
    
    // Phase 6: Mode-specific discourse analysis
    const discourseAnalysis = mode === 'paragraph' ? analyzeParagraphDiscourse(text) : { boost: 0, factors: [] };
    console.log('📝 DISCOURSE ANALYSIS:', discourseAnalysis);
    
    // Phase 7: Empirical Decision Logic
    return calculateEmpiricalDecision({
        text,
        mode,
        register: registerAnalysis,
        trigger: triggerAnalysis,
        subjunctive: subjunctiveAnalysis,
        semantic: semanticField,
        discourse: discourseAnalysis,
        logical: logicalContext
    });
};

// Register analysis - Primary empirical predictor (2.43x correlation)
function analyzeRegister(text) {
    let registerType = 'neutral';
    let expletiveModifier = 0;
    let confidence = 0.5;
    let evidence = [];
    
    // Check for literary register (strongest predictor)
    if (REGISTER_PATTERNS.LITERARY.pattern.test(text)) {
        registerType = 'literary';
        expletiveModifier = REGISTER_PATTERNS.LITERARY.expletiveBoost;
        confidence = REGISTER_PATTERNS.LITERARY.confidence;
        evidence.push('Literary markers detected (fallut, eût, fût, naguère, etc.)');
    }
    // Check for formal register
    else if (REGISTER_PATTERNS.FORMAL.pattern.test(text)) {
        registerType = 'formal';
        expletiveModifier = REGISTER_PATTERNS.FORMAL.expletiveBoost;
        confidence = REGISTER_PATTERNS.FORMAL.confidence;
        evidence.push('Formal markers detected (il convient, par conséquent, etc.)');
    }
    // Check for technical register (reduces expletive)
    else if (REGISTER_PATTERNS.TECHNICAL.pattern.test(text)) {
        registerType = 'technical';
        expletiveModifier = -REGISTER_PATTERNS.TECHNICAL.expletiveReduction;
        confidence = REGISTER_PATTERNS.TECHNICAL.confidence;
        evidence.push('Technical markers detected (système, processus, données, etc.)');
    }
    // Check for conversational register (reduces expletive)
    else if (REGISTER_PATTERNS.CONVERSATIONAL.pattern.test(text)) {
        registerType = 'conversational';
        expletiveModifier = -REGISTER_PATTERNS.CONVERSATIONAL.expletiveReduction;
        confidence = REGISTER_PATTERNS.CONVERSATIONAL.confidence;
        evidence.push('Conversational markers detected (bon, allez, ça, etc.)');
    }
    
    return {
        type: registerType,
        expletiveModifier,
        confidence,
        evidence,
        empiricalBasis: registerType === 'literary' ? '74.4% expletive rate' : 
                       registerType === 'formal' ? '66.7% expletive rate' :
                       registerType === 'technical' ? 'Reduces expletive likelihood' :
                       registerType === 'conversational' ? 'Reduces expletive likelihood' : 
                       'Neutral register (50% baseline)'
    };
}

// Trigger analysis with empirical rates
function analyzeTriggers(text) {
    let foundTrigger = null;
    let triggerRate = 0.5; // Default baseline
    let evidence = [];
    
    for (const [key, trigger] of Object.entries(TRIGGER_PATTERNS)) {
        if (trigger.pattern.test(text)) {
            foundTrigger = trigger;
            triggerRate = trigger.baselineRate;
            evidence.push(`${trigger.name} trigger detected`);
            break;
        }
    }
    
    return {
        found: !!foundTrigger,
        trigger: foundTrigger,
        baselineRate: triggerRate,
        evidence,
        empiricalBasis: foundTrigger ? `${foundTrigger.name}: 50% baseline rate` : 'No trigger detected'
    };
}

// Subjunctive paradox analysis (empirical finding: subjunctive reduces expletive likelihood)
function analyzeSubjunctiveParadox(text) {
    let hasSubjunctive = false;
    let subjunctiveModifier = 0;
    let evidence = [];
    
    // Check for subjunctive patterns
    for (const [type, pattern] of Object.entries(SUBJUNCTIVE_PATTERNS)) {
        if (pattern.test(text)) {
            hasSubjunctive = true;
            evidence.push(`Subjunctive detected: ${type.toLowerCase()}`);
            break;
        }
    }
    
    if (hasSubjunctive) {
        // Empirical finding: subjunctive presence reduces expletive likelihood
        subjunctiveModifier = -0.12; // 27.6% vs 15.6% = inverse correlation
        evidence.push('Subjunctive paradox: reduces expletive likelihood');
    }
    
    return {
        hasSubjunctive,
        modifier: subjunctiveModifier,
        evidence,
        empiricalBasis: hasSubjunctive ? 
            'Non-expletive examples show MORE subjunctive (27.6% vs 15.6%)' : 
            'No subjunctive detected'
    };
}

// Semantic field analysis
function analyzeSemanticField(text, trigger) {
    let semanticField = 'neutral';
    let fieldModifier = 0;
    let evidence = [];
    
    // Emotional context detection
    const emotionalMarkers = /\b(peur|crainte?|redoute?|anxiét|inquiét|angoisse|stress|nervosité)\b/gi;
    if (emotionalMarkers.test(text)) {
        semanticField = 'emotional';
        if (trigger?.name === 'peur que') {
            fieldModifier = 0.007; // 50.7% vs 50% = slight boost
            evidence.push('Emotional context with peur_que: 50.7% expletive rate');
        } else if (trigger?.name === 'avant de') {
            fieldModifier = 0.136; // 63.6% vs 50% = stronger boost
            evidence.push('Emotional context with avant_de: 63.6% expletive rate');
        }
    }
    
    // Temporal context detection
    const temporalMarkers = /\b(avant|après|pendant|temps|moment|tôt|tard|durée|délai)\b/gi;
    if (temporalMarkers.test(text)) {
        semanticField = semanticField === 'emotional' ? 'emotional-temporal' : 'temporal';
        evidence.push('Temporal context detected');
    }
    
    // Logical context detection
    const logicalMarkers = /\b(donc|ainsi|par conséquent|en conséquence|logiquement|raisonnablement)\b/gi;
    if (logicalMarkers.test(text)) {
        semanticField = 'logical';
        evidence.push('Logical context detected');
    }
    
    return {
        field: semanticField,
        modifier: fieldModifier,
        evidence,
        empiricalBasis: `${semanticField} context analysis based on corpus findings`
    };
}

// Paragraph-specific discourse analysis
function analyzeParagraphDiscourse(text) {
    let boost = 0;
    let factors = [];
    
    // Register consistency across longer text
    const formalMarkers = /\b(il\s+convient|par\s+conséquent|monsieur|madame|veuillez)\b/gi;
    const literaryMarkers = /\b(fallut|eût|fût|naguère|jadis|désormais)\b/gi;
    
    if (formalMarkers.test(text) || literaryMarkers.test(text)) {
        boost += 0.08; // 8% boost for formal/literary register
        factors.push('Formal/literary register consistency');
    }
    
    // Sentence complexity (paragraph-level feature)
    const complexityMarkers = text.split(/[,;:]/).length;
    if (complexityMarkers > 2) {
        boost += 0.03; // 3% boost for complex syntax
        factors.push('Complex sentence structure');
    }
    
    return {
        boost: Math.min(0.11, boost), // Cap at 11% boost
        factors,
        empiricalBasis: 'Paragraph-level discourse coherence analysis'
    };
}
function hasFormalPolitenessContext(semantic) {
    const discourse = semantic.discourseAnalysis;
    if (!discourse) {
        console.log('🔍 FORMAL POLITENESS DEBUG: No discourse analysis found');
        return false;
    }
    
    // Check for formal register + polite stance combination
    const isFormalRegister = discourse.register && 
        (discourse.register.type === 'formal' || discourse.register.type === 'literary') &&
        discourse.register.confidence > 0.5;
        
    const isPoliteStance = discourse.stance && 
        discourse.stance.type === 'polite' &&
        discourse.stance.confidence > 0.5;
        
    // Check for politeness markers in pragmatic context
    const hasPolitenessMarkers = discourse.pragmatic && 
        discourse.pragmatic.factors &&
        (discourse.pragmatic.factors.includes('question') || 
         discourse.pragmatic.factors.includes('directAddress'));
    
    console.log('🔍 FORMAL POLITENESS DEBUG:', {
        register: discourse.register,
        stance: discourse.stance,
        pragmatic: discourse.pragmatic,
        isFormalRegister,
        isPoliteStance,
        hasPolitenessMarkers,
        result: isFormalRegister && isPoliteStance && hasPolitenessMarkers
    });
    
    // Formal politeness context requires formal register + polite stance + politeness markers
    return isFormalRegister && isPoliteStance && hasPolitenessMarkers;
}

/**
 * Integrate traditional rule-based analysis with enhanced semantic analysis
 */
function integrateAnalyses(traditional, semantic, text) {
    const result = {
        ...traditional,  // Preserve all existing fields
        enhanced: true,
        semanticAnalysis: semantic,
        originalPrediction: traditional.type,  // Fix: use 'type' from traditional analysis
        originalConfidence: traditional.confidence,
        prediction: traditional.type,  // Fix: initialize prediction from traditional.type
        likelihood: semantic.likelihood  // NEW: Add likelihood score
    };
    
    // Apply corpus-driven corrections with ANTI-EXPLETIVE as highest priority
    if (semantic.antiExpletiveAnalysis && semantic.antiExpletiveAnalysis.overridesExpletive) {
        // PRIORITY 0: Anti-expletive contexts override everything
        result.prediction = 'No Expletive';
        result.type = 'No Expletive';
        result.confidence = Math.max(0.85, Math.min(0.95, 0.7 + semantic.antiExpletiveAnalysis.score * 0.1));
        result.reasoning = `ANTI-EXPLETIVE OVERRIDE: ${semantic.antiExpletiveAnalysis.strength} anti-expletive context (score: ${semantic.antiExpletiveAnalysis.score.toFixed(1)}) | ${semantic.reasoning}`;
        result.correctionApplied = 'anti_expletive_override';
        
    } else if (semantic.logicalAnalysis.overridesExpletive) {
        // PRIORITY 1: Strong logical indicators override syntactic patterns
        result.prediction = 'No Expletive';
        result.type = 'No Expletive';
        result.confidence = Math.max(0.85, semantic.classification.confidence);
        result.reasoning = `LOGICAL OVERRIDE: ${semantic.reasoning}`;
        result.correctionApplied = 'logical_override';
        
    } else if (semantic.conflictAnalysis.hasConflict) {
        // Handle semantic conflicts using corpus hierarchy
        const resolution = semantic.conflictAnalysis.resolution;
        
        if (resolution.winner === 'logical') {
            result.prediction = 'No Expletive';
            result.type = 'No Expletive';
            result.confidence = resolution.confidence;
            result.reasoning = `CONFLICT RESOLUTION: ${resolution.reasoning}`;
            result.correctionApplied = 'conflict_resolution_logical';
            
        } else if (resolution.winner === 'expletive') {
            result.prediction = 'Expletive';
            result.type = 'Expletive';
            result.confidence = resolution.confidence;
            result.reasoning = `CONFLICT RESOLUTION: ${resolution.reasoning}`;
            result.correctionApplied = 'conflict_resolution_expletive';
            
        } else {
            // Ambiguous case - use traditional analysis but lower confidence
            result.prediction = traditional.type;  // Explicitly set prediction
            result.type = traditional.type;        // Explicitly set type
            result.confidence = Math.min(result.confidence, 0.6);
            result.reasoning = `AMBIGUOUS: ${semantic.reasoning} | Traditional: ${traditional.reasoning || 'Rule-based analysis'}`;
            result.correctionApplied = 'ambiguous_case';
        }
        
    } else if (semantic.antiExpletiveAnalysis && semantic.antiExpletiveAnalysis.strength === 'medium') {
        // PRIORITY 1.5: Medium anti-expletive contexts (before formal politeness)
        result.prediction = 'No Expletive';
        result.type = 'No Expletive';
        result.confidence = Math.max(0.70, Math.min(0.85, 0.6 + semantic.antiExpletiveAnalysis.score * 0.1));
        result.reasoning = `ANTI-EXPLETIVE CONTEXT: ${semantic.antiExpletiveAnalysis.strength} anti-expletive signals detected | ${semantic.reasoning}`;
        result.correctionApplied = 'anti_expletive_medium';
        
    } else if (semantic.semanticBias > 0.15 && hasFormalPolitenessContext(semantic)) {
        // Special case: Formal politeness contexts with moderate expletive bias
        console.log('🎯 DECISION DEBUG: Formal politeness context triggered', semantic.semanticBias);
        result.prediction = 'Expletive';
        result.type = 'Expletive';
        result.confidence = Math.min(0.75, semantic.semanticBias + 0.2); // Boost confidence for formal contexts
        result.reasoning = `FORMAL POLITENESS: ${semantic.reasoning} | Formal register + polite stance favors expletive usage`;
        result.correctionApplied = 'formal_politeness_context';
        
    } else if (semantic.semanticBias < -0.3) {
        // Strong semantic bias toward logical
        console.log('🎯 DECISION DEBUG: Strong logical bias (<-0.3)', semantic.semanticBias);
        result.prediction = 'No Expletive';
        result.type = 'No Expletive';
        result.confidence = Math.abs(semantic.semanticBias);
        result.reasoning = `SEMANTIC BIAS: ${semantic.reasoning}`;
        result.correctionApplied = 'semantic_bias_logical';
        
    } else if (semantic.semanticBias > 0.3) {
        // Strong semantic bias toward expletive
        console.log('🎯 DECISION DEBUG: Strong semantic bias (>0.3)', semantic.semanticBias);
        result.prediction = 'Expletive';
        result.type = 'Expletive';
        result.confidence = semantic.semanticBias;
        result.reasoning = `SEMANTIC BIAS: ${semantic.reasoning}`;
        result.correctionApplied = 'semantic_bias_expletive';
        
    } else {
        // No strong semantic bias - implement conservative hierarchy
        console.log('🎯 DECISION DEBUG: No strong bias - implementing conservative hierarchy', {
            semanticBias: semantic.semanticBias,
            hasExpletiveContext: semantic.expletiveAnalysis?.strength !== 'none',
            hasSyntacticLicensing: semantic.syntacticAnalysis?.hasLicensing
        });
        
        // Conservative approach: Only classify as expletive with positive semantic support
        if (semantic.semanticBias > 0.15) {
            // Weak positive bias + syntactic licensing = Expletive
            result.prediction = 'Expletive';
            result.type = 'Expletive';
            result.reasoning = `WEAK EXPLETIVE BIAS: ${semantic.reasoning} | Syntactic licensing + weak semantic support`;
            result.correctionApplied = 'weak_expletive_bias';
        } else {
            // No positive bias = Conservative default to No Expletive
            result.prediction = 'No Expletive';
            result.type = 'No Expletive';
            result.reasoning = `CONSERVATIVE DEFAULT: ${semantic.reasoning} | Syntactic licensing without semantic support - conservative approach`;
            result.correctionApplied = 'conservative_default';
        }
        
        // Adjust confidence based on semantic uncertainty
        if (semantic.classification.certainty === 'low') {
            result.confidence = Math.min(result.confidence, 0.7);
        }
    }
    
    // FINAL FALLBACK: Ensure conservative default is always applied when no other conditions are met
    // This fixes the bug where traditional analysis prediction wasn't being overridden
    if (!result.correctionApplied || result.correctionApplied === undefined) {
        // No corrections were applied - apply conservative default logic
        if (semantic.semanticBias > 0.15) {
            // Weak positive bias + syntactic licensing = Expletive
            result.prediction = 'Expletive';
            result.type = 'Expletive';  // Ensure both fields are set
            result.reasoning = `WEAK EXPLETIVE BIAS: ${semantic.reasoning} | Syntactic licensing + weak semantic support`;
            result.correctionApplied = 'weak_expletive_bias';
        } else {
            // No positive bias = Conservative default to No Expletive
            result.prediction = 'No Expletive';
            result.type = 'No Expletive';  // Ensure both fields are set
            result.reasoning = `CONSERVATIVE DEFAULT: ${semantic.reasoning} | Syntactic licensing without semantic support - conservative approach`;
            result.correctionApplied = 'conservative_default';
        }
        
        // Adjust confidence based on semantic uncertainty
        if (semantic.classification.certainty === 'low') {
            result.confidence = Math.min(result.confidence, 0.7);
        }
    }
    
    // Add corpus-specific insights
    result.corpusInsights = generateCorpusInsights(traditional, semantic, text);
    
    // FINAL OVERRIDE: ALWAYS ensure our integration logic takes precedence over traditional analysis
    // This prevents any field conflicts from the spread operator - UNCONDITIONAL
    result.type = result.prediction;  // Ensure type matches prediction
    result.classification = result.prediction;  // Ensure classification matches prediction
    
    // Debug logging to track field consistency - ALWAYS LOG
    console.log('🔧 INTEGRATION OVERRIDE (UNCONDITIONAL):', {
        prediction: result.prediction,
        type: result.type,
        classification: result.classification,
        correctionApplied: result.correctionApplied,
        semanticBias: semantic.semanticBias,
        traditionalType: traditional.type
    });
    
    return result;
}

/**
 * Generate insights based on corpus analysis findings
 */
function generateCorpusInsights(traditional, semantic, text) {
    const insights = [];
    
    // Overcorrection warning
    if (semantic.syntacticAnalysis.hasLicensing && !semantic.expletiveAnalysis.favorsExpletive) {
        insights.push({
            type: 'overcorrection_warning',
            message: 'Syntactic licensing detected but no expletive context - potential overcorrection case',
            severity: 'medium'
        });
    }
    
    // Logical strength insights
    if (semantic.logicalAnalysis.level === 'strong') {
        insights.push({
            type: 'strong_logical',
            message: `Strong logical indicators detected: ${semantic.logicalAnalysis.indicators.map(i => i.indicator).join(', ')}`,
            severity: 'high'
        });
    }
    
    // Expletive context insights
    if (semantic.expletiveAnalysis.strength === 'strong') {
        insights.push({
            type: 'strong_expletive',
            message: `Strong expletive context detected: ${semantic.expletiveAnalysis.contexts.map(c => c.context).join(', ')}`,
            severity: 'high'
        });
    }
    
    // Conflict insights
    if (semantic.conflictAnalysis.hasConflict) {
        insights.push({
            type: 'semantic_conflict',
            message: `Semantic conflict resolved: ${semantic.conflictAnalysis.resolution.reasoning}`,
            severity: 'medium'
        });
    }
    
    return insights;
}

/**
 * Original rule-based analysis function - PRESERVED for backward compatibility
 * Main analysis function
 * @param {string} text - Text to analyze
 * @returns {Object} - Complete analysis
 */
export const analyzeText = (text) => {
    // Check for triggers that allow expletive ne
    let foundTrigger = null;
    let triggerMatch = null;

    for (const [, config] of Object.entries(TRIGGER_PATTERNS)) {
        const match = text.match(config.pattern);
        if (match) {
            foundTrigger = config;
            triggerMatch = match;
            break;
        }
    }

    if (!foundTrigger) {
        return {
            type: 'No Expletive',
            confidence: 0.95,
            evidence: {
                details: 'No trigger that allows expletive ne found',
                recommendNe: false
            }
        };
    }

    // Split text at trigger
    const triggerIndex = triggerMatch.index;
    const afterTrigger = text.slice(triggerIndex + triggerMatch[0].length).trim();

    // Analyze complement clause
    const complementClause = analyzeComplementClause(afterTrigger);

    // Build evidence points
    const evidencePoints = [];
    evidencePoints.push(`Found trigger "${foundTrigger.name}" that allows expletive ne`);

    if (foundTrigger.requiresSubjunctive) {
        if (complementClause.hasSubjunctive) {
            evidencePoints.push(`Required subjunctive found: "${complementClause.verbInfo.verb}"`);
            if (complementClause.verbInfo.isSpecificMatch) {
                evidencePoints.push(`Specific subjunctive form matched: ${complementClause.verbInfo.type}`);
            }
        } else {
            evidencePoints.push('Required subjunctive not found - expletive ne not possible');
            return {
                type: 'No Expletive',
                confidence: 0.90,
                evidence: {
                    trigger: foundTrigger.name,
                    details: evidencePoints.join('; '),
                    hasSubjunctive: false,
                    complementClause
                }
            };
        }
    }

    // Even with subjunctive and trigger, expletive ne is optional
    const result = {
        type: 'Expletive',
        confidence: 0.85, // Lower confidence since it's optional
        evidence: {
            trigger: foundTrigger.name,
            hasSubjunctive: complementClause.hasSubjunctive,
            details: evidencePoints.join('; '),
            complementClause,
            nePosition: complementClause.verbInfo ? complementClause.verbInfo.position : null,
            note: 'Expletive ne is allowed but optional with this trigger'
        }
    };
    
    // PHASE 2: Enhanced subjunctive debugging for rule-based mode
    console.log('🎯 RULE-BASED SUBJUNCTIVE DETECTION:', {
        input: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        trigger: {
            found: foundTrigger.name,
            requiresSubjunctive: foundTrigger.requiresSubjunctive
        },
        subjunctiveAnalysis: {
            hasSubjunctive: complementClause.hasSubjunctive,
            detectedVerb: complementClause.verbInfo?.verb,
            verbType: complementClause.verbInfo?.type,
            isSpecificMatch: complementClause.verbInfo?.isSpecificMatch,
            position: complementClause.verbInfo?.position
        },
        complementClause: {
            properQueUsage: complementClause.properQueUsage,
            hasSubjectAfterQue: complementClause.hasSubjectAfterQue,
            hasCompleteVerbalStructure: complementClause.hasCompleteVerbalStructure,
            text: complementClause.text
        },
        finalClassification: result.type,
        confidence: result.confidence
    });
    
    return result;
};

// Empirical decision calculation with September 2025 hierarchy
function calculateEmpiricalDecision(analysis) {
    const { text, mode, register, trigger, subjunctive, semantic, discourse, logical } = analysis;
    
    // Start with baseline or trigger-specific rate
    let expletiveProbability = trigger.found ? trigger.baselineRate : 0.1;
    let confidence = 0.5;
    let reasoning = [];
    let hierarchySteps = [];
    
    // Priority 1: Register Analysis (Primary predictor - 2.43x correlation)
    if (register.type !== 'neutral') {
        expletiveProbability += register.expletiveModifier;
        confidence = Math.max(confidence, register.confidence);
        reasoning.push(`Register: ${register.type} (${register.empiricalBasis})`);
        hierarchySteps.push(`Priority 1 (Register): ${register.type} → ${register.expletiveModifier > 0 ? '+' : ''}${(register.expletiveModifier * 100).toFixed(1)}%`);
    }
    
    // Priority 2: Trigger-Specific Context
    if (trigger.found) {
        reasoning.push(`Trigger: ${trigger.trigger.name} (${trigger.empiricalBasis})`);
        hierarchySteps.push(`Priority 2 (Trigger): ${trigger.trigger.name} → baseline 50%`);
        
        // Special trigger-context combinations
        if (trigger.trigger.name === 'sen faut que' && register.type === 'literary') {
            expletiveProbability = 0.744; // Override with specific empirical rate
            confidence = 0.9;
            reasoning.push('Special case: sen_faut_que + literary → 74.4% empirical rate');
            hierarchySteps.push('Priority 2a (Special): sen_faut_que + literary → 74.4%');
        }
    }
    
    // Priority 3: Subjunctive Paradox (Reduces expletive likelihood)
    if (subjunctive.hasSubjunctive) {
        expletiveProbability += subjunctive.modifier;
        reasoning.push(`Subjunctive: ${subjunctive.empiricalBasis}`);
        hierarchySteps.push(`Priority 3 (Subjunctive): Present → ${(subjunctive.modifier * 100).toFixed(1)}% (paradox effect)`);
    }
    
    // Priority 4: Semantic Field Effects
    if (semantic.modifier !== 0) {
        expletiveProbability += semantic.modifier;
        reasoning.push(`Semantic: ${semantic.empiricalBasis}`);
        hierarchySteps.push(`Priority 4 (Semantic): ${semantic.field} → ${semantic.modifier > 0 ? '+' : ''}${(semantic.modifier * 100).toFixed(1)}%`);
    }
    
    // Priority 5: Discourse Analysis (Paragraph mode only)
    if (mode === 'paragraph' && discourse.boost > 0) {
        expletiveProbability += discourse.boost;
        reasoning.push(`Discourse: ${discourse.empiricalBasis} (+${(discourse.boost * 100).toFixed(1)}%)`);
        hierarchySteps.push(`Priority 5 (Discourse): ${discourse.factors.join(', ')} → +${(discourse.boost * 100).toFixed(1)}%`);
    }
    
    // Clamp probability to [0, 1]
    expletiveProbability = Math.max(0, Math.min(1, expletiveProbability));
    
    // Determine final prediction
    const prediction = expletiveProbability > 0.5 ? 'Expletive' : 'No Expletive';
    const finalConfidence = Math.max(0.6, Math.abs(expletiveProbability - 0.5) * 2);
    
    // Build detailed evidence with hierarchical steps
    const evidence = [
        '⚖️ HIERARCHICAL CONFLICT RESOLUTION (September 2025 Empirical):',
        ...hierarchySteps,
        '',
        '🎯 FINAL DECISION LOGIC:',
        `Empirical probability: ${(expletiveProbability * 100).toFixed(1)}%`,
        `Decision threshold: 50%`,
        `Final prediction: ${prediction}`,
        '',
        '📊 EMPIRICAL BASIS:',
        ...reasoning,
        '',
        `Mode: ${mode} mode analysis`,
        `Confidence: ${(finalConfidence * 100).toFixed(1)}%`
    ];
    
    return {
        type: prediction,
        prediction: prediction,
        confidence: finalConfidence,
        reasoning: reasoning.join(' | '),
        correctionApplied: register.type === 'literary' ? 'literary-boost' : 
                          register.type === 'formal' ? 'formal-boost' :
                          register.type === 'technical' ? 'technical-reduction' :
                          subjunctive.hasSubjunctive ? 'subjunctive-paradox' : 'none',
        empiricalBasis: `September 2025 corpus analysis (5,000 examples)`,
        hierarchyLevel: `${hierarchySteps.length} priority levels applied`,
        evidence: evidence,
        probability: expletiveProbability,
        mode: mode
    };
}
