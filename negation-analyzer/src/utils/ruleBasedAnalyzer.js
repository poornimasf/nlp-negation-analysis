/**
 * Enhanced Rule-based analyzer with corpus-driven insights
 * Addresses overcorrection: "avant que + subjunctive" enables but doesn't require expletive
 * Implements hierarchy: Logical > Expletive > Syntactic
 */

import { EnhancedSemanticAnalyzer } from './enhancedSemanticAnalyzer.js';

// Core patterns - UPDATED with corpus insights
const TRIGGER_PATTERNS = {
    // Triggers that can take expletive ne (but don't always require it)
    AVANT_QUE: {
        pattern: /\b(?:avant\s+(?:que|qu['']))\b/i,
        name: 'avant que',
        requiresSubjunctive: true,
        allowsExpletive: true,  // CRITICAL: Can have expletive ne but not required
        corpusExpletiveRate: 0.0  // From corpus analysis - confirms overcorrection
    },
    PEUR_QUE: {
        pattern: /\b(?:peur\s+(?:que|qu['']))\b/i,
        name: 'peur que',
        requiresSubjunctive: true,
        allowsExpletive: true,
        corpusExpletiveRate: 0.8  // Higher expletive rate in emotional contexts
    },
    PEU_SEN_FAUT: {
        pattern: /\b(?:peu\s+s['']en\s+faut)\b/i,
        name: 'peu s\'en faut',
        requiresSubjunctive: true,
        allowsExpletive: true,
        corpusExpletiveRate: 0.9  // High expletive rate for impersonal constructions
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
export const analyzeTextEnhanced = (text) => {
    const semanticAnalyzer = new EnhancedSemanticAnalyzer();
    
    // Step 1: Traditional rule-based analysis
    const traditionalAnalysis = analyzeText(text);
    
    // Step 2: Enhanced semantic analysis using corpus insights
    const semanticAnalysis = semanticAnalyzer.analyzeSemantics(text);
    
    // Step 3: Integrate analyses with hierarchy: Logical > Expletive > Syntactic
    const integratedAnalysis = integrateAnalyses(traditionalAnalysis, semanticAnalysis, text);
    
    return integratedAnalysis;
};

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
        prediction: traditional.type  // Fix: initialize prediction from traditional.type
    };
    
    // Apply corpus-driven corrections
    if (semantic.logicalAnalysis.overridesExpletive) {
        // CRITICAL: Strong logical indicators override syntactic patterns
        result.prediction = 'No Expletive';
        result.confidence = Math.max(0.85, semantic.classification.confidence);
        result.reasoning = `LOGICAL OVERRIDE: ${semantic.reasoning}`;
        result.correctionApplied = 'logical_override';
        
    } else if (semantic.conflictAnalysis.hasConflict) {
        // Handle semantic conflicts using corpus hierarchy
        const resolution = semantic.conflictAnalysis.resolution;
        
        if (resolution.winner === 'logical') {
            result.prediction = 'No Expletive';
            result.confidence = resolution.confidence;
            result.reasoning = `CONFLICT RESOLUTION: ${resolution.reasoning}`;
            result.correctionApplied = 'conflict_resolution_logical';
            
        } else if (resolution.winner === 'expletive') {
            result.prediction = 'Expletive';
            result.confidence = resolution.confidence;
            result.reasoning = `CONFLICT RESOLUTION: ${resolution.reasoning}`;
            result.correctionApplied = 'conflict_resolution_expletive';
            
        } else {
            // Ambiguous case - use traditional analysis but lower confidence
            result.confidence = Math.min(result.confidence, 0.6);
            result.reasoning = `AMBIGUOUS: ${semantic.reasoning} | Traditional: ${traditional.reasoning || 'Rule-based analysis'}`;
            result.correctionApplied = 'ambiguous_case';
        }
        
    } else if (semantic.semanticBias < -0.3) {
        // Strong semantic bias toward logical
        result.prediction = 'No Expletive';
        result.confidence = Math.abs(semantic.semanticBias);
        result.reasoning = `SEMANTIC BIAS: ${semantic.reasoning}`;
        result.correctionApplied = 'semantic_bias_logical';
        
    } else if (semantic.semanticBias > 0.3) {
        // Strong semantic bias toward expletive
        result.prediction = 'Expletive';
        result.confidence = semantic.semanticBias;
        result.reasoning = `SEMANTIC BIAS: ${semantic.reasoning}`;
        result.correctionApplied = 'semantic_bias_expletive';
        
    } else {
        // No strong semantic bias - use traditional analysis but add semantic context
        result.reasoning = `TRADITIONAL + SEMANTIC: ${traditional.reasoning || 'Rule-based'} | ${semantic.reasoning}`;
        result.correctionApplied = 'semantic_enhancement';
        
        // Adjust confidence based on semantic uncertainty
        if (semantic.classification.certainty === 'low') {
            result.confidence = Math.min(result.confidence, 0.7);
        }
    }
    
    // Add corpus-specific insights
    result.corpusInsights = generateCorpusInsights(traditional, semantic, text);
    
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

    for (const [key, config] of Object.entries(TRIGGER_PATTERNS)) {
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
