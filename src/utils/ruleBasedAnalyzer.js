/**
 * Rule-based analyzer with comprehensive structural analysis
 * Focused on avant que/avant qu' patterns
 */

// Core patterns
const AVANT_QUE_PATTERN = {
    pattern: /\b(?:avant\s+(?:que|qu['']))\b/i,
    name: 'avant que'
};

// Main clause patterns
const MAIN_CLAUSE_PATTERNS = {
    // Basic verbs
    BASIC_VERBS: {
        ETRE: /\b(?:suis|es|est|sommes|êtes|sont)\b/i,
        AVOIR: /\b(?:ai|as|a|avons|avez|ont)\b/i
    },
    // Action verbs suggesting intentional action
    ACTION_VERBS: /\b(?:faire|agir|intervenir|préparer|commencer|finir|partir|arriver|venir)\b/i,
    // Modal verbs indicating necessity/intention
    MODAL_VERBS: /\b(?:dois|doit|devons|devez|doivent|veux|veut|voulons|voulez|veulent|peux|peut|pouvons|pouvez|peuvent)\b/i,
    // Temporal markers
    TEMPORAL_MARKERS: /\b(?:maintenant|bientôt|rapidement|vite|tout\s+de\s+suite|immédiatement|déjà)\b/i,
    // Tenses
    TENSES: {
        PRESENT: /\b(?:suis|es|est|sommes|êtes|sont|ai|as|a|avons|avez|ont|fais|fait|faisons|faites|font)\b/i,
        FUTURE: /\b(?:serai|seras|sera|serons|serez|seront|aurai|auras|aura|aurons|aurez|auront)\b/i,
        PAST: /\b(?:étais|était|étions|étiez|étaient|avais|avait|avions|aviez|avaient)\b/i,
        CONDITIONAL: /\b(?:serais|serait|serions|seriez|seraient|aurais|aurait|aurions|auriez|auraient)\b/i
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
 * Analyze main clause structure
 * @param {string} text - Text before avant que
 * @returns {Object} - Main clause analysis
 */
const analyzeMainClause = (text) => {
    // Basic SVO pattern check
    const hasSVO = /\b(?:\w+\s+){0,2}(?:suis|es|est|sommes|êtes|sont|ai|as|a|avons|avez|ont)\b.*?\b\w+\b/i.test(text);
    
    // Check for temporal markers
    const hasTemporalMarker = MAIN_CLAUSE_PATTERNS.TEMPORAL_MARKERS.test(text);
    
    // Check for action verbs
    const hasActionVerb = MAIN_CLAUSE_PATTERNS.ACTION_VERBS.test(text);
    
    // Check for modal verbs
    const hasModal = MAIN_CLAUSE_PATTERNS.MODAL_VERBS.test(text);
    
    // Analyze tense
    const tenses = Object.entries(MAIN_CLAUSE_PATTERNS.TENSES).reduce((acc, [tense, pattern]) => {
        acc[tense] = pattern.test(text);
        return acc;
    }, {});

    return {
        hasSVO,
        hasTemporalMarker,
        hasActionVerb,
        hasModal,
        tenses,
        isComplete: hasSVO || (hasActionVerb && text.split(/\s+/).length > 2)
    };
};

/**
 * Analyze complement clause structure
 * @param {string} text - Text after avant que
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
 * Analyze relationship between clauses
 * @param {Object} mainClause - Main clause analysis
 * @param {Object} complementClause - Complement clause analysis
 * @returns {Object} - Relationship analysis
 */
const analyzeClauseRelationship = (mainClause, complementClause) => {
    return {
        // Check temporal sequence
        hasProperSequence: mainClause.hasActionVerb && complementClause.hasSubjunctive,
        
        // Check for logical connection
        hasLogicalConnection: mainClause.hasTemporalMarker || mainClause.hasModal,
        
        // Check for proper subordination
        hasProperSubordination: mainClause.hasSVO && complementClause.properQueUsage,
        
        // Check for balanced structure
        hasBalancedStructure: !(/\b(?:que|qu[''])\b/i.test(mainClause)) && 
            complementClause.hasSubjectAfterQue
    };
};

/**
 * Analyze position for ne/n'
 * @param {Object} complementClause - Complement clause analysis
 * @returns {Object|null} - Position analysis
 */
const analyzeNePosition = (complementClause) => {
    if (!complementClause.verbInfo) return null;

    const words = complementClause.text.split(/\s+/);
    const verbIndex = words.findIndex(word => 
        word.toLowerCase() === complementClause.verbInfo.verb.toLowerCase()
    );

    if (verbIndex === -1) return null;

    // Find subject (typically right after que/qu')
    const subjectMatch = complementClause.text.match(/\b(?:que|qu[''])\s+(\w+)\b/i);
    
    return {
        subjectPosition: subjectMatch ? 
            complementClause.text.slice(0, subjectMatch.index).split(/\s+/).length : null,
        verbPosition: verbIndex,
        recommendedPosition: verbIndex - 1,
        isValidPosition: verbIndex > 0
    };
};

/**
 * Calculate structural score
 * @param {Object} analysis - Complete structural analysis
 * @returns {number} - Score between 0 and 1
 */
const calculateStructuralScore = (analysis) => {
    let score = 0;
    const weights = {
        mainClause: 0.3,
        complementClause: 0.4,
        relationship: 0.2,
        position: 0.1
    };

    // Main clause structure (max 0.3)
    if (analysis.mainClause.hasSVO) score += weights.mainClause * 0.5;
    if (analysis.mainClause.hasActionVerb || analysis.mainClause.hasModal) {
        score += weights.mainClause * 0.5;
    }

    // Complement clause structure (max 0.4)
    if (analysis.complementClause.properQueUsage) score += weights.complementClause * 0.3;
    if (analysis.complementClause.hasSubjunctive) score += weights.complementClause * 0.4;
    if (analysis.complementClause.hasCompleteVerbalStructure) {
        score += weights.complementClause * 0.3;
    }

    // Relationship between clauses (max 0.2)
    if (analysis.relationship.hasProperSequence) score += weights.relationship * 0.5;
    if (analysis.relationship.hasProperSubordination) score += weights.relationship * 0.5;

    // Position analysis (max 0.1)
    if (analysis.position?.isValidPosition) score += weights.position;

    return score;
};

/**
 * Main analysis function
 * @param {string} text - Text to analyze
 * @returns {Object} - Complete analysis
 */
export const analyzeText = (text) => {
    const match = text.match(AVANT_QUE_PATTERN.pattern);
    if (!match) {
        return {
            type: 'No Expletive',
            confidence: 0.90,
            evidence: {
                details: 'No avant que/avant qu\' found',
                recommendNe: false
            }
        };
    }

    // Split text at avant que
    const triggerIndex = match.index;
    const beforeTrigger = text.slice(0, triggerIndex).trim();
    const afterTrigger = text.slice(triggerIndex + match[0].length).trim();

    // Perform structural analysis
    const mainClause = analyzeMainClause(beforeTrigger);
    const complementClause = analyzeComplementClause(afterTrigger);
    const relationship = analyzeClauseRelationship(mainClause, complementClause);
    const position = analyzeNePosition(complementClause);

    // Calculate structural score
    const structuralScore = calculateStructuralScore({
        mainClause,
        complementClause,
        relationship,
        position
    });

    // Build evidence points
    const evidencePoints = [];
    if (mainClause.isComplete) evidencePoints.push('Complete main clause');
    if (mainClause.hasActionVerb) evidencePoints.push('Action verb in main clause');
    if (mainClause.hasTemporalMarker) evidencePoints.push('Temporal marker present');
    if (complementClause.hasSubjunctive) {
        evidencePoints.push(`Subjunctive verb found: ${complementClause.verbInfo.verb}`);
        if (complementClause.verbInfo.isSpecificMatch) {
            evidencePoints.push(`Specific subjunctive form matched: ${complementClause.verbInfo.type}`);
        }
    }
    if (relationship.hasProperSequence) evidencePoints.push('Proper temporal sequence');
    if (position?.isValidPosition) evidencePoints.push('Valid ne position found');

    return {
        type: 'Expletive',
        confidence: Math.min(structuralScore, 0.95),
        evidence: {
            trigger: AVANT_QUE_PATTERN.name,
            hasSubjunctive: complementClause.hasSubjunctive,
            details: evidencePoints.join('; '),
            structuralScore,
            mainClause,
            complementClause,
            relationship,
            position,
            nePosition: position?.recommendedPosition || null
        }
    };
};
