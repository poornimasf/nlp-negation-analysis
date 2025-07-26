import CroissantLLMService from '../services/CroissantLLMService';

class EnhancedPatternMatcher {
    static async findExpletiveTrigger(text, patterns) {
        // First, use traditional pattern matching (modified for removed 'ne')
        const basicMatch = this.findBasicTrigger(text, patterns);
        
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

        // Modified patterns to work without 'ne' - focus on trigger constructions
        for (const [triggerType, patternList] of Object.entries(patterns)) {
            for (const pattern of patternList) {
                // Remove the negative lookbehind for 'pas' since we're predicting removed 'ne'
                const modifiedPattern = pattern.toString()
                    .replace(/\(\?\!\\\s\+pas\)\\\s\*/g, '') // Remove negative lookbehind
                    .replace(/\/gi$/, '') // Remove flags
                    .replace(/^\//, ''); // Remove leading slash
                
                try {
                    const testPattern = new RegExp(modifiedPattern, 'gi');
                    const match = normalizedText.match(testPattern);
                    if (match) {
                        return {
                            type: triggerType,
                            match: match[0].trim(),
                            position: match.index,
                            confidence: this.calculateBasicConfidence(match[0], triggerType)
                        };
                    }
                } catch (error) {
                    // If pattern modification fails, try original pattern
                    const match = normalizedText.match(pattern);
                    if (match) {
                        return {
                            type: triggerType,
                            match: match[0].trim(),
                            position: match.index,
                            confidence: this.calculateBasicConfidence(match[0], triggerType)
                        };
                    }
                }
            }
        }
        return null;
    }

    static calculateBasicConfidence(matchedText, triggerType) {
        let confidence = 0.7; // Base confidence for trigger detection
        
        // Adjust confidence based on trigger specificity (not 'ne' presence)
        if (matchedText.includes("j'ai") || matchedText.includes("nous avons")) confidence += 0.1;
        if (matchedText.includes("grand")) confidence += 0.05;
        if (matchedText.includes("par peur") || matchedText.includes("de peur")) confidence += 0.1;
        if (triggerType === 'avant' && matchedText.includes("juste")) confidence += 0.05;
        
        if (triggerType === 'peu_sen_faut') {
            if (matchedText.includes("il s'en")) confidence += 0.1;
            if (matchedText.includes("très") || matchedText.includes("tellement")) confidence += 0.05;
            if (matchedText.includes("est fallu") || matchedText.includes("serait fallu")) confidence += 0.05;
        }
        
        return Math.min(confidence, 0.95);
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
