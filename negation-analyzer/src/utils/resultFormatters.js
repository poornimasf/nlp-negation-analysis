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
        result += `- Classification: ${bestMatch.has_expletive_ne ? 'Expletive' : 'No Expletive'}\n`;
    }
    
    // Evidence Summary with enhanced explanation
    if (analysis.details?.length > 0) {
        result += '\nEvidence Summary:\n';
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
