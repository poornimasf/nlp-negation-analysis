/**
 * Trigger patterns for French expletive negation analysis
 */

// Trigger patterns that might allow expletive ne
export const TRIGGER_PATTERNS = {
    FEAR: [
        /peur\s+qu(?:e|')/i,     // peur que, peur qu'
        /craindre?\s+qu(?:e|')/i,  // craindre que, crains qu', craignent que
        /redouter?\s+qu(?:e|')/i,  // redouter que, redoute qu'
        /avoir\s+peur\s+qu(?:e|')/i,  // avoir peur que, ai peur qu', avait peur que
        // All tenses of avoir + peur
        /(?:a|ai|as|avais|avait|avaient|aurai|auras|aurait|aurais|auraient|ayant|auront|aura)\s+peur\s+qu(?:e|')/i
    ],
    TEMPORAL: {
        SEQUENCE: [
            // Pure temporal sequence
            /(?:partir|arriver|commencer|finir)\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,  // partir/arriver/commencer/finir avant que
            /(?:être|avoir)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,  // être/avoir + adj/noun avant que
            // Historical sequence indicators
            /(?:en|pendant|durant|après)\s+\w+(?:\s+\w+){0,3}\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i  // temporal prepositions
        ],
        PREVENTIVE: [
            // Actions to prevent something - with conjugations
            /(?:arrêter|arrête|arrêtes|arrêtez|arrêtent|empêcher|empêche|empêches|empêchez|empêchent|éviter|évite|évites|évitez|évitent|prévenir|préviens|prévient|prévenez|préviennent)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,
            // Preventive actions with objects - include conjugations and possessive pronouns
            /(?:prendre|prends|prenez|prennent|mettre|mets|met|mettez|mettent)\s+(?:le|la|les|un|une|des|mon|ton|son|notre|votre|leur|mes|tes|ses|nos|vos|leurs)\s+\w+(?:\s+\w+)*\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,
            // General preventive verbs with conjugations
            /(?:fermer|ferme|fermes|fermez|ferment|ranger|range|ranges|rangez|rangent|cacher|cache|caches|cachez|cachent)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,
            // Safety/precaution verbs with conjugations
            /(?:protéger|protège|protèges|protégez|protègent|couvrir|couvre|couvres|couvrez|couvrent|abriter|abrite|abrites|abritez|abritent)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i
        ],
        ANTICIPATORY: [
            // Preparation for future event
            /(?:préparer|organiser|planifier)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,  // préparer/organiser/etc. avant que
            /(?:se\s+préparer|se\s+tenir\s+prêt)\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i  // se préparer/se tenir prêt avant que
        ],
        DEFAULT: [
            // General temporal avant que
            /avant\s+(?:que\s+de\s+|qu(?:e|'))/i  // Any other avant que
        ]
        PREVENTIVE: [
            // Actions to prevent something - with conjugations
            /(?:arrêter|arrête|arrêtes|arrêtez|arrêtent|empêcher|empêche|empêches|empêchez|empêchent|éviter|évite|évites|évitez|évitent|prévenir|préviens|prévient|prévenez|préviennent)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,
            // Preventive actions with objects - include conjugations and possessive pronouns
            /(?:prendre|prends|prenez|prennent|mettre|mets|met|mettez|mettent)\s+(?:le|la|les|un|une|des|mon|ton|son|notre|votre|leur|mes|tes|ses|nos|vos|leurs)\s+\w+(?:\s+\w+)*\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,
            // General preventive verbs with conjugations
            /(?:fermer|ferme|fermes|fermez|ferment|ranger|range|ranges|rangez|rangent|cacher|cache|caches|cachez|cachent)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,
            // Safety/precaution verbs with conjugations
            /(?:protéger|protège|protèges|protégez|protègent|couvrir|couvre|couvres|couvrez|couvrent|abriter|abrite|abrites|abritez|abritent)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i
        ],
        ANTICIPATORY: [
            // Preparation for future event
            /(?:préparer|organiser|planifier)\s+\w+\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i,  // préparer/organiser/etc. avant que
            /(?:se\s+préparer|se\s+tenir\s+prêt)\s+avant\s+(?:que\s+de\s+|qu(?:e|'))/i  // se préparer/se tenir prêt avant que
        ],
        DEFAULT: [
            // General temporal avant que
            /avant\s+(?:que\s+de\s+|qu(?:e|'))/i  // Any other avant que
        ]
    },
    IMPERSONAL: [
        // Present, imperfect, conditional, future tenses
        /peu\s+s['']en\s+(?:faut|fallait|faudrait|faudra)\s+qu(?:e|')/i,
        // All variations of "il s'en faut/fallait/etc. de peu que"
        /il\s+s['']en\s+(?:faut|fallait|faudrait|faudra|est\s+fallu)\s+(?:de\s+)?peu\s+qu(?:e|')/i,
        // Past tense variations
        /il\s+s['']en\s+est\s+fallu\s+(?:de\s+)?peu\s+qu(?:e|')/i,
        /peu\s+s['']en\s+est\s+fallu\s+qu(?:e|')/i
    ],
    RELATIVE: [
        // Superlative constructions
        /le\s+(?:meilleur|mieux)\s+qu(?:e|')/i,
        /la\s+(?:meilleure?)\s+qu(?:e|')/i,
        /les\s+(?:meilleurs?|meilleures?)\s+qu(?:e|')/i,
        // Restrictive constructions
        /le\s+(?:seul|unique)\s+qu(?:e|')/i,
        /la\s+(?:seule|unique)\s+qu(?:e|')/i,
        /les\s+(?:seuls|seules|uniques)\s+qu(?:e|')/i,
        // Ordinal constructions
        /le\s+(?:premier|dernier)\s+qu(?:e|')/i,
        /la\s+(?:première|dernière)\s+qu(?:e|')/i,
        /les\s+(?:premiers|premières|derniers|dernières)\s+qu(?:e|')/i
    ]
};

// Subjunctive patterns
export const SUBJUNCTIVE_PATTERNS = {
    // Common irregular verbs in subjunctive (prioritized)
    ETRE: {
        pattern: /\b(?:sois|soit|soyons|soyez|soient)\b/i,
        priority: 1  // High priority for être
    },
    AVOIR: {
        pattern: /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,
        priority: 1
    },
    FAIRE: {
        pattern: /\b(?:fasse|fasses|fassions|fassiez|fassent)\b/i,
        priority: 1
    },
    ALLER: {
        pattern: /\b(?:aille|ailles|aillions|ailliez|aillent)\b/i,
        priority: 1
    },
    VOULOIR: {
        pattern: /\b(?:veuille|veuilles|veuillions|veuilliez|veuillent)\b/i,
        priority: 1
    },
    POUVOIR: {
        pattern: /\b(?:puisse|puisses|puissions|puissiez|puissent)\b/i,
        priority: 1
    },
    
    // Regular verb patterns
    ER_VERBS: {
        pattern: /\b\w+(?:e|es|ions|iez|ent)\b/i,
        priority: 0
    },
    IR_VERBS: {
        pattern: /\b\w+(?:isse|isses|issions|issiez|issent)\b/i,
        priority: 0
    },
    RE_VERBS: {
        pattern: /\b\w+(?:e|es|ions|iez|ent)\b/i,
        priority: 0
    }
};

// Confidence levels for analysis
export const CONFIDENCE_LEVELS = {
    NO_TRIGGER: 0.95,      // No trigger found
    NO_SUBJUNCTIVE: 0.90,  // Missing required subjunctive
    EXPLETIVE: 0.85,       // Valid expletive case (always optional)
    FALLBACK: 0.50         // Default for unclear cases
};
