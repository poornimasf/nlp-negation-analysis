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
    
    // Classification and Confidence with explanation
    result += `Classification: ${classification}\n`;
    result += `Should be "${classification}" because:\n`;
    
    // Enhanced linguistic analysis if available
    if (trainingAnalysis?.enhancedAnalysis) {
        const enhanced = trainingAnalysis.enhancedAnalysis;
        
        if (enhanced.trigger) {
            result += `- Has ${enhanced.trigger.category?.toLowerCase() || 'trigger'} trigger "${enhanced.trigger.trigger}"\n`;
        }
        if (enhanced.subjunctive) {
            result += `- Uses subjunctive form: "${enhanced.subjunctive.verb}" (${enhanced.subjunctive.type})\n`;
        }
        if (enhanced.register && enhanced.register.register !== 'NEUTRAL') {
            result += `- Register: ${enhanced.register.register.toLowerCase()} (${Math.round(enhanced.register.confidence * 100)}% confidence)\n`;
        }
        if (enhanced.avantQueAnalysis && enhanced.avantQueAnalysis.isAvantQue) {
            result += `- Enhanced avant que analysis: ${enhanced.avantQueAnalysis.bothConditionsMet ? 'Both conditions met' : 'Conditions not fully met'}\n`;
        }
    } else {
        // Fallback to original analysis
        if (trainingAnalysis?.context?.trigger) {
            result += `- Has ${trainingAnalysis.context.category?.toLowerCase() || 'trigger'} trigger "${trainingAnalysis.context.trigger}"\n`;
        }
        if (analysis.evidence?.hasSubjunctive) {
            result += `- Uses subjunctive form\n`;
        }
        if (trainingAnalysis?.context?.subcategory) {
            result += `- ${getSubcategoryReason(trainingAnalysis.context.subcategory)}\n`;
        }
    }
    result += '\n';
    
    result += `Confidence: ${Math.round(analysis.confidence * 100)}%\n\n`;
    
    // Enhanced Linguistic Analysis Section
    if (trainingAnalysis?.enhancedAnalysis) {
        const enhanced = trainingAnalysis.enhancedAnalysis;
        
        result += 'Enhanced Linguistic Analysis:\n';
        
        // Trigger Analysis
        if (enhanced.trigger) {
            result += `- Trigger: "${enhanced.trigger.trigger}" (${enhanced.trigger.category})\n`;
            if (enhanced.trigger.subcategory) {
                result += `- Subcategory: ${enhanced.trigger.subcategory}\n`;
            }
        }
        
        // Subjunctive Analysis
        if (enhanced.subjunctive) {
            result += `- Subjunctive: "${enhanced.subjunctive.verb}" (${enhanced.subjunctive.type})\n`;
            result += `- Subjunctive Confidence: ${Math.round(enhanced.subjunctive.confidence * 100)}%\n`;
        } else {
            result += `- Subjunctive: Not detected\n`;
        }
        
        // Register Analysis
        if (enhanced.register) {
            result += `- Register: ${enhanced.register.register}\n`;
            if (enhanced.register.features.length > 0) {
                result += `- Register Features: ${enhanced.register.features.join(', ')}\n`;
            }
        }
        
        // Discourse Context
        if (enhanced.discourse && enhanced.discourse.length > 0) {
            result += `- Discourse Context: ${enhanced.discourse.map(d => d.type).join(', ')}\n`;
        }
        
        // Enhanced Avant Que Analysis
        if (enhanced.avantQueAnalysis && enhanced.avantQueAnalysis.isAvantQue) {
            result += '\nEnhanced Avant Que Analysis:\n';
            result += `- Complement Clause: ${enhanced.avantQueAnalysis.complementClause.isComplementClause ? 'Present' : 'Absent'} (${Math.round(enhanced.avantQueAnalysis.complementClause.confidence * 100)}% confidence)\n`;
            result += `- Subjunctive Mood: ${enhanced.avantQueAnalysis.subjunctiveMood.hasSubjunctive ? 'Present' : 'Absent'} (${Math.round(enhanced.avantQueAnalysis.subjunctiveMood.confidence * 100)}% confidence)\n`;
            result += `- Both Conditions Met: ${enhanced.avantQueAnalysis.bothConditionsMet ? 'Yes' : 'No'}\n`;
            result += `- Reasoning: ${enhanced.avantQueAnalysis.classificationReason}\n`;
        }
        
        // Ambiguity Analysis
        if (enhanced.ambiguityAnalysis) {
            result += '\nAmbiguity Analysis:\n';
            result += `- Ambiguity Detected: ${enhanced.ambiguityAnalysis.hasAmbiguity ? 'Yes' : 'No'}\n`;
            if (enhanced.ambiguityAnalysis.hasAmbiguity) {
                result += `- Ambiguity Score: ${Math.round(enhanced.ambiguityAnalysis.ambiguityScore * 100)}%\n`;
                result += `- Clarification Needed: ${enhanced.ambiguityAnalysis.clarificationNeeded ? 'Yes' : 'No'}\n`;
                result += `- Recommendation: ${enhanced.ambiguityAnalysis.recommendation}\n`;
                if (enhanced.ambiguityAnalysis.detectedAmbiguities.length > 0) {
                    result += `- Ambiguity Types: ${enhanced.ambiguityAnalysis.detectedAmbiguities.map(a => a.type).join(', ')}\n`;
                }
            }
        }
        
        // Multiple Negation Analysis
        if (enhanced.negationAnalysis) {
            result += '\nMultiple Negation Analysis:\n';
            result += `- Multiple Negation: ${enhanced.negationAnalysis.hasMultipleNegation ? 'Yes' : 'No'}\n`;
            if (enhanced.negationAnalysis.hasMultipleNegation) {
                result += `- Negation Type: ${enhanced.negationAnalysis.negationType}\n`;
                result += `- Confidence: ${Math.round(enhanced.negationAnalysis.confidence * 100)}%\n`;
                result += `- Is Expletive Context: ${enhanced.negationAnalysis.isExpletiveContext ? 'Yes' : 'No'}\n`;
                result += `- Is Logical Negation: ${enhanced.negationAnalysis.isLogicalNegation ? 'Yes' : 'No'}\n`;
                result += `- Recommendation: ${enhanced.negationAnalysis.recommendation}\n`;
            }
        }
        
        // Vowel Context Analysis
        if (enhanced.vowelContext) {
            result += '\nVowel Context Analysis:\n';
            result += `- Surface Form: ${enhanced.vowelContext.form}\n`;
            result += `- Reason: ${enhanced.vowelContext.reason}\n`;
            if (enhanced.vowelContext.nextWord) {
                result += `- Following Word: "${enhanced.vowelContext.nextWord}"\n`;
            }
        }
        
        // Combined Analysis Summary
        if (enhanced.combinedAnalysis) {
            result += '\nCombined Analysis Summary:\n';
            result += `- Overall Recommendation: ${enhanced.combinedAnalysis.recommendation}\n`;
            result += `- Expletive Likelihood: ${Math.round(enhanced.combinedAnalysis.expletiveLikelihood * 100)}%\n`;
            if (enhanced.combinedAnalysis.factors.length > 0) {
                result += `- Contributing Factors:\n`;
                enhanced.combinedAnalysis.factors.forEach(factor => {
                    result += `  • ${factor}\n`;
                });
            }
        }
        
        result += '\n';
    } else {
        // Standard Trigger Analysis
        result += 'Trigger Analysis:\n';
        if (trainingAnalysis?.context?.trigger) {
            const trigger = trainingAnalysis.context.trigger;
            const category = trainingAnalysis.context.category;
            const subcategory = trainingAnalysis.context.subcategory;
            
            result += `- Found: "${trigger}"\n`;
            if (category) {
                result += `- Category: ${category}\n`;
            }
            
            // Add subcategory for avant que
            if (category === 'TEMPORAL' && trigger.includes('avant')) {
                result += `- Subcategory: ${subcategory || 'DEFAULT'}\n`;
                result += `- Usage: ${getAvantQueUsageDescription(subcategory)}\n`;
            }
        } else {
            result += '- No trigger found\n';
        }
        result += '\n';
    }
    
    // Best Match Example
    if (trainingAnalysis?.matches?.length > 0) {
        const bestMatch = trainingAnalysis.matches[0];
        result += 'Best Match:\n';
        result += `- Example: "${bestMatch.text}"\n`;
        result += `- Similarity: ${Math.round(bestMatch.similarity * 100)}%\n`;
        result += `- Example's Classification: ${bestMatch.has_expletive_ne ? 'Expletive' : 'No Expletive'}\n`;
        
        // Enhanced similarity features
        if (bestMatch.features) {
            const features = [];
            if (bestMatch.features.triggerMatch) features.push('trigger match');
            if (bestMatch.features.subjunctiveMatch) features.push('subjunctive match');
            if (bestMatch.features.registerMatch) features.push('register match');
            if (bestMatch.features.avantQueEnhanced) features.push('avant que enhanced');
            
            if (features.length > 0) {
                result += `- Matching Features: ${features.join(', ')}\n`;
            }
        }
        
        result += `- Note: This is a similar example but final classification is based on all evidence\n`;
        result += '\n';
    }
    
    // Evidence Summary with enhanced explanation
    if (trainingAnalysis?.message) {
        result += 'Evidence Summary:\n';
        result += `- Found ${trainingAnalysis.matches?.length || 0} similar examples\n`;
        result += `- ${trainingAnalysis.message}\n`;
        
        if (trainingAnalysis.enhancedVotes || trainingAnalysis.weightedVotes) {
            const weights = trainingAnalysis.enhancedVotes || trainingAnalysis.weightedVotes;
            const total = weights.expletive + weights.nonExpletive;
            if (total > 0) {
                const expletivePercent = Math.round((weights.expletive / total) * 100);
                result += `- ${expletivePercent}% of similar examples use expletive ne\n`;
                result += `- Based on all evidence, ${classification} is more likely\n`;
            }
        }

        // Add confidence factors
        result += '\nConfidence Factors:\n';
        if (analysis.evidence?.hasSubjunctive || trainingAnalysis?.enhancedAnalysis?.subjunctive) {
            result += '- Well-formed subjunctive structure (indicates proper grammatical form)\n';
        }
        if (trainingAnalysis?.context?.trigger?.includes('avant') || trainingAnalysis?.enhancedAnalysis?.trigger?.trigger?.includes('avant')) {
            result += '- Clear temporal marker (indicates potential for expletive ne)\n';
        }
        if (trainingAnalysis?.nePosition) {
            result += '- Suggested ne position identified (strengthens classification)\n';
        }
        if (trainingAnalysis?.enhancedAnalysis?.register?.register === 'LITERARY') {
            result += '- Literary register detected (increases expletive ne likelihood)\n';
        }
        
        // Add register analysis
        if (trainingAnalysis?.originalText) {
            const text = trainingAnalysis.originalText;
            if (text.includes('dont') || text.includes('autrefois') || 
                text.includes('puis') || text.includes('y')) {
                result += '- Historical/literary register (common context for expletive ne)\n';
            }
        }
    }
    
    // Enhanced Weighted Evidence
    if (trainingAnalysis?.enhancedVotes) {
        const weights = trainingAnalysis.enhancedVotes;
        const total = weights.expletive + weights.nonExpletive;
        if (total > 0) {
            result += '\nEnhanced Confidence Breakdown:\n';
            result += `- Base Expletive: ${Math.round((weights.expletive / total) * 100)}% (from similar examples)\n`;
            result += `- Base Non-expletive: ${Math.round((weights.nonExpletive / total) * 100)}% (from similar examples)\n`;
            
            // Show adjustments if they exist
            if (weights.adjustedExpletive !== undefined && weights.adjustedNonExpletive !== undefined) {
                const adjustedTotal = weights.adjustedExpletive + weights.adjustedNonExpletive;
                if (adjustedTotal > 0) {
                    result += `- Adjusted Expletive: ${Math.round((weights.adjustedExpletive / adjustedTotal) * 100)}% (includes ambiguity/negation factors)\n`;
                    result += `- Adjusted Non-expletive: ${Math.round((weights.adjustedNonExpletive / adjustedTotal) * 100)}% (includes ambiguity/negation factors)\n`;
                    
                    if (weights.ambiguityAdjustment !== undefined) {
                        result += `- Ambiguity/Negation Adjustment: ${weights.ambiguityAdjustment > 0 ? '+' : ''}${Math.round(weights.ambiguityAdjustment * 100)}%\n`;
                    }
                }
            }
            
            result += `- Total Weight: ${weights.totalWeight.toFixed(2)} (includes linguistic feature bonuses)\n`;
        }
    } else if (trainingAnalysis?.weightedVotes) {
        const weights = trainingAnalysis.weightedVotes;
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
