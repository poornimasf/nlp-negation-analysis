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
        result += 'Evidence:\n';
        
        // Trigger information
        if (evidence.trigger) {
            result += '\nTrigger Analysis:\n';
            result += `- Found: "${evidence.trigger}"\n`;
            if (evidence.category) {
                result += `- Category: ${evidence.category}\n`;
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
 * Format training data analysis results
 */
export const formatTrainingResult = (analysis) => {
    let result = 'Training Data Analysis\n';
    result += '-----------------\n\n';
    
    // Classification and Confidence
    result += `Classification: ${analysis.classification}\n`;
    result += `Confidence: ${Math.round(analysis.confidence * 100)}%\n\n`;
    
    // Context Analysis
    result += 'Context Analysis:\n';
    if (analysis.analysis?.context) {
        const ctx = analysis.analysis.context;
        if (ctx.precedingSentence) {
            result += `- Previous: "${ctx.precedingSentence}"\n`;
        }
        result += `- Current: "${ctx.currentSentence}"\n`;
        if (ctx.followingSentence) {
            result += `- Following: "${ctx.followingSentence}"\n`;
        }
    }
    
    // Trigger Analysis
    result += '\nTrigger Analysis:\n';
    if (analysis.analysis?.trigger) {
        const trigger = analysis.analysis.trigger;
        result += `- Found: "${trigger.trigger}"\n`;
        result += `- Category: ${trigger.category}\n`;
        result += `- Context: "${trigger.context}"\n`;
    } else {
        result += '- No trigger found\n';
    }
    
    // Structure Analysis
    result += '\nStructure Analysis:\n';
    if (analysis.analysis?.structure) {
        const structure = analysis.analysis.structure;
        result += `- Before trigger: "${structure.precedingContext}"\n`;
        result += `- After trigger: "${structure.followingContext}"\n`;
    }
    
    // Training Data Matches
    if (analysis.analysis?.trainingData?.similarExamples?.length > 0) {
        result += '\nSimilar Examples:\n';
        analysis.analysis.trainingData.similarExamples.forEach((example, idx) => {
            result += `${idx + 1}. "${example.text}"\n`;
            result += `   - Similarity: ${Math.round(example.similarity * 100)}%\n`;
            if (example.trigger) {
                result += `   - Trigger: "${example.trigger}"\n`;
            }
            result += `   - Classification: ${example.has_expletive_ne ? 'Expletive' : 'No Expletive'}\n`;
        });
    }
    
    // Evidence Summary
    if (analysis.details) {
        result += '\nEvidence Summary:\n';
        analysis.details.forEach(detail => {
            result += `- ${detail}\n`;
        });
    }
    
    // Weighted Evidence
    if (analysis.evidence?.weightedEvidence) {
        result += '\nWeighted Evidence:\n';
        const weights = analysis.evidence.weightedEvidence;
        result += `- Expletive support: ${Math.round(weights.expletive * 100)}%\n`;
        result += `- Non-expletive support: ${Math.round(weights.nonExpletive * 100)}%\n`;
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
