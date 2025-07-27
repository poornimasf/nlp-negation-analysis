import CroissantLLMService from '../services/CroissantLLMService';

class EnhancedPatternMatcher {
    // Enhanced expletive trigger patterns with comprehensive variations
    static EXPLETIVE_PATTERNS = {
        // Fear expressions (peur que)
        peur_que: [
            // Basic constructions
            /\b(?:j'ai|tu as|il a|elle a|nous avons|vous avez|ils ont)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e']/i,
            /\bpeur\s+qu[e']/i,
            
            // Prepositional forms
            /\b(?:par|de|dans|avec)\s+peur\s+qu[e']/i,
            
            // Intensity modifiers
            /\b(?:tellement|si|très|fort)\s+peur\s+qu[e']/i
        ],
        
        // Temporal expressions (avant que)
        avant_que: [
            // Basic temporal markers
            /\bavant\s+qu[e']/i,
            /\b(?:juste|bien|peu)\s+avant\s+qu[e']/i,
            
            // Complex temporal expressions
            /\b(?:quelques?|plusieurs)\s+(?:minutes?|heures?|jours?)\s+avant\s+qu[e']/i
        ],
        
        // Peu s'en faut expressions with comprehensive variations
        peu_sen_faut: [
            // Basic construction (present)
            /\bpeu\s+s['']en\s+(?:faut|manque)\s+(?:que?|qu[''])\s*/i,
            
            // Past tense variations
            /\bpeu\s+s['']en\s+(?:fallut|fallu[ts]?|manqua|manquât)\s+(?:que?|qu[''])\s*/i,
            /\bpeu\s+s['']en\s+(?:est|était|fut|fût)\s+(?:fallu|manqué)\s+(?:que?|qu[''])\s*/i,
            
            // Future and conditional
            /\bpeu\s+s['']en\s+(?:faudra|faudrait|manquera|manquerait)\s+(?:que?|qu[''])\s*/i,
            
            // Variations with intensifiers
            /\b(?:très|si|tellement|fort|bien)\s+peu\s+s['']en\s+(?:faut|fallut|fallu[ts]?|manque|manqua|manquât)\s+(?:que?|qu[''])\s*/i,
            
            // Impersonal constructions (present)
            /\bil\s+s['']en\s+(?:faut|manque)\s+(?:de\s+)?peu\s+(?:que?|qu[''])\s*/i,
            
            // Impersonal constructions (past)
            /\bil\s+s['']en\s+(?:fallut|fallu[ts]?|manqua|manquât)\s+(?:de\s+)?peu\s+(?:que?|qu[''])\s*/i,
            /\bil\s+s['']en\s+(?:est|était|fut|fût)\s+(?:fallu|manqué)\s+(?:de\s+)?peu\s+(?:que?|qu[''])\s*/i,
            
            // Question forms (all tenses)
            /\bs['']en\s+(?:faut|fallut|fallu[ts]?|manque|manqua|manquât)[-]?t[-]?il\s+(?:de\s+)?peu\s+(?:que?|qu[''])\s*/i,
            
            // Literary/historical variations
            /\bpeu\s+s['']en\s+(?:falloit|falloient|fallust|fallût)\s+(?:que?|qu[''])\s*/i,
            /\bpeu\s+s['']en\s+(?:manquoit|manquoient|manquast|manquât)\s+(?:que?|qu[''])\s*/i,
            
            // Additional temporal variations
            /\bpeu\s+s['']en\s+(?:serait|sera|aurait|aura)\s+(?:fallu|manqué)\s+(?:que?|qu[''])\s*/i,
            
            // Archaic/regional variations
            /\bpou\s+s['']en\s+(?:faut|fallut|fallu[ts]?)\s+(?:que?|qu[''])\s*/i,
            /\bpetit\s+s['']en\s+(?:faut|fallut|fallu[ts]?)\s+(?:que?|qu[''])\s*/i,
            
            // Compound constructions
            /\bde?\s+peu\s+s['']en\s+(?:faut|fallut|fallu[ts]?|manque|manqua|manquât)\s+(?:que?|qu[''])\s*/i,
            /\bpeu\s+s['']en\s+est\s+fallu\s+de\s+(?:que?|qu[''])\s*/i
        ]
    };

    static async findExpletiveTrigger(text, patterns) {
        // First, use traditional pattern matching (modified for removed 'ne')
        const basicMatch = this.findBasicTrigger(text, patterns || this.EXPLETIVE_PATTERNS);
        
        if (!basicMatch) {
            return null;
        }

        try {
            // Enhance with CroissantLLM analysis - now context-aware
            const llmValidation = await CroissantLLMService.validatePattern(
                text,
                basicMatch.match
            );

            if (!llmValidation) {
                return basicMatch;
            }

            // Adjust confidence based on LLM insights about removed 'ne'
            const enhancedConfidence = await CroissantLLMService.enhanceConfidence(
                text,
                basicMatch.confidence,
                `Pattern: ${basicMatch.match}, Type: ${basicMatch.type}, Context: removed 'ne' prediction`
            );

            return {
                ...basicMatch,
                confidence: enhancedConfidence?.adjustedScore || basicMatch.confidence,
                llmValidation: {
                    isExpletive: llmValidation.isExpletive,
                    confidence: llmValidation.validity,
                    justification: llmValidation.justification,
                    expectedMood: llmValidation.expectedMood
                },
                enhancedReasoning: enhancedConfidence?.justification || '',
                decisiveFactors: enhancedConfidence?.decisiveFactors || ''
            };
        } catch (error) {
            console.error('LLM enhancement failed:', error);
            return basicMatch;
        }
    }

    static findBasicTrigger(text, patterns) {
        const normalizedText = text.toLowerCase()
            .replace(/['']/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

        // Use class patterns if none provided
        const patternsToUse = patterns || this.EXPLETIVE_PATTERNS;

        for (const [type, patternList] of Object.entries(patternsToUse)) {
            for (const pattern of patternList) {
                try {
                    const match = normalizedText.match(pattern);
                    if (match) {
                        const confidenceResult = this.calculateBasicConfidence(match[0], type);
                        return {
                            type,
                            match: match[0].trim(),
                            position: match.index,
                            confidence: confidenceResult.score,
                            confidenceDetails: confidenceResult.details
                        };
                    }
                } catch (error) {
                    console.error('Pattern matching error:', error);
                    continue;
                }
            }
        }
        return null;
    }

    static calculateBasicConfidence(matchedText, triggerType) {
        let confidence = 0.7; // Default base confidence
        let confidenceDetails = []; // Track confidence calculation steps
        
        // Adjust confidence based on trigger type and specificity
        switch(triggerType) {
            case 'peur_que':
                if (matchedText.includes("j'ai") || matchedText.includes("nous avons")) confidence += 0.1;
                if (matchedText.includes("grand")) confidence += 0.05;
                if (matchedText.includes("par peur") || matchedText.includes("de peur")) confidence += 0.1;
                break;
                
            case 'avant_que':
                if (matchedText.includes("juste")) confidence += 0.05;
                if (matchedText.includes("bien")) confidence += 0.05;
                break;
                
            case 'peu_sen_faut':
                // Start with higher base confidence for this strong indicator
                confidence = 0.75;
                confidenceDetails.push("Base confidence (strong expletive indicator): 0.75");
                
                // Core form bonuses (max +0.15)
                if (matchedText.includes("il s'en")) {
                    confidence += 0.08;
                    confidenceDetails.push("Impersonal construction bonus: +0.08");
                }
                
                // Intensity bonuses (max +0.05)
                if (matchedText.match(/(?:très|tellement|fort|bien)\s+peu\s+s['']en/)) {
                    confidence += 0.05;
                    confidenceDetails.push("Intensity modifier bonus: +0.05");
                }

                // Tense/form categorization (pick highest applicable, max +0.15)
                if (matchedText.match(/falloit|falloient|fallust|fallût|manquoit|manquoient/)) {
                    // Literary/historical forms (highest confidence)
                    confidence += 0.15;
                    confidenceDetails.push("Historical/literary form bonus: +0.15");
                } else if (matchedText.match(/fallut|fallu[ts]?|manqua|manquât/)) {
                    // Past tense forms
                    confidence += 0.12;
                    confidenceDetails.push("Past tense form bonus: +0.12");
                } else if (matchedText.match(/(?:est|était|fut|fût)\s+(?:fallu|manqué)/)) {
                    // Compound forms
                    confidence += 0.10;
                    confidenceDetails.push("Compound form bonus: +0.10");
                }

                // Regional variation (small bonus, max +0.03)
                if (matchedText.match(/pou\s+s['']en|petit\s+s['']en/)) {
                    confidence += 0.03;
                    confidenceDetails.push("Regional variation bonus: +0.03");
                }
                break;
                
            default:
                // Default adjustments for other trigger types
                if (matchedText.includes("que")) {
                    confidence += 0.05;
                    confidenceDetails.push("Basic 'que' presence: +0.05");
                }
        }
        
        // Cap confidence at 0.95
        confidence = Math.min(confidence, 0.95);
        
        // Add final confidence to details
        confidenceDetails.push(`Final confidence (capped at 0.95): ${confidence.toFixed(2)}`);
        
        return {
            score: confidence,
            details: confidenceDetails
        };
    }

    static async analyzeSyntacticContext(text) {
        try {
            const syntaxAnalysis = await CroissantLLMService.analyzeSyntax(text);
            
            if (!syntaxAnalysis) {
                return null;
            }

            return {
                isExpletive: syntaxAnalysis.isExpletive,
                confidence: syntaxAnalysis.confidence,
                reasoning: syntaxAnalysis.justification,
                linguisticIndices: syntaxAnalysis.indices
            };
        } catch (error) {
            console.error('Syntax analysis failed:', error);
            return null;
        }
    }
}

export default EnhancedPatternMatcher;
