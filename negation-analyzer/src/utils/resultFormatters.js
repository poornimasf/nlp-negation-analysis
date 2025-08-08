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
 * Get recommendation text based on negation type
 */
function getRecommendationFromType(negationType) {
    switch (negationType) {
        case 'EXPLETIVE_NEGATION':
            return 'Expletive ne detected - optional semantic marker';
        case 'LOGICAL_NEGATION':
            return 'Logical negation detected - ne is part of standard negation';
        case 'COMPLEX_NEGATION':
            return 'Complex negation pattern - requires careful analysis';
        case 'POLARITY_NEGATION':
            return 'Negative polarity items detected - context-dependent analysis';
        default:
            return 'No specific negation pattern detected';
    }
}

/**
 * Format rule-based analysis results
 */
export const formatRuleBasedResult = (analysis) => {
    const { type, confidence, evidence, enhancedAvantQue } = analysis;
    const confidencePercent = Math.round(confidence * 100);
    
    let result = 'Rule-Based Analysis\n';
    result += '-----------------\n\n';
    
    // Classification and confidence
    result += `Classification: ${type}\n`;
    result += `Confidence: ${confidencePercent}%\n\n`;
    
    // Enhanced avant que analysis (if present)
    if (enhancedAvantQue && enhancedAvantQue.isAvantQue) {
        result += 'Enhanced Avant Que Analysis:\n';
        result += `- Classification: ${enhancedAvantQue.classification}\n`;
        result += `- Confidence: ${Math.round(enhancedAvantQue.confidence * 100)}%\n`;
        result += `- Reasoning: ${enhancedAvantQue.classificationReason}\n\n`;
        
        result += 'Linguistic Analysis:\n';
        result += `- Complement Clause: ${enhancedAvantQue.complementClause.isComplementClause ? 'Present' : 'Absent'} (${Math.round(enhancedAvantQue.complementClause.confidence * 100)}% confidence)\n`;
        result += `- Subjunctive Mood: ${enhancedAvantQue.subjunctiveMood.hasSubjunctive ? 'Present' : 'Absent'} (${Math.round(enhancedAvantQue.subjunctiveMood.confidence * 100)}% confidence)\n`;
        
        if (enhancedAvantQue.complementClause.indicators && enhancedAvantQue.complementClause.indicators.length > 0) {
            result += `- Complement Indicators: ${enhancedAvantQue.complementClause.indicators.join(', ')}\n`;
        }
        
        if (enhancedAvantQue.subjunctiveMood.hasSubjunctive) {
            result += `- Subjunctive Verb: "${enhancedAvantQue.subjunctiveMood.verb}" (${enhancedAvantQue.subjunctiveMood.verbType})\n`;
        }
        
        result += '\nDetailed Reasoning:\n';
        enhancedAvantQue.reasoning.forEach(reason => {
            result += `- ${reason}\n`;
        });
        result += '\n';
    }
    
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
 * Format training data analysis results with enhanced linguistic features
 */
export const formatTrainingResult = (analysis, trainingAnalysis) => {
    let result = 'Training Data Analysis\n';
    result += '-----------------\n\n';
    
    // Use the correct classification property (type from analysisObj)
    const classification = analysis.type || analysis.classification;
    
    // Classification and Confidence
    result += `Classification: ${classification}\n`;
    const confidencePercent = Math.round((trainingAnalysis.confidence || 0) * 100);
    result += `Confidence: ${confidencePercent}%\n\n`;
    
    // Enhanced linguistic analysis if available
    if (trainingAnalysis?.enhancedAnalysis) {
        const enhanced = trainingAnalysis.enhancedAnalysis;
        
        result += 'Enhanced Linguistic Analysis:\n';
        
        // Trigger Analysis
        if (enhanced.trigger) {
            result += `- Trigger: "${enhanced.trigger.trigger}" (${enhanced.trigger.category})\n`;
            if (enhanced.trigger.subcategory && enhanced.trigger.subcategory !== 'DEFAULT') {
                result += `- Subcategory: ${enhanced.trigger.subcategory}\n`;
            }
        }
        
        // Subjunctive Analysis
        if (enhanced.subjunctive) {
            result += `- Subjunctive: "${enhanced.subjunctive.verb}" (${enhanced.subjunctive.type}, ${Math.round(enhanced.subjunctive.confidence * 100)}% confidence)\n`;
        } else {
            result += `- Subjunctive: Not detected\n`;
        }
        
        // Register Analysis (only if not neutral)
        if (enhanced.register && enhanced.register.register !== 'NEUTRAL') {
            result += `- Register: ${enhanced.register.register} (${Math.round(enhanced.register.confidence * 100)}% confidence)\n`;
            if (enhanced.register.features && enhanced.register.features.length > 0) {
                result += `- Register Features: ${enhanced.register.features.join(', ')}\n`;
            }
        }
        
        result += '\n';
        
        // Enhanced Avant Que Analysis
        if (enhanced.avantQueAnalysis && enhanced.avantQueAnalysis.isAvantQue) {
            result += 'Enhanced Avant Que Analysis:\n';
            const avantQue = enhanced.avantQueAnalysis;
            
            result += `- Complement Clause: ${avantQue.complementClause.isComplementClause ? 'Present' : 'Absent'} (${Math.round(avantQue.complementClause.confidence * 100)}% confidence)\n`;
            result += `- Subjunctive Mood: ${avantQue.subjunctiveMood.hasSubjunctive ? 'Present' : 'Absent'} (${Math.round(avantQue.subjunctiveMood.confidence * 100)}% confidence)\n`;
            result += `- Both Conditions Met: ${avantQue.bothConditionsMet ? 'Yes' : 'No'}\n`;
            result += `- Reasoning: ${avantQue.classificationReason}\n\n`;
        }
        
        // Ambiguity Analysis (only if detected)
        if (enhanced.ambiguityAnalysis && enhanced.ambiguityAnalysis.hasAmbiguity) {
            result += 'Ambiguity Analysis:\n';
            result += `- Ambiguity Detected: Yes\n`;
            result += `- Ambiguity Score: ${Math.round(enhanced.ambiguityAnalysis.ambiguityScore * 100)}%\n`;
            result += `- Clarification Needed: ${enhanced.ambiguityAnalysis.clarificationNeeded ? 'Yes' : 'No'}\n`;
            result += `- Recommendation: ${enhanced.ambiguityAnalysis.recommendation}\n`;
            if (enhanced.ambiguityAnalysis.detectedAmbiguities.length > 0) {
                result += `- Ambiguity Types: ${enhanced.ambiguityAnalysis.detectedAmbiguities.map(a => a.type).join(', ')}\n`;
            }
            result += '\n';
        }
        
        // Multiple Negation Analysis
        if (enhanced.negationAnalysis) {
            result += 'Multiple Negation Analysis:\n';
            result += `- Multiple Negation: ${enhanced.negationAnalysis.hasMultipleNegation ? 'Yes' : 'No'}\n`;
            result += `- Negation Type: ${enhanced.negationAnalysis.negationType}\n`;
            if (enhanced.negationAnalysis.hasMultipleNegation) {
                result += `- Confidence: ${Math.round(enhanced.negationAnalysis.confidence * 100)}%\n`;
                result += `- Is Expletive Context: ${enhanced.negationAnalysis.negationType === 'EXPLETIVE_NEGATION' ? 'Yes' : 'No'}\n`;
                result += `- Is Logical Negation: ${enhanced.negationAnalysis.negationType === 'LOGICAL_NEGATION' ? 'Yes' : 'No'}\n`;
                result += `- Recommendation: ${enhanced.negationAnalysis.recommendation || getRecommendationFromType(enhanced.negationAnalysis.negationType)}\n`;
            }
            result += '\n';
        }
        
        // Vowel Context Analysis (if available)
        if (enhanced.vowelContext) {
            result += 'Vowel Context Analysis:\n';
            result += `- Surface Form: ${enhanced.vowelContext.form}\n`;
            result += `- Reason: ${enhanced.vowelContext.reason}\n`;
            if (enhanced.vowelContext.nextWord) {
                result += `- Following Word: "${enhanced.vowelContext.nextWord}"\n`;
            }
            result += '\n';
        }
        
        // Combined Analysis Summary
        if (enhanced.combinedAnalysis) {
            result += 'Combined Analysis Summary:\n';
            result += `- Overall Recommendation: ${enhanced.combinedAnalysis.recommendation}\n`;
            result += `- Expletive Likelihood: ${Math.round(enhanced.combinedAnalysis.expletiveLikelihood * 100)}%\n`;
            if (enhanced.combinedAnalysis.factors && enhanced.combinedAnalysis.factors.length > 0) {
                result += `- Contributing Factors:\n`;
                enhanced.combinedAnalysis.factors.forEach(factor => {
                    result += `  • ${factor}\n`;
                });
            }
            result += '\n';
        }
        
        // Clause Boundary Analysis (if available)
        if (enhanced.clauseInfo && enhanced.clauseInfo.isIsolated) {
            result += 'Clause Boundary Analysis:\n';
            result += `- Isolated Clause: "${enhanced.clauseInfo.clause}"\n`;
            result += `- Analysis Scope: Focused on trigger clause only\n`;
            result += `- Cross-clause Contamination: Prevented\n\n`;
        }
        
    } else {
        // Fallback for non-enhanced analysis
        result += `Should be "${classification}" because:\n`;
        if (analysis.evidence?.details) {
            result += `- ${analysis.evidence.details}\n`;
        }
        result += '\n';
    }
    
    // Enhanced Confidence Breakdown
    if (trainingAnalysis?.enhancedVotes) {
        const weights = trainingAnalysis.enhancedVotes;
        const total = weights.expletive + weights.nonExpletive;
        if (total > 0) {
            result += 'Enhanced Confidence Breakdown:\n';
            result += `- Base Expletive: ${Math.round((weights.expletive / total) * 100)}% (from similar examples)\n`;
            result += `- Base Non-expletive: ${Math.round((weights.nonExpletive / total) * 100)}% (from similar examples)\n`;
            
            // Show adjustments if they exist
            if (weights.adjustedExpletive !== undefined && weights.adjustedNonExpletive !== undefined) {
                const adjustedTotal = weights.adjustedExpletive + weights.adjustedNonExpletive;
                if (adjustedTotal > 0) {
                    result += `- Adjusted Expletive: ${Math.round((weights.adjustedExpletive / adjustedTotal) * 100)}% (includes linguistic rule adjustments)\n`;
                    result += `- Adjusted Non-expletive: ${Math.round((weights.adjustedNonExpletive / adjustedTotal) * 100)}% (includes linguistic rule adjustments)\n`;
                    
                    // Show specific adjustments
                    const baseExpletive = weights.expletive;
                    const adjustment = weights.adjustedExpletive - baseExpletive;
                    if (adjustment > 0) {
                        result += `- Linguistic Rule Boost: +${adjustment.toFixed(1)} (avant que analysis, ambiguity, negation factors)\n`;
                    }
                }
            }
            
            result += `- Total Weight: ${weights.totalWeight.toFixed(2)} (includes linguistic feature bonuses)\n\n`;
        }
    }
    
    // Best Match (if available)
    if (trainingAnalysis?.matches && trainingAnalysis.matches.length > 0) {
        const bestMatch = trainingAnalysis.matches[0];
        result += 'Best Match:\n';
        result += `- Example: "${bestMatch.text}"\n`;
        result += `- Similarity: ${Math.round(bestMatch.similarity * 100)}%\n`;
        result += `- Example's Classification: ${bestMatch.has_expletive_ne ? 'Expletive' : 'No Expletive'}\n`;
        
        if (bestMatch.features) {
            const matchingFeatures = [];
            if (bestMatch.features.triggerMatch) matchingFeatures.push('trigger match');
            if (bestMatch.features.subjunctiveMatch) matchingFeatures.push('subjunctive match');
            if (bestMatch.features.registerMatch) matchingFeatures.push('register match');
            if (bestMatch.features.avantQueEnhanced) matchingFeatures.push('avant que enhanced');
            
            if (matchingFeatures.length > 0) {
                result += `- Matching Features: ${matchingFeatures.join(', ')}\n`;
            }
        }
        
        result += `- Note: Final classification is based on linguistic analysis combined with training examples\n\n`;
    }
    
    // Evidence Summary
    result += 'Evidence Summary:\n';
    result += `- Found ${trainingAnalysis?.matches?.length || 0} similar examples\n`;
    result += `- Enhanced analysis found ${trainingAnalysis?.matches?.length || 0} similar examples. Evidence suggests expletive ne was ${classification === 'Expletive' ? 'likely' : 'unlikely'}\n`;
    
    if (trainingAnalysis?.enhancedAnalysis?.trigger) {
        result += `- Trigger: "${trainingAnalysis.enhancedAnalysis.trigger.trigger}" (${trainingAnalysis.enhancedAnalysis.trigger.category})\n`;
    }
    
    if (trainingAnalysis?.enhancedAnalysis?.subjunctive) {
        result += `- Subjunctive: ${trainingAnalysis.enhancedAnalysis.subjunctive.verb} (${trainingAnalysis.enhancedAnalysis.subjunctive.type}, ${Math.round(trainingAnalysis.enhancedAnalysis.subjunctive.confidence * 100)}% confidence)\n`;
    }
    
    if (trainingAnalysis?.enhancedAnalysis?.avantQueAnalysis?.isAvantQue) {
        result += `- Avant que analysis: ${trainingAnalysis.enhancedAnalysis.avantQueAnalysis.classificationReason}\n`;
    }
    
    if (trainingAnalysis?.enhancedAnalysis?.negationAnalysis) {
        result += `- Negation: ${trainingAnalysis.enhancedAnalysis.negationAnalysis.negationType} (${Math.round(trainingAnalysis.enhancedAnalysis.negationAnalysis.confidence * 100)}% confidence)\n`;
    }
    
    // Final percentage from examples
    if (trainingAnalysis?.matches && trainingAnalysis.matches.length > 0) {
        const expletiveExamples = trainingAnalysis.matches.filter(ex => ex.has_expletive_ne === true).length;
        const totalExamples = trainingAnalysis.matches.length;
        const expletivePercent = Math.round((expletiveExamples / totalExamples) * 100);
        result += `- ${expletivePercent}% of similar examples use expletive ne\n`;
    }
    
    result += `- Based on all evidence, ${classification} is more likely\n\n`;
    
    // Confidence Factors
    result += 'Confidence Factors:\n';
    result += `- Well-formed linguistic structure (indicates proper grammatical analysis)\n`;
    if (trainingAnalysis?.enhancedAnalysis?.trigger) {
        result += `- Clear trigger marker (indicates potential for expletive ne)\n`;
    }
    if (trainingAnalysis?.enhancedAnalysis?.avantQueAnalysis?.bothConditionsMet) {
        result += `- Both avant que conditions met (strong indicator for expletive ne)\n`;
    }
    if (trainingAnalysis?.enhancedAnalysis?.clauseInfo?.isIsolated) {
        result += `- Clause boundary analysis applied (prevents cross-clause contamination)\n`;
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
