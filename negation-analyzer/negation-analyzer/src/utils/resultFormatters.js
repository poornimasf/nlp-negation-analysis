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
    }
    
    return result;
};

/**
 * Format training data analysis results
 */
export const formatTrainingResult = (analysis) => {
    let result = 'Training Data Analysis\n';
    result += '-----------------\n\n';
    
    // Classification and Confidence with explanation
    result += `Classification: ${analysis.classification}\n`;
    result += `Should be "${analysis.classification}" because:\n`;
    if (analysis.analysis?.trigger) {
        result += `- Has ${analysis.analysis.trigger.category.toLowerCase()} trigger "${analysis.analysis.trigger.trigger}"\n`;
    }
    if (analysis.evidence?.hasSubjunctive) {
        result += '- Uses subjunctive form\n';
    }
    if (analysis.evidence?.triggerSubcategory) {
        result += `- ${getSubcategoryReason(analysis.evidence.triggerSubcategory)}\n`;
    }
    result += '\n';
    
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
        result += `- Example's Classification: ${bestMatch.has_expletive_ne ? 'Expletive' : 'No Expletive'}\n`;
        result += `- Note: This is a similar example but final classification is based on all evidence\n`;
    }
    
    // Evidence Summary with enhanced explanation
    if (analysis.details?.length > 0) {
        result += '\nEvidence Summary:\n';
        result += `- Found ${analysis.analysis?.trainingData?.similarExamples?.length || 0} similar examples\n`;
        if (analysis.evidence?.weightedEvidence) {
            const weights = analysis.evidence.weightedEvidence;
            const total = weights.expletive + weights.nonExpletive;
            if (total > 0) {
                const expletivePercent = Math.round((weights.expletive / total) * 100);
                result += `- ${expletivePercent}% of similar examples use expletive ne\n`;
                result += `- Based on all evidence, ${analysis.classification} is more likely\n`;
            }
        }
        analysis.details.forEach(detail => {
            result += `- ${detail}\n`;
        });

        // Add confidence factors
        result += '\nConfidence Factors:\n';
        if (analysis.evidence?.hasSubjunctive) {
            result += '- Well-formed subjunctive structure (indicates proper grammatical form)\n';
        }
        if (analysis.evidence?.trigger?.includes('avant')) {
            result += '- Clear temporal marker (indicates potential for expletive ne)\n';
        }
        if (analysis.evidence?.hasOptionalNe) {
            result += '- Presence of expletive ne (strengthens classification)\n';
        }
        
        // Add register analysis
        if (analysis.analysis?.trigger?.context) {
            const text = analysis.analysis.trigger.context;
            if (text.includes('dont') || text.includes('autrefois') || 
                text.includes('puis') || text.includes('y')) {
                result += '- Historical/literary register (common context for expletive ne)\n';
            }
        }
    }
    
    // Weighted Evidence with explanation
    if (analysis.evidence?.weightedEvidence) {
        const weights = analysis.evidence.weightedEvidence;
        const total = weights.expletive + weights.nonExpletive;
        if (total > 0) {
            result += '\nConfidence Breakdown:\n';
            result += `- Expletive: ${Math.round((weights.expletive / total) * 100)}% (based on similar examples)\n`;
            result += `- Non-expletive: ${Math.round((weights.nonExpletive / total) * 100)}% (based on similar examples)\n`;
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

// Helper function for subcategory reasons
function getSubcategoryReason(subcategory) {
    switch (subcategory) {
        case 'SEQUENCE':
            return 'Describes pure temporal sequence (common for expletive ne)';
        case 'PREVENTIVE':
            return 'Indicates preventive action (strong case for expletive ne)';
        case 'ANTICIPATORY':
            return 'Shows preparation for future event (often uses expletive ne)';
        default:
            return 'Shows temporal relationship';
    }
}
