/**
 * Enhanced Semantic Analyzer - Corpus-Driven Classification
 * Addresses the critical overcorrection problem: "avant que + subjunctive" enables but doesn't require expletive
 * 
 * Key Insights from Corpus Analysis:
 * - Syntactic licensing (16%) ≠ actual expletive usage (60%)
 * - Logical strength indicators override syntactic patterns
 * - Semantic and discourse factors are primary determinants
 * - Hierarchy: Logical > Expletive > Syntactic
 */

import { normalizeText } from './textProcessing';

class EnhancedSemanticAnalyzer {
    constructor() {
        // Enhanced logical negation indicators - CRITICAL for addressing 3/10 problem
        this.logicalIndicators = [
            // Standard negation particles (high confidence)
            { pattern: /\bpas\b/i, weight: 3.0, type: 'standard' },
            { pattern: /\bjamais\b/i, weight: 3.0, type: 'standard' },
            { pattern: /\bplus\b(?!\s+que)/i, weight: 3.0, type: 'standard' },
            { pattern: /\bguère\b/i, weight: 3.0, type: 'standard' },
            { pattern: /\bpoint\b/i, weight: 2.5, type: 'standard' },
            
            // Negative quantifiers (medium-high confidence)
            { pattern: /\baucun(?:e)?\b/i, weight: 2.0, type: 'quantifier' },
            { pattern: /\bpersonne\b/i, weight: 2.0, type: 'quantifier' },
            { pattern: /\brien\b/i, weight: 1.5, type: 'quantifier' },
            { pattern: /\bnul(?:le)?\b/i, weight: 2.0, type: 'quantifier' },
            
            // Contextual logical indicators (medium confidence)
            { pattern: /\brefuser|rejeter|nier|contester|s'opposer\b/i, weight: 1.8, type: 'semantic' },
            { pattern: /\binterdire|défendre|prohiber|bannir\b/i, weight: 1.8, type: 'semantic' },
            { pattern: /\béchec|échapper|manquer|rater|louper\b/i, weight: 1.5, type: 'semantic' },
            { pattern: /\babsence|manque|privation|carence\b/i, weight: 1.3, type: 'semantic' },
            
            // Temporal logical contexts (medium confidence)
            { pattern: /\btrop tard|déjà passé|terminé|fini|révolu\b/i, weight: 1.5, type: 'temporal' },
            { pattern: /\bimpossible|irréalisable|inatteignable\b/i, weight: 1.8, type: 'temporal' },
            
            // Comparative logical contexts (lower confidence)
            { pattern: /\bmoins que prévu|insuffisant|inadéquat\b/i, weight: 1.2, type: 'comparative' }
        ];
        
        // Expletive-favoring contexts - what actually indicates expletive usage
        this.expletiveContexts = [
            // Strong emotional anticipation (high confidence)
            { pattern: /\bj'ai peur|je crains|j'appréhende|je redoute\b/i, weight: 2.5, type: 'emotional_strong' },
            { pattern: /\bde peur que|de crainte que|dans la crainte que\b/i, weight: 2.8, type: 'emotional_strong' },
            
            // Medium emotional contexts
            { pattern: /\banxiété|stress|tension|nervosité\b/i, weight: 1.8, type: 'emotional_medium' },
            { pattern: /\bpeur|crainte|inquiétude|angoisse|souci\b/i, weight: 1.5, type: 'emotional_medium' },
            
            // Temporal uncertainty (medium confidence)
            { pattern: /\bavant que.*(?:arrive|vienne|parte)\b/i, weight: 1.8, type: 'temporal_uncertainty' },
            { pattern: /\ben attendant|jusqu'à ce que|le temps que\b/i, weight: 1.6, type: 'temporal_uncertainty' },
            
            // Preventive contexts (medium confidence)
            { pattern: /\bpour éviter que|afin d'éviter que\b/i, weight: 1.7, type: 'preventive' },
            { pattern: /\bempêcher que|prévenir que\b/i, weight: 1.5, type: 'preventive' },
            
            // Impersonal constructions (medium-high confidence)
            { pattern: /\bil s'en faut|peu s'en faut|tant s'en faut\b/i, weight: 2.2, type: 'impersonal' },
            { pattern: /\bil suffit que|il arrive que|il se peut que\b/i, weight: 1.4, type: 'impersonal' }
        ];
        
        // Syntactic licensing patterns - these ENABLE but don't REQUIRE expletive
        this.syntacticTriggers = [
            { pattern: /\bavant\s+que?\b/i, type: 'temporal', enablesExpletive: true },
            { pattern: /\bà\s+moins\s+que?\b/i, type: 'temporal', enablesExpletive: true },
            { pattern: /\ben\s+attendant\s+que?\b/i, type: 'temporal', enablesExpletive: true },
            { pattern: /\bjusqu'à\s+ce\s+que?\b/i, type: 'temporal', enablesExpletive: true },
            { pattern: /\bpeur\s+que?\b/i, type: 'emotional', enablesExpletive: true },
            { pattern: /\bcraindre\s+que?\b/i, type: 'emotional', enablesExpletive: true }
        ];
        
        // DISCOURSE ANALYSIS COMPONENTS
        
        // Register markers - influence expletive usage patterns
        this.registerMarkers = {
            formal: { 
                pattern: /\bveuillez|prière|monsieur|madame|néanmoins|toutefois|cependant|par conséquent|en effet\b/i, 
                expletiveBias: 0.15  // Formal registers slightly favor expletive
            },
            informal: { 
                pattern: /\bbon|ben|ouais|super|génial|cool|allez|vas-y\b/i, 
                expletiveBias: -0.1  // Informal registers slightly disfavor expletive
            },
            literary: { 
                pattern: /\bainsi|certes|naguère|jadis|désormais|nonobstant|néanmoins|toutefois\b/i, 
                expletiveBias: 0.2   // Literary registers favor expletive
            },
            technical: { 
                pattern: /\bprocessus|système|méthode|procédure|protocole|algorithme|fonction\b/i, 
                expletiveBias: 0.05  // Technical registers neutral-slight expletive
            },
            administrative: {
                pattern: /\bautorisation|validation|approbation|conformément|selon|aux termes de\b/i,
                expletiveBias: -0.1  // Administrative contexts often logical
            }
        };
        
        // Stance markers - speaker attitude affects expletive usage
        this.stanceMarkers = {
            assertive: { 
                pattern: /\bcertainement|assurément|indubitablement|évidemment|sans aucun doute\b/i, 
                expletiveBias: -0.1  // Assertive stance slightly disfavors expletive
            },
            tentative: { 
                pattern: /\bpeut-être|probablement|sans doute|apparemment|il semble que\b/i, 
                expletiveBias: 0.15  // Tentative stance favors expletive
            },
            emphatic: { 
                pattern: /\bvraiment|absolument|complètement|totalement|extrêmement\b/i, 
                expletiveBias: -0.05 // Emphatic stance slightly disfavors expletive
            },
            hedged: { 
                pattern: /\bplutôt|assez|quelque peu|relativement|en quelque sorte\b/i, 
                expletiveBias: 0.1   // Hedged stance favors expletive
            },
            polite: {
                pattern: /\bs'il vous plaît|je vous prie|auriez-vous|pourriez-vous\b/i,
                expletiveBias: 0.12  // Politeness favors expletive
            }
        };
        
        // Pragmatic context factors
        this.pragmaticFactors = {
            question: { expletiveBias: 0.1 },      // Questions favor expletive
            exclamation: { expletiveBias: -0.05 }, // Exclamations slightly disfavor
            imperative: { expletiveBias: -0.1 },   // Commands disfavor expletive
            directAddress: { expletiveBias: 0.08 }, // Direct address favors expletive
            longSentence: { expletiveBias: 0.05 },  // Longer sentences favor expletive
            complexSyntax: { expletiveBias: 0.1 }   // Complex syntax favors expletive
        };
    }
    
    /**
     * Main analysis method implementing corpus-driven hierarchy WITH discourse analysis
     * Priority: Logical > Expletive > Syntactic + Discourse modulation
     */
    analyzeSemantics(sentence) {
        const normalizedSentence = normalizeText(sentence.toLowerCase());
        
        // Step 1: Assess logical strength (highest priority)
        const logicalAnalysis = this.assessLogicalStrength(normalizedSentence);
        
        // Step 2: Detect expletive contexts (medium priority)
        const expletiveAnalysis = this.detectExpletiveContext(normalizedSentence);
        
        // Step 3: Check syntactic licensing (lowest priority)
        const syntacticAnalysis = this.checkSyntacticLicensing(normalizedSentence);
        
        // Step 4: DISCOURSE ANALYSIS - NEW!
        const discourseAnalysis = this.analyzeDiscourseFactors(sentence, normalizedSentence);
        
        // Step 5: Detect semantic conflicts
        const conflictAnalysis = this.detectSemanticConflict(logicalAnalysis, expletiveAnalysis, syntacticAnalysis);
        
        // Step 6: Calculate final semantic bias using hierarchy + discourse
        const semanticBias = this.calculateHierarchicalBias(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, conflictAnalysis, discourseAnalysis);
        
        // Step 7: Calculate expletive likelihood on 1-7 scale
        const likelihood = this.calculateExpletiveLikelihood(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, discourseAnalysis, semanticBias);
        
        return {
            logicalAnalysis,
            expletiveAnalysis,
            syntacticAnalysis,
            discourseAnalysis,  // NEW!
            conflictAnalysis,
            semanticBias,
            likelihood,  // NEW!
            classification: this.determineClassification(semanticBias, conflictAnalysis),
            reasoning: this.generateReasoning(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, conflictAnalysis, semanticBias, discourseAnalysis)
        };
    }
    
    /**
     * DISCOURSE ANALYSIS - Analyze register, stance, and pragmatic factors
     */
    analyzeDiscourseFactors(originalSentence, normalizedSentence) {
        const register = this.classifyRegister(normalizedSentence);
        const stance = this.analyzeStance(normalizedSentence);
        const pragmatic = this.analyzePragmaticContext(originalSentence);
        
        // Calculate discourse influence on expletive usage
        const discourseInfluence = this.calculateDiscourseInfluence(register, stance, pragmatic);
        
        return {
            register,
            stance,
            pragmatic,
            discourseInfluence,
            summary: this.summarizeDiscourseFactors(register, stance, pragmatic, discourseInfluence)
        };
    }
    
    /**
     * Classify register (formal, informal, literary, etc.)
     */
    classifyRegister(sentence) {
        const registers = [];
        let totalBias = 0;
        
        for (const [registerType, config] of Object.entries(this.registerMarkers)) {
            if (config.pattern.test(sentence)) {
                registers.push({
                    type: registerType,
                    expletiveBias: config.expletiveBias,
                    confidence: 0.8
                });
                totalBias += config.expletiveBias;
            }
        }
        
        // Default classification based on sentence characteristics
        if (registers.length === 0) {
            if (sentence.length > 100 || /\b(?:néanmoins|cependant|par conséquent)\b/i.test(sentence)) {
                registers.push({ type: 'formal', expletiveBias: 0.1, confidence: 0.5 });
                totalBias += 0.1;
            } else if (/[!?]{2,}/.test(sentence) || /\b(?:super|cool|génial)\b/i.test(sentence)) {
                registers.push({ type: 'informal', expletiveBias: -0.05, confidence: 0.5 });
                totalBias -= 0.05;
            } else {
                registers.push({ type: 'neutral', expletiveBias: 0, confidence: 0.3 });
            }
        }
        
        return {
            registers,
            dominantRegister: registers.length > 0 ? registers[0].type : 'neutral',
            totalBias: totalBias,
            confidence: registers.length > 0 ? Math.max(...registers.map(r => r.confidence)) : 0.3
        };
    }
    
    /**
     * Analyze speaker stance (assertive, tentative, emphatic, etc.)
     */
    analyzeStance(sentence) {
        const stances = [];
        let totalBias = 0;
        
        for (const [stanceType, config] of Object.entries(this.stanceMarkers)) {
            if (config.pattern.test(sentence)) {
                stances.push({
                    type: stanceType,
                    expletiveBias: config.expletiveBias,
                    confidence: 0.7
                });
                totalBias += config.expletiveBias;
            }
        }
        
        // Default stance based on sentence structure
        if (stances.length === 0) {
            if (/[!]{1,}/.test(sentence)) {
                stances.push({ type: 'emphatic', expletiveBias: -0.05, confidence: 0.4 });
                totalBias -= 0.05;
            } else {
                stances.push({ type: 'neutral', expletiveBias: 0, confidence: 0.2 });
            }
        }
        
        return {
            stances,
            dominantStance: stances.length > 0 ? stances[0].type : 'neutral',
            totalBias: totalBias,
            confidence: stances.length > 0 ? Math.max(...stances.map(s => s.confidence)) : 0.2
        };
    }
    
    /**
     * Analyze pragmatic context (questions, imperatives, etc.)
     */
    analyzePragmaticContext(sentence) {
        const factors = [];
        let totalBias = 0;
        
        // Question
        if (/\?/.test(sentence)) {
            factors.push({ type: 'question', expletiveBias: this.pragmaticFactors.question.expletiveBias });
            totalBias += this.pragmaticFactors.question.expletiveBias;
        }
        
        // Exclamation
        if (/!/.test(sentence)) {
            factors.push({ type: 'exclamation', expletiveBias: this.pragmaticFactors.exclamation.expletiveBias });
            totalBias += this.pragmaticFactors.exclamation.expletiveBias;
        }
        
        // Imperative
        if (/\b(faites|allez|venez|prenez|partez|restez)\b/i.test(sentence)) {
            factors.push({ type: 'imperative', expletiveBias: this.pragmaticFactors.imperative.expletiveBias });
            totalBias += this.pragmaticFactors.imperative.expletiveBias;
        }
        
        // Direct address
        if (/\bvous\b/i.test(sentence)) {
            factors.push({ type: 'directAddress', expletiveBias: this.pragmaticFactors.directAddress.expletiveBias });
            totalBias += this.pragmaticFactors.directAddress.expletiveBias;
        }
        
        // Sentence length
        if (sentence.length > 80) {
            factors.push({ type: 'longSentence', expletiveBias: this.pragmaticFactors.longSentence.expletiveBias });
            totalBias += this.pragmaticFactors.longSentence.expletiveBias;
        }
        
        // Complex syntax (multiple clauses)
        const clauseCount = (sentence.match(/\bque\b/gi) || []).length;
        if (clauseCount > 1) {
            factors.push({ type: 'complexSyntax', expletiveBias: this.pragmaticFactors.complexSyntax.expletiveBias });
            totalBias += this.pragmaticFactors.complexSyntax.expletiveBias;
        }
        
        return {
            factors,
            totalBias,
            sentenceLength: sentence.length,
            wordCount: sentence.split(/\s+/).length,
            clauseCount,
            complexity: clauseCount > 1 ? 'high' : sentence.length > 50 ? 'medium' : 'low'
        };
    }
    
    /**
     * Calculate overall discourse influence
     */
    calculateDiscourseInfluence(register, stance, pragmatic) {
        const totalBias = register.totalBias + stance.totalBias + pragmatic.totalBias;
        const confidence = (register.confidence + stance.confidence) / 2;
        
        return {
            totalBias,
            confidence,
            strength: Math.abs(totalBias) > 0.2 ? 'strong' : Math.abs(totalBias) > 0.1 ? 'medium' : 'weak',
            direction: totalBias > 0 ? 'expletive' : totalBias < 0 ? 'logical' : 'neutral'
        };
    }
    
    /**
     * Summarize discourse factors for human understanding
     */
    summarizeDiscourseFactors(register, stance, pragmatic, influence) {
        const summary = [];
        
        if (register.dominantRegister !== 'neutral') {
            summary.push(`Register: ${register.dominantRegister}`);
        }
        
        if (stance.dominantStance !== 'neutral') {
            summary.push(`Stance: ${stance.dominantStance}`);
        }
        
        if (pragmatic.factors.length > 0) {
            summary.push(`Pragmatic: ${pragmatic.factors.map(f => f.type).join(', ')}`);
        }
        
        if (influence.strength !== 'weak') {
            summary.push(`Discourse influence: ${influence.strength} ${influence.direction}`);
        }
        
        return summary.length > 0 ? summary.join(' | ') : 'Neutral discourse context';
    }
    
    /**
     * Assess logical negation strength - addresses the 3/10 accuracy problem
     */
    assessLogicalStrength(sentence) {
        let totalScore = 0;
        const indicators = [];
        
        for (const indicator of this.logicalIndicators) {
            const matches = sentence.match(indicator.pattern);
            if (matches) {
                totalScore += indicator.weight * matches.length;
                indicators.push({
                    indicator: matches[0],
                    type: indicator.type,
                    weight: indicator.weight,
                    matches: matches.length
                });
            }
        }
        
        // Special boost for compound logical patterns
        if (/\bne.*(?:pas|jamais|plus|guère|point)\b/i.test(sentence)) {
            totalScore += 2.0; // Strong compound logical pattern
            indicators.push({
                indicator: 'compound_logical_pattern',
                type: 'compound',
                weight: 2.0,
                matches: 1
            });
        }
        
        const level = totalScore > 3.0 ? 'strong' : totalScore > 1.0 ? 'medium' : totalScore > 0 ? 'weak' : 'none';
        
        return {
            score: totalScore,
            level,
            indicators,
            overridesExpletive: level === 'strong' || totalScore > 2.5
        };
    }
    
    /**
     * Detect contexts that specifically favor expletive usage
     */
    detectExpletiveContext(sentence) {
        let totalScore = 0;
        const contexts = [];
        
        for (const context of this.expletiveContexts) {
            const matches = sentence.match(context.pattern);
            if (matches) {
                totalScore += context.weight * matches.length;
                contexts.push({
                    context: matches[0],
                    type: context.type,
                    weight: context.weight,
                    matches: matches.length
                });
            }
        }
        
        const strength = totalScore > 2.5 ? 'strong' : totalScore > 1.5 ? 'medium' : totalScore > 0 ? 'weak' : 'none';
        
        return {
            score: totalScore,
            strength,
            contexts,
            favorsExpletive: totalScore > 1.0
        };
    }
    
    /**
     * Check syntactic licensing - enables but doesn't require expletive
     */
    checkSyntacticLicensing(sentence) {
        const triggers = [];
        let hasLicensing = false;
        
        for (const trigger of this.syntacticTriggers) {
            const matches = sentence.match(trigger.pattern);
            if (matches) {
                hasLicensing = true;
                triggers.push({
                    trigger: matches[0],
                    type: trigger.type,
                    enablesExpletive: trigger.enablesExpletive,
                    position: matches.index
                });
            }
        }
        
        return {
            hasLicensing,
            triggers,
            // CRITICAL: Syntactic licensing alone is NOT sufficient for expletive classification
            isDecisive: false,
            note: 'Syntactic licensing enables but does not require expletive usage'
        };
    }
    
    /**
     * Detect conflicts between different types of evidence
     */
    detectSemanticConflict(logicalAnalysis, expletiveAnalysis, syntacticAnalysis) {
        const hasLogical = logicalAnalysis.score > 0;
        const hasExpletive = expletiveAnalysis.score > 0;
        const hasSyntactic = syntacticAnalysis.hasLicensing;
        
        const conflictTypes = [];
        
        // Strong logical vs expletive conflict
        if (logicalAnalysis.level === 'strong' && expletiveAnalysis.strength === 'strong') {
            conflictTypes.push('strong_logical_vs_expletive');
        }
        
        // Medium conflicts
        if (hasLogical && hasExpletive && logicalAnalysis.score > expletiveAnalysis.score) {
            conflictTypes.push('logical_dominates_expletive');
        }
        
        // Syntactic licensing without semantic support
        if (hasSyntactic && !hasExpletive && !hasLogical) {
            conflictTypes.push('syntactic_only_no_semantic');
        }
        
        return {
            hasConflict: conflictTypes.length > 0,
            conflictTypes,
            resolution: this.resolveConflicts(conflictTypes, logicalAnalysis, expletiveAnalysis, syntacticAnalysis)
        };
    }
    
    /**
     * Resolve conflicts using corpus-driven hierarchy
     */
    resolveConflicts(conflictTypes, logicalAnalysis, expletiveAnalysis, syntacticAnalysis) {
        // Hierarchy: Logical > Expletive > Syntactic
        
        if (logicalAnalysis.overridesExpletive) {
            return {
                winner: 'logical',
                confidence: 0.9,
                reasoning: 'Strong logical indicators override expletive contexts'
            };
        }
        
        if (expletiveAnalysis.favorsExpletive && logicalAnalysis.level === 'weak') {
            return {
                winner: 'expletive',
                confidence: 0.75,
                reasoning: 'Expletive context with weak logical opposition'
            };
        }
        
        if (syntacticAnalysis.hasLicensing && !expletiveAnalysis.favorsExpletive && logicalAnalysis.level === 'none') {
            return {
                winner: 'syntactic_neutral',
                confidence: 0.5,
                reasoning: 'Syntactic licensing without semantic bias - ambiguous case'
            };
        }
        
        return {
            winner: 'ambiguous',
            confidence: 0.3,
            reasoning: 'Multiple conflicting signals - requires human judgment'
        };
    }
    
    /**
     * Calculate semantic bias using hierarchical approach + discourse modulation
     */
    calculateHierarchicalBias(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, conflictAnalysis, discourseAnalysis) {
        let bias = 0;
        
        // PRIORITY 1: Logical indicators (addresses overcorrection)
        if (logicalAnalysis.level === 'strong') {
            bias -= 0.8; // Very strong favor logical
        } else if (logicalAnalysis.level === 'medium') {
            bias -= 0.5; // Medium favor logical
        } else if (logicalAnalysis.level === 'weak') {
            bias -= 0.2; // Slight favor logical
        }
        
        // PRIORITY 2: Expletive contexts (only if logical is not strong)
        if (!logicalAnalysis.overridesExpletive) {
            if (expletiveAnalysis.strength === 'strong') {
                bias += 0.6;
            } else if (expletiveAnalysis.strength === 'medium') {
                bias += 0.3;
            } else if (expletiveAnalysis.strength === 'weak') {
                bias += 0.1;
            }
        }
        
        // PRIORITY 3: Syntactic licensing (minimal influence)
        if (syntacticAnalysis.hasLicensing && logicalAnalysis.level === 'none' && expletiveAnalysis.strength === 'none') {
            bias += 0.05; // Very slight favor expletive for pure syntactic cases
        }
        
        // PRIORITY 4: DISCOURSE MODULATION - NEW!
        if (discourseAnalysis && discourseAnalysis.discourseInfluence) {
            const discourseInfluence = discourseAnalysis.discourseInfluence;
            
            // Apply discourse influence but don't override strong logical/expletive signals
            if (Math.abs(bias) < 0.4) { // Only apply if no strong semantic bias
                bias += discourseInfluence.totalBias * discourseInfluence.confidence;
            } else {
                // Weak discourse modulation even for strong semantic signals
                bias += discourseInfluence.totalBias * 0.3;
            }
        }
        
        // Conflict resolution adjustment
        if (conflictAnalysis.hasConflict && conflictAnalysis.resolution.winner === 'logical') {
            bias = Math.min(bias, -0.3); // Ensure logical wins
        }
        
        return Math.max(-1, Math.min(1, bias));
    }
    
    /**
     * Determine final classification based on semantic bias
     */
    determineClassification(semanticBias, conflictAnalysis) {
        if (semanticBias < -0.3) {
            return {
                prediction: 'logical',
                confidence: Math.abs(semanticBias),
                certainty: 'high'
            };
        } else if (semanticBias > 0.3) {
            return {
                prediction: 'expletive',
                confidence: semanticBias,
                certainty: 'high'
            };
        } else if (conflictAnalysis.hasConflict) {
            return {
                prediction: conflictAnalysis.resolution.winner === 'logical' ? 'logical' : 'expletive',
                confidence: conflictAnalysis.resolution.confidence,
                certainty: 'medium'
            };
        } else {
            return {
                prediction: semanticBias < 0 ? 'logical' : 'expletive',
                confidence: Math.abs(semanticBias),
                certainty: 'low'
            };
        }
    }
    
    /**
     * Calculate expletive likelihood on 1-7 Likert scale
     * 1 = Highly Unlikely, 4 = Neutral/Optional, 7 = Highly Likely
     */
    calculateExpletiveLikelihood(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, discourseAnalysis, semanticBias) {
        let score = 4; // Start at neutral (both forms acceptable)
        
        // Strong logical indicators override everything (1-2 range)
        if (logicalAnalysis.overridesExpletive) {
            return logicalAnalysis.level === 'high' ? 1 : 2;
        }
        
        // Semantic bias adjustment (-3 to +3)
        if (semanticBias > 0.4) {
            score += 2; // Strong expletive context
        } else if (semanticBias > 0.2) {
            score += 1; // Moderate expletive context
        } else if (semanticBias < -0.2) {
            score -= 1; // Moderate logical tendency
        } else if (semanticBias < -0.4) {
            score -= 2; // Strong logical tendency
        }
        
        // Discourse factor adjustments
        if (discourseAnalysis.discourseInfluence) {
            const influence = discourseAnalysis.discourseInfluence;
            if (influence.strength === 'strong') {
                score += influence.direction === 'expletive' ? 1 : -1;
            } else if (influence.strength === 'medium') {
                score += influence.direction === 'expletive' ? 0.5 : -0.5;
            }
        }
        
        // Syntactic licensing provides baseline opportunity
        if (syntacticAnalysis.hasLicensing) {
            // Already accounted for in baseline score of 4
        } else {
            score -= 1; // No syntactic licensing makes expletive less likely
        }
        
        // Ensure score stays within 1-7 range
        return Math.max(1, Math.min(7, Math.round(score)));
    }

    /**
     * Generate human-readable reasoning including discourse factors
     */
    generateReasoning(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, conflictAnalysis, semanticBias, discourseAnalysis) {
        const reasons = [];
        
        // Logical analysis
        if (logicalAnalysis.level !== 'none') {
            reasons.push(`Logical strength: ${logicalAnalysis.level} (score: ${logicalAnalysis.score.toFixed(1)})`);
            if (logicalAnalysis.indicators.length > 0) {
                const indicators = logicalAnalysis.indicators.map(i => i.indicator).join(', ');
                reasons.push(`Logical indicators: ${indicators}`);
            }
        }
        
        // Expletive analysis
        if (expletiveAnalysis.strength !== 'none') {
            reasons.push(`Expletive context: ${expletiveAnalysis.strength} (score: ${expletiveAnalysis.score.toFixed(1)})`);
            if (expletiveAnalysis.contexts.length > 0) {
                const contexts = expletiveAnalysis.contexts.map(c => c.context).join(', ');
                reasons.push(`Expletive contexts: ${contexts}`);
            }
        }
        
        // Syntactic analysis
        if (syntacticAnalysis.hasLicensing) {
            const triggers = syntacticAnalysis.triggers.map(t => t.trigger).join(', ');
            reasons.push(`Syntactic licensing: ${triggers} (enables but doesn't require expletive)`);
        }
        
        // DISCOURSE ANALYSIS - NEW!
        if (discourseAnalysis && discourseAnalysis.summary !== 'Neutral discourse context') {
            reasons.push(`Discourse: ${discourseAnalysis.summary}`);
            
            if (discourseAnalysis.discourseInfluence.strength !== 'weak') {
                const influence = discourseAnalysis.discourseInfluence;
                reasons.push(`Discourse influence: ${influence.strength} ${influence.direction} (${influence.totalBias > 0 ? '+' : ''}${influence.totalBias.toFixed(2)})`);
            }
        }
        
        // Conflict resolution
        if (conflictAnalysis.hasConflict) {
            reasons.push(`Conflict resolution: ${conflictAnalysis.resolution.reasoning}`);
        }
        
        // Final bias
        reasons.push(`Final semantic bias: ${semanticBias.toFixed(2)} (${semanticBias < 0 ? 'favors logical' : 'favors expletive'})`);
        
        return reasons.join(' | ');
    }
}

export { EnhancedSemanticAnalyzer };
