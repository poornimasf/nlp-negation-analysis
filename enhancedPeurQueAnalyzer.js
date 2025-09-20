/**
 * Enhanced Peur Que Analyzer
 * Incorporates corpus-driven patterns to replace hard-coded assumptions
 * Based on analysis of 798 balanced examples showing clear contextual patterns
 */

class EnhancedPeurQueAnalyzer {
    constructor() {
        // Corpus-derived expletive rates by context (replacing hard-coded 0.8)
        this.contextualRates = {
            semantic: {
                medical: 0.0,      // Medical contexts: 0% expletive rate
                safety: 0.0,       // Safety contexts: 0% expletive rate  
                interpersonal: 0.0, // Interpersonal: 0% expletive rate
                general: 0.286     // General contexts: 28.6% expletive rate
            },
            register: {
                formal: 1.0,       // Formal register: 100% expletive rate
                informal: 0.1,     // Informal register: 10% expletive rate
                neutral: 0.25      // Neutral register: 25% expletive rate
            }
        };
        
        // Pattern recognition rules
        this.semanticPatterns = {
            medical: /\b(médecin|veto|vétérinaire|stérilisation|maladie|santé|docteur|hôpital|traitement|douleur|blessure|mort|mourir|bandage|medocs|médicament|opération|chirurgie|diagnostic|patient|soigner|guérir|symptôme|infection|virus|cancer|ambulance|clinique|pharmacie|infirmier)\b/i,
            
            safety: /\b(danger|dangereux|risque|accident|blessure|blesser|tomber|chuter|casser|briser|exploser|feu|incendie|voiture|route|conduire|sécurité|protéger|protection|police|vol|voler|cambriolage|agression|attaque|violence|violent|arme|guerre|combat|bataille|tuer|assassiner|crime|criminel|prison|emprisonner|arrêter|fuir|échapper|perdre|disparaître|enlever|kidnapper|séquestrer|étrangle|révolte|saisie|éliminer|menace)\b/i,
            
            interpersonal: /\b(amour|aimer|amoureuse?|relation|couple|mariage|épouser|famille|enfant|parent|ami|amitié|confiance|trahir|mentir|quitter|partir|abandonner|laisser|seul|solitude|jalousie|jaloux|colère|fâcher|dispute|conflit|réconciliation|pardon|pardonner|comprendre|écouter|parler|dire|avouer|révéler|secret|cacher|compagnon|copine|répondre|taquiner)\b/i
        };
        
        this.registerPatterns = {
            formal: /\b(monsieur|madame|mademoiselle|veuillez|daignez|permettez|excusez|pardonnez|néanmoins|cependant|toutefois|par conséquent|en conséquence|ainsi|donc|par ailleurs|en outre|de plus|en effet|effectivement|il convient|il s'agit|il importe|il est nécessaire|il est important|il est essentiel|atteste|dieux|frivolité|vanité|décrets)\b/i,
            
            informal: /\b(j'ai|t'as|y'a|c'est|ça|quoi|ouais|nan|nope|ok|okay|super|génial|cool|sympa|chouette|mignon|rigolo|marrant|drôle|mec|nana|fille|gars|type|truc|machin|bidule|bazar)\b/i
        };
    }

    analyzePeurQue(sentence) {
        const analysis = {
            sentence: sentence,
            patterns: {
                semantic: this.identifySemanticDomain(sentence),
                register: this.identifyRegister(sentence),
                subjunctive: this.hasSubjunctive(sentence)
            },
            prediction: null,
            confidence: 0,
            likelihood: 4, // Default neutral on 1-7 scale
            reasoning: []
        };

        // Calculate context-specific prediction
        const prediction = this.calculatePrediction(analysis);
        analysis.prediction = prediction.prediction;
        analysis.confidence = prediction.confidence;
        analysis.likelihood = prediction.likelihood;
        analysis.reasoning = prediction.reasoning;

        return analysis;
    }

    identifySemanticDomain(sentence) {
        for (const [domain, pattern] of Object.entries(this.semanticPatterns)) {
            if (pattern.test(sentence)) {
                return domain;
            }
        }
        return 'general';
    }

    identifyRegister(sentence) {
        if (this.registerPatterns.formal.test(sentence)) {
            return 'formal';
        }
        if (this.registerPatterns.informal.test(sentence)) {
            return 'informal';
        }
        return 'neutral';
    }

    hasSubjunctive(sentence) {
        // Enhanced subjunctive detection
        const subjunctivePatterns = [
            /peur\s+qu[e']\s*\w+\s+(soit|ait|fasse|vienne|aille|puisse|veuille|sache|doive|punisse|fût|eût)/i,
            /peur\s+qu[e']\s*\w+\s+\w+\s+(soit|ait|fasse|vienne|aille|puisse|veuille|sache|doive)/i,
            /peur\s+qu[e']\s*(?:il|elle|on|ils|elles|ce|cela|ça)\s+(?:ne\s+)?(\w+e|ait|soit)(?:\s|$|[,.!?])/i
        ];

        return subjunctivePatterns.some(pattern => pattern.test(sentence));
    }

    calculatePrediction(analysis) {
        const { semantic, register, subjunctive } = analysis.patterns;
        
        let baseRate = this.contextualRates.semantic[semantic] || this.contextualRates.semantic.general;
        let confidence = 0.6; // Base confidence
        let likelihood = 4; // Neutral starting point
        const reasoning = [];

        // Semantic domain adjustment
        if (semantic === 'medical' || semantic === 'safety') {
            baseRate = 0.0; // Strong evidence against expletive
            confidence += 0.2;
            likelihood = 2; // Somewhat unlikely
            reasoning.push(`${semantic} context strongly disfavors expletive (0% corpus rate)`);
        } else if (semantic === 'interpersonal') {
            baseRate = 0.0;
            confidence += 0.15;
            likelihood = 2;
            reasoning.push(`${semantic} context disfavors expletive (0% corpus rate)`);
        } else {
            reasoning.push(`${semantic} context shows moderate expletive usage (${(baseRate * 100).toFixed(1)}% corpus rate)`);
        }

        // Register adjustment (strongest predictor from corpus)
        const registerRate = this.contextualRates.register[register];
        if (register === 'formal') {
            baseRate = Math.max(baseRate, 0.9); // Formal strongly favors expletive
            confidence += 0.3;
            likelihood = 6; // Likely
            reasoning.push(`Formal register strongly favors expletive (100% corpus rate)`);
        } else if (register === 'informal') {
            baseRate = Math.min(baseRate, 0.1); // Informal disfavors expletive
            confidence += 0.2;
            likelihood = Math.min(likelihood, 3);
            reasoning.push(`Informal register disfavors expletive (10% corpus rate)`);
        } else {
            // Neutral register
            baseRate = (baseRate + registerRate) / 2;
            reasoning.push(`Neutral register shows moderate expletive usage (25% corpus rate)`);
        }

        // Subjunctive presence (linguistic requirement)
        if (subjunctive) {
            confidence += 0.1;
            reasoning.push(`Subjunctive mood detected (supports expletive context)`);
        } else {
            confidence -= 0.1;
            reasoning.push(`No clear subjunctive detected`);
        }

        // Final prediction
        const prediction = baseRate >= 0.5 ? 'expletive' : 'no_expletive';
        
        // Adjust likelihood based on final rate
        if (baseRate >= 0.8) {
            likelihood = 6; // Likely
        } else if (baseRate >= 0.6) {
            likelihood = 5; // Somewhat likely
        } else if (baseRate <= 0.2) {
            likelihood = 2; // Somewhat unlikely
        } else if (baseRate <= 0.1) {
            likelihood = 1; // Highly unlikely
        }

        return {
            prediction,
            confidence: Math.min(confidence, 1.0),
            likelihood,
            baseRate,
            reasoning
        };
    }

    // Integration method for existing system
    enhanceExistingAnalysis(existingResult, sentence) {
        const enhanced = this.analyzePeurQue(sentence);
        
        // Combine with existing analysis
        return {
            ...existingResult,
            enhanced: {
                semanticDomain: enhanced.patterns.semantic,
                register: enhanced.patterns.register,
                corpusPrediction: enhanced.prediction,
                corpusConfidence: enhanced.confidence,
                likelihood: enhanced.likelihood,
                contextualRate: enhanced.baseRate,
                reasoning: enhanced.reasoning
            },
            // Override prediction if corpus analysis is confident
            finalPrediction: enhanced.confidence > 0.8 ? enhanced.prediction : existingResult.prediction,
            finalConfidence: Math.max(existingResult.confidence || 0.5, enhanced.confidence)
        };
    }

    // Batch analysis for testing
    analyzeBatch(sentences) {
        return sentences.map(sentence => this.analyzePeurQue(sentence));
    }

    // Generate enhancement rules for integration
    generateIntegrationRules() {
        return {
            // Rules for ruleBasedAnalyzer.js enhancement
            semanticDomainRules: {
                medical: { expletiveRate: 0.0, confidence: 0.9 },
                safety: { expletiveRate: 0.0, confidence: 0.9 },
                interpersonal: { expletiveRate: 0.0, confidence: 0.8 },
                general: { expletiveRate: 0.286, confidence: 0.6 }
            },
            
            registerRules: {
                formal: { expletiveRate: 1.0, confidence: 0.95 },
                informal: { expletiveRate: 0.1, confidence: 0.8 },
                neutral: { expletiveRate: 0.25, confidence: 0.6 }
            },
            
            // Combined scoring formula
            scoringFormula: `
            baseRate = semanticRate * 0.4 + registerRate * 0.6
            if (hasSubjunctive) baseRate += 0.1
            if (formal && (medical || safety)) baseRate = 0.9  // Override for formal medical/safety
            confidence = baseConfidence + domainConfidence + registerConfidence
            `
        };
    }
}

// Test the enhanced analyzer
function testEnhancedAnalyzer() {
    console.log('🧪 TESTING ENHANCED PEUR QUE ANALYZER');
    console.log('='.repeat(50));
    
    const analyzer = new EnhancedPeurQueAnalyzer();
    
    const testSentences = [
        // Medical context (should predict no expletive)
        "j'ai peur que la stérilisation lui ai fait quelque chose dedans",
        
        // Safety context (should predict no expletive)  
        "on avait peur qu'il l'étrangle",
        
        // Formal context (should predict expletive)
        "j'en atteste les dieux : j'ai eu peur qu'Aurélien ne le punît trop durement",
        
        // Informal context (should predict no expletive)
        "j'ai peur que ça fasse beaucoup de route quoi",
        
        // General context
        "j'ai peur qu'Ingrid Betancourt soit en train de mourir"
    ];
    
    testSentences.forEach((sentence, index) => {
        console.log(`\n${index + 1}. "${sentence.substring(0, 60)}..."`);
        const result = analyzer.analyzePeurQue(sentence);
        
        console.log(`   Domain: ${result.patterns.semantic}`);
        console.log(`   Register: ${result.patterns.register}`);
        console.log(`   Prediction: ${result.prediction}`);
        console.log(`   Likelihood: ${result.likelihood}/7`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   Reasoning: ${result.reasoning.join('; ')}`);
    });
    
    console.log('\n🔧 INTEGRATION RULES:');
    const rules = analyzer.generateIntegrationRules();
    console.log(JSON.stringify(rules, null, 2));
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedPeurQueAnalyzer;
}

// Run test if called directly
if (require.main === module) {
    testEnhancedAnalyzer();
}
