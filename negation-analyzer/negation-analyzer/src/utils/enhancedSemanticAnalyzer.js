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
     * Extract the clause containing expletive triggers (avant que, peur que, etc.)
     * This prevents cross-clause logical negation from interfering
     */
    extractExpletiveClause(sentence) {
        const triggerPatterns = [
            { pattern: /\bavant\s+qu[e']?\b/i, name: 'avant que' },
            { pattern: /\bpeur\s+qu[e']?\b/i, name: 'peur que' },
            { pattern: /\bcrainte\s+qu[e']?\b/i, name: 'crainte que' },
            { pattern: /\bde\s+peur\s+qu[e']?\b/i, name: 'de peur que' }
        ];
        
        for (const trigger of triggerPatterns) {
            const match = sentence.match(trigger.pattern);
            if (match) {
                const triggerIndex = match.index;
                
                // IMPROVED APPROACH: Extract only the subordinate clause precisely
                // This prevents cross-clause logical negation from interfering
                let clauseStart = triggerIndex;
                let clauseEnd = sentence.length;
                
                // Look for clause boundaries AFTER the trigger with priority system
                const afterTrigger = sentence.substring(triggerIndex);
                
                const clauseEndPatterns = [
                    // Sentence terminators (highest priority)
                    { pattern: /[.!?]/, priority: 1, name: 'sentence-terminator' },
                    // Semicolons
                    { pattern: /;/, priority: 1, name: 'semicolon' },
                    // Coordinating conjunctions that start new main clauses
                    { pattern: /,\s*(?:mais|et|car|donc|alors|cependant|néanmoins|toutefois|or)\b/i, priority: 2, name: 'coordinating-conjunction' },
                    // New main clause indicators (subject + verb after comma)
                    { pattern: /,\s*(?:le|la|les|il|elle|ils|elles|ce|cette|ces|on|nous|vous|je|tu|[A-Z][a-z]+)\s+(?:a|est|sont|ont|sera|seront|était|étaient|avait|avaient)\b/i, priority: 3, name: 'new-main-clause' }
                ];
                
                let bestPriority = 999;
                let bestPatternName = '';
                
                for (const { pattern, priority, name } of clauseEndPatterns) {
                    const endMatch = afterTrigger.match(pattern);
                    if (endMatch && priority < bestPriority) {
                        bestPriority = priority;
                        bestPatternName = name;
                        clauseEnd = triggerIndex + endMatch.index;
                    }
                }
                
                const clause = sentence.substring(clauseStart, clauseEnd).trim();
                
                return {
                    clause: clause,
                    trigger: trigger.name,
                    triggerIndex: triggerIndex,
                    clauseStart: clauseStart,
                    clauseEnd: clauseEnd,
                    boundaryType: bestPriority === 999 ? 'end-of-sentence' : 'clause-boundary'
                };
            }
        }
        
        return null;
    }

    /**
     * Check if logical negation is in the same clause as the expletive trigger
     */
    isLogicalNegationInSameClause(sentence, expletiveClauseInfo) {
        if (!expletiveClauseInfo) {
            return {
                hasLogicalInClause: false,
                indicators: [],
                clause: null,
                analysis: 'No expletive clause found'
            };
        }
        
        const clause = expletiveClauseInfo.clause;
        const logicalInClause = [];
        
        // Check for logical negation within the expletive clause only
        for (const indicator of this.logicalIndicators) {
            const matches = clause.match(indicator.pattern);
            if (matches) {
                logicalInClause.push({
                    indicator: matches[0],
                    type: indicator.type,
                    weight: indicator.weight,
                    inSameClause: true
                });
            }
        }
        
        return {
            hasLogicalInClause: logicalInClause.length > 0,
            indicators: logicalInClause,
            clause: clause,
            analysis: logicalInClause.length > 0 ? 
                'Logical negation in same clause as expletive trigger' : 
                'No logical negation in expletive clause'
        };
    }

    /**
     * Split text into sentences respecting French punctuation
     */
    splitIntoSentences(text) {
        // Split on sentence-ending punctuation, keeping the punctuation
        const sentences = text.split(/([.!?]+)/).filter(part => part.trim().length > 0);
        
        // Recombine sentences with their punctuation
        const result = [];
        for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i]?.trim();
            const punctuation = sentences[i + 1] || '';
            if (sentence) {
                result.push((sentence + punctuation).trim());
            }
        }
        
        return result.length > 0 ? result : [text]; // Fallback to original if no splits
    }

    /**
     * Find which sentence contains the target construction (avant que, peur que, etc.)
     */
    findTargetSentence(sentences, originalSentence) {
        // Look for expletive trigger patterns to identify the relevant sentence
        const triggerPatterns = [
            /\bavant\s+qu[e']?\b/i,
            /\bpeur\s+qu[e']?\b/i,
            /\bpeu\s+s'en\s+faut\b/i,
            /\bcrainte\s+qu[e']?\b/i,
            /\bde\s+peur\s+qu[e']?\b/i
        ];
        
        for (const sentence of sentences) {
            for (const pattern of triggerPatterns) {
                if (pattern.test(sentence)) {
                    return sentence;
                }
            }
        }
        
        // If no trigger found, return the first sentence (fallback)
        return sentences[0] || originalSentence;
    }
    
    /**
     * Main analysis method implementing corpus-driven hierarchy WITH discourse analysis
     * Priority: Logical > Expletive > Syntactic + Discourse modulation
     */
    analyzeSemantics(sentence) {
        const normalizedSentence = normalizeText(sentence.toLowerCase());
        
        // Step 1: Assess logical strength (highest priority) - PASS ORIGINAL SENTENCE for position accuracy
        const logicalAnalysis = this.assessLogicalStrength(sentence);
        
        // Step 2: Detect expletive contexts (medium priority) - use normalized for pattern matching
        const expletiveAnalysis = this.detectExpletiveContext(normalizedSentence);
        
        // Step 3: Check syntactic licensing (lowest priority) - use normalized for pattern matching
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
     * NOW WITH SENTENCE BOUNDARY DETECTION
     */
    assessLogicalStrength(sentence) {
        // Step 1: Split into sentences
        const sentences = this.splitIntoSentences(sentence);
        
        // Step 2: Find the sentence containing expletive triggers
        const targetSentence = this.findTargetSentence(sentences, sentence);
        
        // Step 3: NEW - Extract the clause containing the expletive trigger
        const expletiveClauseInfo = this.extractExpletiveClause(targetSentence);
        
        // Step 4: ENHANCED - Only analyze logical negation AFTER the expletive trigger
        let totalScore = 0;
        const indicators = [];
        let analysisScope = 'full-sentence';
        
        if (expletiveClauseInfo) {
            // CRITICAL FIX: Only analyze text from the expletive trigger onwards
            // This prevents "ne seront plus" (before "avant que") from interfering
            const triggerPosition = expletiveClauseInfo.triggerIndex;
            const textFromTrigger = targetSentence.substring(triggerPosition);
            
            console.log(`🔍 POSITIONAL BOUNDARY: Analyzing only text from trigger position ${triggerPosition}`);
            console.log(`📍 Text before trigger (IGNORED): "${targetSentence.substring(0, triggerPosition)}"`);
            console.log(`📍 Text from trigger (ANALYZED): "${textFromTrigger}"`);
            
            analysisScope = 'from-trigger';
            
            // Check for logical negation only in the text from trigger onwards
            for (const indicator of this.logicalIndicators) {
                const matches = textFromTrigger.match(indicator.pattern);
                if (matches) {
                    totalScore += indicator.weight * matches.length;
                    indicators.push({
                        indicator: matches[0],
                        type: indicator.type,
                        weight: indicator.weight,
                        matches: matches.length,
                        scope: 'after-trigger',
                        position: triggerPosition + matches.index
                    });
                }
            }
            
            // Special boost for compound logical patterns (only after trigger)
            const compoundPattern = /\bne.*(?:pas|jamais|plus|guère|point)\b/i;
            if (compoundPattern.test(textFromTrigger)) {
                totalScore += 2.0;
                indicators.push({
                    indicator: 'compound_logical_pattern',
                    type: 'compound',
                    weight: 2.0,
                    matches: 1,
                    scope: 'after-trigger'
                });
            }
            
        } else {
            // Fallback: No expletive trigger found, analyze full sentence
            for (const indicator of this.logicalIndicators) {
                const matches = targetSentence.match(indicator.pattern);
                if (matches) {
                    totalScore += indicator.weight * matches.length;
                    indicators.push({
                        indicator: matches[0],
                        type: indicator.type,
                        weight: indicator.weight,
                        matches: matches.length,
                        scope: 'full-sentence',
                        sentence: targetSentence.substring(0, 50) + '...'
                    });
                }
            }
            
            // Special boost for compound logical patterns (full sentence)
            const compoundPattern = /\bne.*(?:pas|jamais|plus|guère|point)\b/i;
            if (compoundPattern.test(targetSentence)) {
                totalScore += 2.0;
                indicators.push({
                    indicator: 'compound_logical_pattern',
                    type: 'compound',
                    weight: 2.0,
                    matches: 1,
                    scope: 'full-sentence'
                });
            }
        }
        
        const level = totalScore > 3.0 ? 'strong' : totalScore > 1.0 ? 'medium' : totalScore > 0 ? 'weak' : 'none';
        
        return {
            score: totalScore,
            level,
            indicators,
            overridesExpletive: level === 'strong' || totalScore > 2.5,
            sentenceBoundary: {
                totalSentences: sentences.length,
                targetSentence: targetSentence.substring(0, 100) + (targetSentence.length > 100 ? '...' : ''),
                analyzedSentenceOnly: sentences.length > 1
            },
            positionalBoundary: {
                hasExpletiveTrigger: expletiveClauseInfo !== null,
                triggerPosition: expletiveClauseInfo ? expletiveClauseInfo.triggerIndex : null,
                analysisScope: analysisScope,
                textAnalyzed: expletiveClauseInfo ? 
                    targetSentence.substring(expletiveClauseInfo.triggerIndex, Math.min(expletiveClauseInfo.triggerIndex + 50, targetSentence.length)) + '...' :
                    targetSentence.substring(0, 50) + '...'
            }
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
    
}

export { EnhancedSemanticAnalyzer };
