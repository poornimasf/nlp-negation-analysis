/**
 * Format training data analysis results
 */
export const formatTrainingResult = (analysis) => {
    let result = 'Training Data Analysis\n';
    result += '-----------------\n\n';
    
    // Classification and Confidence
    result += `Classification: ${analysis.classification}\n`;
    result += `Confidence: ${Math.round(analysis.confidence * 100)}%\n\n`;
    
    // Trigger Analysis
    result += 'Trigger Analysis:\n';
    if (analysis.analysis?.trigger) {
        const trigger = analysis.analysis.trigger;
        result += `- Found: "${trigger.trigger}"\n`;
        result += `- Category: ${trigger.category}\n`;
        
        // Add subcategory for avant que
        if (trigger.category === 'TEMPORAL' && trigger.trigger.includes('avant')) {
            result += `- Subcategory: ${trigger.subcategory || 'DEFAULT'}\n`;
            result += `- Usage: ${getAvantQueUsageDescription(trigger.subcategory)}\n`;
        }
    } else {
        result += '- No trigger found\n';
    }
    
    // Best Match Example
    if (analysis.analysis?.trainingData?.similarExamples?.length > 0) {
        const bestMatch = analysis.analysis.trainingData.similarExamples[0];
        result += '\nBest Match:\n';
        result += `- Example: "${bestMatch.text}"\n`;
        result += `- Similarity: ${Math.round(bestMatch.similarity * 100)}%\n`;
        result += `- Classification: ${bestMatch.has_expletive_ne ? 'Expletive' : 'No Expletive'}\n`;
    }
    
    // Evidence Summary
    if (analysis.details?.length > 0) {
        result += '\nEvidence Summary:\n';
        analysis.details.forEach(detail => {
            result += `- ${detail}\n`;
        });

        // Add confidence factors when we have a temporal trigger
        if (analysis.evidence?.triggerCategory === 'TEMPORAL') {
            result += '\nConfidence Factors:\n';
            if (analysis.evidence?.hasSubjunctive) {
                result += '- Well-formed subjunctive structure\n';
            }
            if (analysis.evidence?.trigger?.includes('avant')) {
                result += '- Clear temporal sequence marker\n';
            }
            // Check for formal/literary register indicators
            if (text.includes('dont') || text.includes('autrefois') || 
                text.includes('puis') || text.includes('y')) {
                result += '- Historical/literary register\n';
            }
            // Check for expletive ne
            if (analysis.evidence?.hasOptionalNe) {
                result += '- Presence of expletive ne\n';
            }
        }
    }
    
    // Weighted Evidence
    if (analysis.evidence?.weightedEvidence) {
        const weights = analysis.evidence.weightedEvidence;
        const total = weights.expletive + weights.nonExpletive;
        if (total > 0) {
            result += '\nConfidence Breakdown:\n';
            result += `- Expletive: ${Math.round((weights.expletive / total) * 100)}%\n`;
            result += `- Non-expletive: ${Math.round((weights.nonExpletive / total) * 100)}%\n`;
        }
    }
    
    return result;
};

/**
 * Get description for avant que subcategory
 */
function getAvantQueUsageDescription(subcategory) {
    switch (subcategory) {
        case 'SEQUENCE':
            return 'Pure temporal sequence';
        case 'PREVENTIVE':
            return 'Action to prevent something';
        case 'ANTICIPATORY':
            return 'Preparation for future event';
        default:
            return 'General temporal usage';
    }
}

/**
 * Format rule-based analysis results
 */
export const formatRuleBasedResult = (analysis) => {
    const { type, confidence, evidence } = analysis;
    const confidencePercent = Math.round(confidence * 100);
    
    let result = 'Rule-Based Analysis\n';
    result += '-----------------\n\n';
    
    // Classification and confidence
    result += `Classification: ${type}\n`;
    result += `Confidence: ${confidencePercent}%\n\n`;
    
    if (evidence) {
        // Trigger information
        if (evidence.trigger) {
            result += 'Trigger Analysis:\n';
            result += `- Found: "${evidence.trigger}"\n`;
            if (evidence.category) {
                result += `- Category: ${evidence.category}\n`;
                // Add subcategory for avant que
                if (evidence.category === 'TEMPORAL' && evidence.trigger.includes('avant')) {
                    result += `- Subcategory: ${evidence.subcategory || 'DEFAULT'}\n`;
                    result += `- Usage: ${getAvantQueUsageDescription(evidence.subcategory)}\n`;
                }
            }
        }
        
        // Complement clause analysis
        if (evidence.complementClause) {
            result += '\nClause Analysis:\n';
            const clause = evidence.complementClause;
            
            // Structure
            if (clause.structure) {
                result += '- Structure:\n';
                if (clause.structure.subject) {
                    result += `  * Subject: "${clause.structure.subject.word}"\n`;
                }
                if (clause.structure.verb) {
                    result += `  * Verb: "${clause.structure.verb.word}"\n`;
                }
                if (clause.structure.pattern) {
                    result += `  * Pattern: ${clause.structure.pattern}\n`;
                }
            }

            // Subjunctive
            if (clause.hasSubjunctive) {
                result += '- Subjunctive:\n';
                if (clause.verbInfo) {
                    result += `  * Form: ${clause.verbInfo.verb}\n`;
                    if (clause.verbInfo.type) {
                        result += `  * Type: ${clause.verbInfo.type}\n`;
                    }
                }
            }
        }

        // Additional evidence points
        if (evidence.details) {
            result += '\nDetails:\n';
            const points = Array.isArray(evidence.details) 
                ? evidence.details 
                : evidence.details.split('; ');
            points.forEach(point => {
                result += `- ${point}\n`;
            });
        }
        
        // Ne position information
        if (evidence.nePosition !== undefined && evidence.nePosition !== null) {
            result += '\nNE Position:\n';
            result += `- Suggested position: ${evidence.nePosition}\n`;
        }

        // Notes
        if (evidence.note) {
            result += '\nNote:\n';
            result += `- ${evidence.note}\n`;
        }
    }
    
    return result;
};

/**
 * Format hybrid analysis results
 */
export const formatHybridResult = (analysis, llmAnalysis) => {
    let result = 'Hybrid Analysis\n';
    result += '--------------\n\n';
    
    // Classification and confidence
    result += `Classification: ${llmAnalysis.classification}\n`;
    if (llmAnalysis.confidence) {
        const llmConfidence = Math.round(llmAnalysis.confidence * 100);
        result += `Confidence: ${llmConfidence}%\n\n`;
    }

    // Pattern analysis
    if (llmAnalysis.trigger) {
        result += 'Pattern Analysis:\n';
        result += `- Trigger: "${llmAnalysis.trigger}"\n`;
        if (llmAnalysis.trigger.includes('avant')) {
            result += `- Category: TEMPORAL\n`;
            result += `- Subcategory: ${llmAnalysis.subcategory || 'DEFAULT'}\n`;
            result += `- Usage: ${getAvantQueUsageDescription(llmAnalysis.subcategory)}\n`;
        }
    }

    // Detected patterns
    if (llmAnalysis.patterns) {
        result += '\nDetected Patterns:\n';
        llmAnalysis.patterns.forEach(pattern => {
            result += `- ${pattern}\n`;
        });
    }

    // Linguistic analysis
    if (llmAnalysis.explanation) {
        result += '\nLinguistic Analysis:\n';
        const points = llmAnalysis.explanation.split('. ').filter(s => s.trim());
        points.forEach(point => {
            result += `- ${point}\n`;
        });
    }

    // NE position
    if (llmAnalysis.nePosition) {
        result += '\nNE Position:\n';
        result += `- Suggested position: ${llmAnalysis.nePosition}\n`;
    }

    // Suggestion
    if (llmAnalysis.proposedSentence) {
        result += '\nSuggestion:\n';
        result += `"${llmAnalysis.proposedSentence}"\n`;
    }

    return result;
};
