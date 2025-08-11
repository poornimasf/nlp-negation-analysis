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
// Helper functions to translate technical analysis to plain language
function getEnhancementDescription(correctionApplied) {
    const descriptions = {
        'semantic_enhancement': 'Context and meaning analysis applied',
        'logical_override': 'Strong logical negation detected and applied',
        'conflict_resolution_logical': 'Conflicting signals resolved in favor of logical negation',
        'conflict_resolution_expletive': 'Conflicting signals resolved in favor of expletive usage',
        'semantic_bias_logical': 'Context strongly suggests logical negation',
        'semantic_bias_expletive': 'Context strongly suggests expletive usage',
        'ambiguous_case': 'Multiple interpretations possible, using traditional analysis',
        'overcorrection_adjustment': 'Prevented common grammar overcorrection',
        'discourse_bias_expletive': 'Formal/polite context favors expletive usage',
        'discourse_bias_logical': 'Informal/direct context favors logical negation',
        'formal_politeness_context': 'Formal politeness context detected - expletive usage appropriate'
    };
    return descriptions[correctionApplied] || 'Advanced linguistic analysis applied';
}

function translateReasoningToPlainLanguage(reasoning) {
    return reasoning
        .replace(/TRADITIONAL \+ SEMANTIC:/g, 'Grammar rules combined with context analysis:')
        .replace(/Rule-based/g, 'Standard French grammar rules')
        .replace(/Discourse:/g, 'Language style:')
        .replace(/Stance:/g, 'Speaker attitude:')
        .replace(/Pragmatic:/g, 'Sentence type:')
        .replace(/question, directAddress/g, 'polite question directed at someone')
        .replace(/Discourse influence: strong expletive/g, 'Context strongly suggests expletive "ne" usage')
        .replace(/Final semantic bias: ([\d.]+) \(favors expletive\)/g, 'Overall tendency: slightly favors expletive "ne" (+$1)')
        .replace(/Final semantic bias: ([-\d.]+) \(favors logical\)/g, 'Overall tendency: favors logical negation ($1)');
}

function getRegisterDescription(registerType) {
    const descriptions = {
        'formal': 'Formal/polite language (like business or academic writing)',
        'informal': 'Casual/everyday language',
        'literary': 'Literary/sophisticated language (like in books)',
        'technical': 'Technical/specialized language',
        'administrative': 'Official/bureaucratic language'
    };
    return descriptions[registerType] || registerType;
}

function getStanceDescription(stanceType) {
    const descriptions = {
        'polite': 'Polite and respectful tone',
        'assertive': 'Direct and confident tone',
        'tentative': 'Uncertain or hesitant tone',
        'emphatic': 'Strong and emphatic tone'
    };
    return descriptions[stanceType] || stanceType;
}

function getPragmaticDescription(factors) {
    const descriptions = {
        'question': 'Question',
        'directAddress': 'Speaking directly to someone',
        'imperative': 'Command or instruction',
        'exclamation': 'Exclamation',
        'complexSyntax': 'Complex sentence structure'
    };
    return factors.map(factor => descriptions[factor] || factor).join(', ');
}

function translateDiscourseInfluence(summary) {
    return summary
        .replace(/strong expletive/g, 'strongly suggests using expletive "ne"')
        .replace(/weak expletive/g, 'slightly suggests using expletive "ne"')
        .replace(/strong logical/g, 'strongly suggests logical negation')
        .replace(/weak logical/g, 'slightly suggests logical negation');
}

function getClassificationDescription(prediction) {
    return prediction === 'expletive' ? 'Expletive "ne" is appropriate' : 'Logical negation (no expletive "ne")';
}

function getCertaintyDescription(certainty) {
    const descriptions = {
        'high': 'Very confident',
        'medium': 'Moderately confident', 
        'low': 'Less confident (multiple interpretations possible)'
    };
    return descriptions[certainty] || certainty;
}

function getBiasDescription(bias) {
    if (bias > 0.3) return 'Strongly favors expletive "ne"';
    if (bias > 0.1) return 'Slightly favors expletive "ne"';
    if (bias < -0.3) return 'Strongly favors logical negation';
    if (bias < -0.1) return 'Slightly favors logical negation';
    return 'Neutral (no strong preference)';
}

function getLogicalStrengthDescription(level) {
    const descriptions = {
        'strong': 'Strong logical negation detected',
        'medium': 'Moderate logical negation detected',
        'weak': 'Weak logical negation detected'
    };
    return descriptions[level] || level;
}

function getExpletiveStrengthDescription(strength) {
    const descriptions = {
        'strong': 'Strong expletive context detected',
        'medium': 'Moderate expletive context detected', 
        'weak': 'Weak expletive context detected'
    };
    return descriptions[strength] || strength;
}

function getExpletiveContextDescription(contexts) {
    const descriptions = {
        'emotional': 'Emotional context (fear, worry, etc.)',
        'temporal': 'Time-related uncertainty',
        'preventive': 'Preventing something from happening',
        'impersonal': 'Impersonal expression'
    };
    return contexts.map(context => descriptions[context] || context).join(', ');
}

function translateSyntacticNote(note) {
    return note
        .replace(/Syntactic licensing enables but does not require expletive usage/g, 
                'Grammar allows expletive "ne" but doesn\'t require it')
        .replace(/No syntactic licensing found/g, 
                'No grammar pattern that typically uses expletive "ne"');
}

function getConflictTypeDescription(conflictTypes) {
    const descriptions = {
        'logical_vs_expletive': 'Logical negation vs. expletive usage',
        'syntactic_vs_semantic': 'Grammar rules vs. context meaning',
        'discourse_conflict': 'Conflicting style/context signals'
    };
    return conflictTypes.map(type => descriptions[type] || type).join(', ');
}

function getResolutionDescription(resolution) {
    const winner = resolution.winner === 'logical' ? 'logical negation' : 'expletive usage';
    return `${winner} chosen based on stronger evidence`;
}

function explainFinalDecision(analysis, semanticAnalysis) {
    let explanation = '';
    const { prediction, confidence, correctionApplied } = analysis;
    const semanticBias = semanticAnalysis?.semanticBias || 0;
    const semanticConfidence = semanticAnalysis?.classification?.confidence || 0;
    const hasLicensing = semanticAnalysis?.syntacticAnalysis?.hasLicensing || false;
    const logicalOverride = semanticAnalysis?.logicalAnalysis?.overridesExpletive || false;
    
    // Explain the decision process step by step
    explanation += `How we reached "${prediction}":\n\n`;
    
    // Step 1: Check for logical override
    if (logicalOverride) {
        explanation += `1. ✅ LOGICAL OVERRIDE: Strong logical negation words detected\n`;
        explanation += `   → Automatic classification: "No Expletive"\n`;
        explanation += `   → Confidence: High (logical negation takes priority)\n`;
    } else {
        explanation += `1. ❌ No strong logical negation detected\n`;
        explanation += `   → Continue to context analysis...\n`;
    }
    
    // Step 2: Check semantic confidence threshold
    explanation += `\n2. CONFIDENCE THRESHOLD CHECK:\n`;
    explanation += `   → Semantic confidence: ${Math.round(semanticConfidence * 100)}%\n`;
    explanation += `   → Required for expletive: 60%+ confidence\n`;
    
    if (semanticConfidence < 0.6) {
        explanation += `   → ❌ Below threshold - not confident enough for expletive\n`;
    } else {
        explanation += `   → ✅ Above threshold - confident enough for expletive\n`;
    }
    
    // Step 3: Check semantic bias strength
    explanation += `\n3. CONTEXT STRENGTH CHECK:\n`;
    explanation += `   → Semantic bias: ${semanticBias > 0 ? '+' : ''}${semanticBias.toFixed(2)}\n`;
    explanation += `   → Required for expletive: +0.30 or higher\n`;
    
    if (semanticBias >= 0.3) {
        explanation += `   → ✅ Strong expletive context detected\n`;
    } else if (semanticBias > 0) {
        explanation += `   → ⚠️ Weak expletive context (not strong enough)\n`;
    } else {
        explanation += `   → ❌ No expletive context detected\n`;
    }
    
    // Step 4: Check syntactic licensing
    explanation += `\n4. GRAMMAR PATTERN CHECK:\n`;
    explanation += `   → Grammar pattern that requires expletive: ${hasLicensing ? 'Yes' : 'No'}\n`;
    
    if (!hasLicensing) {
        explanation += `   → ❌ No strong grammar requirement for expletive\n`;
    } else {
        explanation += `   → ✅ Grammar pattern supports expletive usage\n`;
    }
    
    // Step 5: Final decision explanation
    explanation += `\n5. 🎯 FINAL DECISION:\n`;
    
    if (logicalOverride) {
        explanation += `   → Result: "No Expletive" (logical override)\n`;
        explanation += `   → Reason: Strong logical negation always takes priority\n`;
    } else if (semanticConfidence >= 0.6 && semanticBias >= 0.3) {
        explanation += `   → Result: "Expletive" (confident + strong context)\n`;
        explanation += `   → Reason: High confidence AND strong expletive context\n`;
    } else if (semanticBias < -0.3) {
        explanation += `   → Result: "No Expletive" (strong logical bias)\n`;
        explanation += `   → Reason: Context strongly suggests logical negation\n`;
    } else {
        explanation += `   → Result: "No Expletive" (conservative default)\n`;
        explanation += `   → Reason: `;
        
        const reasons = [];
        if (semanticConfidence < 0.6) reasons.push('low confidence');
        if (semanticBias < 0.3) reasons.push('weak expletive context');
        if (!hasLicensing) reasons.push('no grammar requirement');
        
        explanation += reasons.join(' + ');
        explanation += `\n   → Conservative approach: only classify as expletive when confident\n`;
    }
    
    // Step 6: Confidence explanation
    explanation += `\n6. 📊 CONFIDENCE CALCULATION:\n`;
    explanation += `   → Base confidence: ${Math.round(analysis.originalConfidence * 100)}% (traditional grammar)\n`;
    
    if (correctionApplied === 'semantic_enhancement') {
        explanation += `   → Semantic adjustment: Applied context analysis\n`;
        explanation += `   → Final confidence: ${Math.round(confidence * 100)}%\n`;
        explanation += `   → Note: Confidence lowered due to uncertainty in context\n`;
    } else {
        explanation += `   → Enhancement: ${getEnhancementDescription(correctionApplied)}\n`;
        explanation += `   → Final confidence: ${Math.round(confidence * 100)}%\n`;
    }
    
    return explanation;
}

function getConfidenceDescription(confidence) {
    if (confidence > 0.8) return 'very confident';
    if (confidence > 0.6) return 'confident';
    if (confidence > 0.4) return 'somewhat confident';
    return 'less confident';
}

export const formatRuleBasedResult = (analysis) => {
    const { type, confidence, evidence, enhancedAvantQue, enhanced, semanticAnalysis, reasoning, correctionApplied } = analysis;
    const confidencePercent = Math.round(confidence * 100);
    
    let result = 'Rule-Based Analysis\n';
    result += '-----------------\n\n';
    
    // Classification and confidence
    result += `Classification: ${type}\n`;
    result += `Confidence: ${confidencePercent}%\n\n`;
    
    // Enhanced corpus-driven analysis (NEW)
    if (enhanced && semanticAnalysis) {
        result += '🧠 Enhanced French Grammar Analysis:\n';
        result += `- Analysis Type: Advanced linguistic analysis\n`;
        result += `- Enhancement Applied: ${getEnhancementDescription(correctionApplied)}\n\n`;
        
        // Semantic reasoning in plain language
        if (reasoning) {
            result += 'Why This Classification:\n';
            result += `- ${translateReasoningToPlainLanguage(reasoning)}\n\n`;
        }
        
        // Discourse Analysis in plain language
        if (semanticAnalysis.discourseAnalysis) {
            const discourse = semanticAnalysis.discourseAnalysis;
            result += 'French Language Context:\n';
            if (discourse.register && discourse.register.type && discourse.register.type !== 'neutral') {
                result += `- Language Style: ${getRegisterDescription(discourse.register.type)} (${getConfidenceDescription(discourse.register.confidence)})\n`;
            }
            if (discourse.stance && discourse.stance.type && discourse.stance.type !== 'neutral') {
                result += `- Speaker Attitude: ${getStanceDescription(discourse.stance.type)} (${getConfidenceDescription(discourse.stance.confidence)})\n`;
            }
            if (discourse.pragmatic && discourse.pragmatic.factors && discourse.pragmatic.factors.length > 0) {
                result += `- Sentence Type: ${getPragmaticDescription(discourse.pragmatic.factors)}\n`;
            }
            if (discourse.discourseInfluence && discourse.discourseInfluence.summary) {
                result += `- Context Effect: ${translateDiscourseInfluence(discourse.discourseInfluence.summary)}\n`;
            }
            result += '\n';
        }
        
        // Semantic Analysis Summary in plain language
        if (semanticAnalysis.classification) {
            result += 'Grammar Analysis Summary:\n';
            result += `- Grammar Suggests: ${getClassificationDescription(semanticAnalysis.classification.prediction)}\n`;
            result += `- Certainty Level: ${getCertaintyDescription(semanticAnalysis.classification.certainty)} (${Math.round(semanticAnalysis.classification.confidence * 100)}%)\n`;
            result += `- Overall Tendency: ${getBiasDescription(semanticAnalysis.semanticBias)}\n\n`;
        }
        
        // Logical Analysis in plain language
        if (semanticAnalysis.logicalAnalysis && semanticAnalysis.logicalAnalysis.level !== 'none') {
            result += 'Logical Negation Check:\n';
            result += `- Strength: ${getLogicalStrengthDescription(semanticAnalysis.logicalAnalysis.level)}\n`;
            if (semanticAnalysis.logicalAnalysis.indicators.length > 0) {
                result += `- Found Words: "${semanticAnalysis.logicalAnalysis.indicators.join('", "')}"\n`;
            }
            result += `- Overrides Expletive: ${semanticAnalysis.logicalAnalysis.overridesExpletive ? 'Yes - strong logical negation detected' : 'No'}\n\n`;
        }
        
        // Expletive Analysis in plain language
        if (semanticAnalysis.expletiveAnalysis && semanticAnalysis.expletiveAnalysis.strength !== 'none') {
            result += 'Expletive Context Check:\n';
            result += `- Context Strength: ${getExpletiveStrengthDescription(semanticAnalysis.expletiveAnalysis.strength)}\n`;
            if (semanticAnalysis.expletiveAnalysis.contexts.length > 0) {
                result += `- Context Types: ${getExpletiveContextDescription(semanticAnalysis.expletiveAnalysis.contexts)}\n`;
            }
            result += `- Supports Expletive "ne": ${semanticAnalysis.expletiveAnalysis.favorsExpletive ? 'Yes' : 'No'}\n\n`;
        }
        
        // Syntactic Analysis in plain language
        if (semanticAnalysis.syntacticAnalysis) {
            result += 'Grammar Structure Check:\n';
            result += `- Has Grammar Pattern: ${semanticAnalysis.syntacticAnalysis.hasLicensing ? 'Yes' : 'No'}\n`;
            if (semanticAnalysis.syntacticAnalysis.triggers.length > 0) {
                result += `- Grammar Patterns: "${semanticAnalysis.syntacticAnalysis.triggers.join('", "')}"\n`;
            }
            result += `- Important Note: ${translateSyntacticNote(semanticAnalysis.syntacticAnalysis.note)}\n\n`;
        }
        
        // Final Decision Logic (NEW - explains the calculation)
        result += '🎯 Final Decision Logic:\n';
        result += explainFinalDecision(analysis, semanticAnalysis);
        result += '\n';
        
        // Conflict Analysis in plain language
        if (semanticAnalysis.conflictAnalysis && semanticAnalysis.conflictAnalysis.hasConflict) {
            result += 'Conflicting Signals Resolution:\n';
            result += `- Conflicting Evidence: Yes\n`;
            result += `- Conflict Types: ${getConflictTypeDescription(semanticAnalysis.conflictAnalysis.conflictTypes)}\n`;
            result += `- Resolution: ${getResolutionDescription(semanticAnalysis.conflictAnalysis.resolution)}\n\n`;
        }
    }
    
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
        
        // NEW: Semantic Context Analysis
        if (enhanced.semanticContext || trainingAnalysis.semanticOverride) {
            result += 'Semantic Context Analysis:\n';
            
            if (trainingAnalysis.semanticOverride) {
                result += `- Semantic Override: Applied\n`;
                result += `- Override Type: ${trainingAnalysis.semanticContext?.type || 'Context detected'}\n`;
                result += `- Override Confidence: ${Math.round((trainingAnalysis.semanticContext?.confidence || trainingAnalysis.confidence) * 100)}%\n`;
                result += `- Override Reasoning: ${trainingAnalysis.semanticContext?.reasoning || trainingAnalysis.reasoning}\n`;
                
                // Show original linguistic analysis that was overridden
                if (trainingAnalysis.originalLinguisticAnalysis) {
                    const original = trainingAnalysis.originalLinguisticAnalysis;
                    result += `- Original Classification: ${original.originalClassification ? 'Expletive' : 'No Expletive'} (overridden)\n`;
                    result += `- Original Confidence: ${Math.round(original.originalConfidence * 100)}%\n`;
                }
            } else if (enhanced.semanticContext) {
                result += `- Context Type: ${enhanced.semanticContext.type}\n`;
                result += `- Context Confidence: ${Math.round(enhanced.semanticContext.confidence * 100)}%\n`;
                result += `- Context Reasoning: ${enhanced.semanticContext.reasoning}\n`;
                result += `- Override Applied: No (confidence below threshold)\n`;
            } else {
                result += `- Semantic Context: No logical negation context detected\n`;
                result += `- Analysis Type: Standard linguistic analysis applied\n`;
            }
            
            result += '\n';
        }
        
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
