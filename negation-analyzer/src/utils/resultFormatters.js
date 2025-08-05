/**
 * Format training data analysis results with comprehensive information
 */
export const formatTrainingResult = (analysis) => {
    let result = 'Training Data Analysis\n';
    result += '-----------------\n\n';
    
    // Classification and Confidence
    result += `Classification: ${analysis.classification}\n`;
    result += `Confidence: ${Math.round(analysis.confidence * 100)}%\n\n`;
    
    // Context Analysis
    result += 'Context Analysis:\n';
    if (analysis.analysis.context) {
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
    if (analysis.analysis.trigger) {
        const trigger = analysis.analysis.trigger;
        result += `- Found: "${trigger.trigger}"\n`;
        result += `- Category: ${trigger.category}\n`;
        result += `- Context: "${trigger.context}"\n`;
    } else {
        result += '- No trigger found\n';
    }
    
    // Structure Analysis
    result += '\nStructure Analysis:\n';
    if (analysis.analysis.structure) {
        const structure = analysis.analysis.structure;
        result += `- Before trigger: "${structure.precedingContext}"\n`;
        result += `- After trigger: "${structure.followingContext}"\n`;
    }
    
    // Training Data Matches
    if (analysis.analysis.trainingData.similarExamples.length > 0) {
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
    result += '\nEvidence Summary:\n';
    analysis.details.forEach(detail => {
        result += `- ${detail}\n`;
    });
    
    // Weighted Evidence
    if (analysis.evidence.weightedEvidence) {
        result += '\nWeighted Evidence:\n';
        const weights = analysis.evidence.weightedEvidence;
        result += `- Expletive support: ${Math.round(weights.expletive * 100)}%\n`;
        result += `- Non-expletive support: ${Math.round(weights.nonExpletive * 100)}%\n`;
    }
    
    return result;
};
