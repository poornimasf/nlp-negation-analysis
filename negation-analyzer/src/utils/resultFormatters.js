export const formatTrainingResult = (analysis, trainingAnalysis) => {
    const { type, confidence, evidence } = analysis;
    const confidencePercent = Math.round(confidence * 100);
    
    let result = `${type} (${confidencePercent}% confidence)\n`;
    result += `Based on training data analysis:\n`;
    
    if (trainingAnalysis.matches && trainingAnalysis.matches.length > 0) {
        result += `- Found ${trainingAnalysis.matches.length} similar examples\n`;
        result += `- Best match confidence: ${Math.round(trainingAnalysis.confidence * 100)}%\n`;
        
        // Add trigger information
        if (evidence.trigger) {
            result += `- Trigger: "${evidence.trigger}"\n`;
        }
        
        // Add marker recommendation only if we have a position
        if (evidence.nePosition !== null && evidence.markerForm) {
            result += `- Recommendation: Add '${evidence.markerForm}' before subjunctive verb "${evidence.verb}"\n`;
            result += `  • ${evidence.positionReason}\n`;
            if (evidence.markerForm === "n'") {
                result += `  • Using 'n'' form because verb starts with vowel/silent h\n`;
            }
            result += `  • Verb "${evidence.verb}" is in subjunctive form\n`;
        }
        
        // Add best match example with detailed comparison
        result += `\nMost similar training example:\n`;
        result += `"${trainingAnalysis.matches[0].text}"\n`;
        result += `- Similarity breakdown:\n`;
        result += `  • Overall match: ${Math.round(trainingAnalysis.confidence * 100)}%\n`;
        if (evidence.similarity?.structural) {
            result += `  • Structure match: ${Math.round(evidence.similarity.structural * 100)}%\n`;
        }
        if (evidence.similarity?.context) {
            result += `  • Context match: ${Math.round(evidence.similarity.context * 100)}%\n`;
        }
        
        // Add alternative matches if available
        if (trainingAnalysis.matches.length > 1) {
            result += `\nOther relevant examples:\n`;
            trainingAnalysis.matches.slice(1, 3).forEach((match, idx) => {
                result += `${idx + 2}. "${match.text}"\n`;
            });
        }
    } else {
        result += `- No close matches in training data\n`;
    }
    
    return result;
};

export const formatRuleBasedResult = (analysis) => {
    const { type, confidence, evidence } = analysis;
    const confidencePercent = Math.round(confidence * 100);
    
    // Ensure type is properly formatted for prediction extraction
    const formattedType = type === 'Expletive' ? 'Expletive' : 'No Expletive';
    let result = `${formattedType} (${confidencePercent}% confidence)\n`;
    
    if (evidence) {
        result += `\nEvidence:\n`;
        
        // Add structural score if available
        if (evidence.structuralScore !== undefined) {
            result += `- Structural analysis score: ${Math.round(evidence.structuralScore * 100)}%\n`;
        }
        
        // Add detailed evidence points
        if (evidence.details) {
            const points = evidence.details.split('; ');
            points.forEach(point => {
                result += `- ${point}\n`;
            });
        }
        
        if (evidence.trigger) {
            result += `- Found trigger: "${evidence.trigger}"\n`;
        }
        
        // Add subjunctive information
        if (evidence.hasSubjunctive) {
            result += `- Contains subjunctive mood\n`;
            if (evidence.complementClause?.verbInfo) {
                const verbInfo = evidence.complementClause.verbInfo;
                result += `  • Subjunctive verb: "${verbInfo.verb}"\n`;
                if (verbInfo.isSpecificMatch) {
                    result += `  • Specific form: ${verbInfo.type}\n`;
                }
            }
        }
        
        // Add clause structure information
        if (evidence.mainClause?.isComplete) {
            result += `- Complete main clause structure\n`;
        }
        if (evidence.relationship?.hasProperSequence) {
            result += `- Proper temporal sequence\n`;
        }
        
        // Add ne position information if available
        if (evidence.nePosition !== null) {
            result += `\nRecommended ne position:\n`;
            result += `- Word position: ${evidence.nePosition}\n`;
            if (evidence.position?.isValidPosition) {
                result += `- Valid position between subject and verb\n`;
            }
        }

        // Add proposed sentence if available
        if (evidence.proposedSentence) {
            result += `\nProposed sentence:\n"${evidence.proposedSentence}"\n`;
        }
    }
    
    return result;
};

export const formatHybridResult = (analysis, llmAnalysis) => {
    const { confidence } = analysis;
    const confidencePercent = Math.round(confidence * 100);
    
    let result = `CroissantLLM Analysis (${confidencePercent}% confidence)\n\n`;
    
    result += `LLM Classification: ${llmAnalysis.classification}\n`;
    
    if (llmAnalysis.confidence) {
        result += `Model Confidence: ${Math.round(llmAnalysis.confidence * 100)}%\n`;
    }

    if (llmAnalysis.trigger) {
        result += `Detected Trigger: "${llmAnalysis.trigger}"\n`;
    }

    if (llmAnalysis.nePosition) {
        result += `Suggested NE Position: ${llmAnalysis.nePosition}\n`;
    }

    if (llmAnalysis.explanation) {
        result += `\nLinguistic Analysis:\n${llmAnalysis.explanation}\n`;
    }

    if (llmAnalysis.patterns) {
        result += '\nDetected Patterns:\n';
        llmAnalysis.patterns.forEach(pattern => {
            result += `- ${pattern}\n`;
        });
    }

    if (llmAnalysis.proposedSentence) {
        result += `\nProposed Sentence:\n"${llmAnalysis.proposedSentence}"\n`;
    }

    return result;
};
