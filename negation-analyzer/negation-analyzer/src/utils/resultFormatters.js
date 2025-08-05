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
            // Check for formal/literary register indicators in the original text
            if (analysis.analysis?.trigger?.context) {
                const text = analysis.analysis.trigger.context;
                if (text.includes('dont') || text.includes('autrefois') || 
                    text.includes('puis') || text.includes('y')) {
                    result += '- Historical/literary register\n';
                }
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
