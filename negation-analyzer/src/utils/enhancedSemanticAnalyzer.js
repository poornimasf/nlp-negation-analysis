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
            
            // Preventive/Documentation contexts (medium confidence)
            { pattern: /\b(?:pris en photo|photographié|filmé|enregistré|sauvegardé|documenté)\b.*avant\s+que/i, weight: 1.5, type: 'preventive_documentation' },
            { pattern: /\bavant que.*(?:efface|supprime|détruise|disparaisse|s'en aille)\b/i, weight: 1.6, type: 'preventive_loss' },
            
            // Urgency/Finality contexts (strong confidence)
            { pattern: /\bavant\s+qu[e']?.*(?:soit trop tard|il soit trop tard)\b/i, weight: 2.4, type: 'urgency_finality' },
            { pattern: /\bavant\s+qu[e']?.*(?:quitte définitivement|parte pour toujours|disparaisse à jamais)\b/i, weight: 2.2, type: 'definitive_departure' },
            { pattern: /\bavant\s+qu[e']?.*(?:ait fini|ait terminé|ait achevé)\b/i, weight: 1.8, type: 'completion_anticipation' },
            { pattern: /\bavant\s+que.*(?:fut trop tardive|fût trop tard)\b/i, weight: 2.0, type: 'literary_urgency' },
            
            // Emotional/Dramatic lexicon contexts (strong confidence)
            { pattern: /\b(?:catastrophe|tragédie|désastre|drame|malheur|calamité)\b.*avant\s+que/i, weight: 2.2, type: 'dramatic_emotional' },
            { pattern: /\bavant\s+que.*(?:catastrophe|tragédie|désastre|drame|malheur|calamité)\b/i, weight: 2.2, type: 'dramatic_emotional' },
            { pattern: /\b(?:crise|urgence|danger|menace|péril)\b.*avant\s+que/i, weight: 2.0, type: 'crisis_urgency' },
            { pattern: /\bavant\s+que.*(?:crise|urgence|danger|menace|péril)\b/i, weight: 2.0, type: 'crisis_urgency' },
            
            // Literary/Narrative emotional contexts (medium-strong confidence)
            { pattern: /\b(?:révélation|découverte|surprise|choc|bouleversement)\b.*avant\s+que/i, weight: 1.8, type: 'narrative_emotional' },
            { pattern: /\bavant\s+que.*(?:révélation|découverte|surprise|choc|bouleversement)\b/i, weight: 1.8, type: 'narrative_emotional' },
            
            // 1. HISTORICAL/CULTURAL CONTEXTS (NEW - medium-strong confidence)
            { pattern: /\b(?:bien avant|longtemps avant|des siècles avant|des années avant)\s+que/i, weight: 2.0, type: 'historical_precedence' },
            { pattern: /\b(?:colons|peuples|civilisations|ancêtres|générations)\b.*avant\s+que/i, weight: 1.9, type: 'historical_actors' },
            { pattern: /\bavant\s+que.*(?:colons|peuples|civilisations|ancêtres|générations)\b/i, weight: 1.9, type: 'historical_actors' },
            { pattern: /\b(?:colonisation|immigration|établissement|invasion|conquête)\b.*avant\s+que/i, weight: 1.8, type: 'historical_processes' },
            { pattern: /\bavant\s+que.*(?:colonisation|immigration|établissement|invasion|conquête)\b/i, weight: 1.8, type: 'historical_processes' },
            { pattern: /\b(?:habité|peuplé|occupé|dominé|gouverné)\b.*avant\s+que/i, weight: 1.7, type: 'historical_states' },
            { pattern: /\bavant\s+que.*(?:civilisation|culture|tradition|patrimoine)\b.*(?:disparaisse|s'efface|se perde)\b/i, weight: 2.1, type: 'cultural_loss' },
            
            // 2. ACADEMIC/EDUCATIONAL CONTEXTS (NEW - medium confidence)
            { pattern: /\b(?:étudiant|chercheur|professeur|scientifique|élève)\b.*avant\s+que/i, weight: 1.6, type: 'academic_actors' },
            { pattern: /\bavant\s+que.*(?:étudiant|chercheur|professeur|scientifique|élève)\b/i, weight: 1.6, type: 'academic_actors' },
            { pattern: /\b(?:recherche|analyse|étude|expérience|découverte)\b.*avant\s+que/i, weight: 1.7, type: 'academic_processes' },
            { pattern: /\bavant\s+que.*(?:recherche|analyse|étude|expérience|découverte)\b/i, weight: 1.7, type: 'academic_processes' },
            { pattern: /\bavant\s+que.*(?:comprenne|réalise|découvre|apprenne|maîtrise)\b/i, weight: 1.8, type: 'learning_processes' },
            { pattern: /\b(?:théorie|hypothèse|concept|principe)\b.*avant\s+que/i, weight: 1.5, type: 'academic_concepts' },
            
            // 3. LITERARY/NARRATIVE CONTEXTS (ENHANCED - medium-strong confidence)
            { pattern: /\b(?:héros|personnage|protagoniste|narrateur)\b.*avant\s+que/i, weight: 1.8, type: 'narrative_characters' },
            { pattern: /\bavant\s+que.*(?:héros|personnage|protagoniste|narrateur)\b/i, weight: 1.8, type: 'narrative_characters' },
            { pattern: /\b(?:histoire|récit|conte|roman|intrigue)\b.*avant\s+que/i, weight: 1.7, type: 'narrative_structure' },
            { pattern: /\bavant\s+que.*(?:histoire|récit|conte|roman|intrigue)\b.*(?:se termine|finisse|s'achève)\b/i, weight: 1.9, type: 'narrative_conclusion' },
            { pattern: /\bavant\s+que.*(?:mystère|secret|vérité|révélation)\b.*(?:soit révélé|soit découvert|éclate)\b/i, weight: 2.0, type: 'narrative_revelation' },
            { pattern: /\b(?:destin|sort|avenir|futur)\b.*avant\s+que/i, weight: 1.8, type: 'narrative_fate' },
            
            // 4. BUSINESS/PROFESSIONAL CONTEXTS (ENHANCED - medium confidence)
            { pattern: /\b(?:entreprise|société|organisation|compagnie)\b.*avant\s+que/i, weight: 1.5, type: 'business_entities' },
            { pattern: /\bavant\s+que.*(?:entreprise|société|organisation|compagnie)\b/i, weight: 1.5, type: 'business_entities' },
            { pattern: /\b(?:marché|économie|secteur|industrie)\b.*avant\s+que/i, weight: 1.6, type: 'economic_contexts' },
            { pattern: /\bavant\s+que.*(?:marché|économie|secteur|industrie)\b.*(?:s'effondre|chute|décline)\b/i, weight: 1.9, type: 'economic_crisis' },
            { pattern: /\b(?:négociation|accord|contrat|deal)\b.*avant\s+que/i, weight: 1.4, type: 'business_processes' },
            { pattern: /\bavant\s+que.*(?:négociation|accord|contrat|deal)\b.*(?:échoue|expire|soit annulé)\b/i, weight: 1.8, type: 'business_failure' },
            { pattern: /\b(?:investissement|financement|budget|capital)\b.*avant\s+que/i, weight: 1.5, type: 'financial_contexts' },
            
            // 5. MEDICAL/HEALTH CONTEXTS (NEW - medium-strong confidence)
            { pattern: /\b(?:patient|malade|médecin|chirurgien|docteur)\b.*avant\s+que/i, weight: 1.7, type: 'medical_actors' },
            { pattern: /\bavant\s+que.*(?:patient|malade|médecin|chirurgien|docteur)\b/i, weight: 1.7, type: 'medical_actors' },
            { pattern: /\b(?:maladie|infection|virus|épidémie|cancer)\b.*avant\s+que/i, weight: 1.8, type: 'medical_conditions' },
            { pattern: /\bavant\s+que.*(?:maladie|infection|virus|épidémie|cancer)\b.*(?:progresse|s'aggrave|se propage)\b/i, weight: 2.0, type: 'medical_progression' },
            { pattern: /\b(?:traitement|médicament|thérapie|intervention|opération)\b.*avant\s+que/i, weight: 1.6, type: 'medical_treatments' },
            { pattern: /\bavant\s+que.*(?:traitement|médicament|thérapie|intervention|opération)\b.*(?:fasse effet|guérisse|soigne)\b/i, weight: 1.9, type: 'medical_healing' },
            { pattern: /\bavant\s+que.*(?:soit trop tard|il soit trop tard)\b.*(?:médical|santé|vie)\b/i, weight: 2.3, type: 'medical_urgency' },
            
            // 6. LEGAL/ADMINISTRATIVE CONTEXTS (ENHANCED - medium confidence)
            { pattern: /\b(?:tribunal|cour|juge|avocat|procureur)\b.*avant\s+que/i, weight: 1.6, type: 'legal_actors' },
            { pattern: /\bavant\s+que.*(?:tribunal|cour|juge|avocat|procureur)\b/i, weight: 1.6, type: 'legal_actors' },
            { pattern: /\b(?:loi|règlement|décret|ordonnance|arrêté)\b.*avant\s+que/i, weight: 1.5, type: 'legal_instruments' },
            { pattern: /\bavant\s+que.*(?:loi|règlement|décret|ordonnance|arrêté)\b.*(?:entre en vigueur|soit adopté|soit voté)\b/i, weight: 1.7, type: 'legal_enactment' },
            { pattern: /\b(?:procès|procédure|enquête|investigation)\b.*avant\s+que/i, weight: 1.6, type: 'legal_processes' },
            { pattern: /\bavant\s+que.*(?:procès|procédure|enquête|investigation)\b.*(?:commence|aboutisse|se termine)\b/i, weight: 1.8, type: 'legal_proceedings' },
            { pattern: /\bavant\s+que.*(?:justice|verdict|sentence|jugement)\b.*(?:soit rendu|tombe|soit prononcé)\b/i, weight: 1.9, type: 'legal_judgment' },
            
            // 7. ENVIRONMENTAL/NATURAL CONTEXTS (NEW - medium-strong confidence)
            { pattern: /\b(?:nature|environnement|écosystème|planète|terre)\b.*avant\s+que/i, weight: 1.7, type: 'environmental_entities' },
            { pattern: /\bavant\s+que.*(?:nature|environnement|écosystème|planète|terre)\b/i, weight: 1.7, type: 'environmental_entities' },
            { pattern: /\b(?:espèce|animal|plante|forêt|océan)\b.*avant\s+que/i, weight: 1.6, type: 'natural_entities' },
            { pattern: /\bavant\s+que.*(?:espèce|animal|plante|forêt|océan)\b.*(?:disparaisse|s'éteigne|meure)\b/i, weight: 2.0, type: 'environmental_loss' },
            { pattern: /\b(?:climat|température|réchauffement|changement climatique)\b.*avant\s+que/i, weight: 1.8, type: 'climate_contexts' },
            { pattern: /\bavant\s+que.*(?:climat|température|réchauffement|pollution)\b.*(?:empire|s'aggrave|détruise)\b/i, weight: 2.1, type: 'environmental_crisis' },
            { pattern: /\b(?:saison|cycle|évolution|adaptation)\b.*avant\s+que/i, weight: 1.4, type: 'natural_processes' },
            
            // 8. TECHNOLOGICAL/DIGITAL CONTEXTS (NEW - medium confidence)
            { pattern: /\b(?:système|ordinateur|serveur|réseau|plateforme)\b.*avant\s+que/i, weight: 1.5, type: 'tech_systems' },
            { pattern: /\bavant\s+que.*(?:système|ordinateur|serveur|réseau|plateforme)\b/i, weight: 1.5, type: 'tech_systems' },
            { pattern: /\b(?:technologie|innovation|algorithme|intelligence artificielle)\b.*avant\s+que/i, weight: 1.6, type: 'tech_innovation' },
            { pattern: /\bavant\s+que.*(?:technologie|innovation|algorithme|IA)\b.*(?:évolue|révolutionne|transforme)\b/i, weight: 1.8, type: 'tech_evolution' },
            { pattern: /\bavant\s+que.*(?:système|serveur|ordinateur)\b.*(?:plante|crash|tombe en panne)\b/i, weight: 1.7, type: 'tech_failure' },
            { pattern: /\b(?:données|information|fichier|sauvegarde)\b.*avant\s+que/i, weight: 1.4, type: 'data_contexts' },
            { pattern: /\bavant\s+que.*(?:données|information|fichier)\b.*(?:soit perdu|disparaisse|soit corrompu)\b/i, weight: 1.8, type: 'data_loss' },
            
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
                
                for (const { pattern, priority } of clauseEndPatterns) {
                    const endMatch = afterTrigger.match(pattern);
                    if (endMatch && priority < bestPriority) {
                        bestPriority = priority;
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
        
        // Step 2.5: NEW - Detect anti-expletive contexts (contexts that suggest NO expletive)
        const antiExpletiveAnalysis = this.detectAntiExpletiveContext(sentence);
        
        // Step 3: Check syntactic licensing (lowest priority) - use normalized for pattern matching
        const syntacticAnalysis = this.checkSyntacticLicensing(normalizedSentence);
        
        // Step 4: DISCOURSE ANALYSIS - NEW!
        const discourseAnalysis = this.analyzeDiscourseFactors(sentence, normalizedSentence);
        
        // Step 5: Detect semantic conflicts (now includes anti-expletive)
        const conflictAnalysis = this.detectSemanticConflict(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, antiExpletiveAnalysis);
        
        // Step 6: Calculate final semantic bias using hierarchy + discourse + anti-expletive
        const semanticBias = this.calculateHierarchicalBias(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, conflictAnalysis, discourseAnalysis, antiExpletiveAnalysis);
        
        // Step 7: Calculate expletive likelihood on 1-7 scale (now considers anti-expletive)
        const likelihood = this.calculateExpletiveLikelihood(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, discourseAnalysis, semanticBias, antiExpletiveAnalysis);
        
        return {
            logicalAnalysis,
            expletiveAnalysis,
            antiExpletiveAnalysis,  // NEW!
            syntacticAnalysis,
            discourseAnalysis,
            conflictAnalysis,
            semanticBias,
            likelihood,
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
     * Calculate semantic bias using hierarchical approach + discourse modulation + anti-expletive detection
     */
    calculateHierarchicalBias(logicalAnalysis, expletiveAnalysis, syntacticAnalysis, conflictAnalysis, discourseAnalysis, antiExpletiveAnalysis) {
        let bias = 0;
        
        // PRIORITY 0: Anti-expletive contexts (NEW - highest priority for false positive reduction)
        if (antiExpletiveAnalysis && antiExpletiveAnalysis.overridesExpletive) {
            bias -= 0.8; // Strong bias against expletive
            console.log(`🚫 ANTI-EXPLETIVE OVERRIDE: ${antiExpletiveAnalysis.strength} (score: ${antiExpletiveAnalysis.score})`);
        } else if (antiExpletiveAnalysis && antiExpletiveAnalysis.strength === 'medium') {
            bias -= 0.4; // Moderate bias against expletive
        } else if (antiExpletiveAnalysis && antiExpletiveAnalysis.strength === 'weak') {
            bias -= 0.2; // Slight bias against expletive
        }
        
        // PRIORITY 1: Logical indicators (addresses overcorrection)
        if (logicalAnalysis.level === 'strong') {
            bias -= 0.8; // Very strong favor logical
        } else if (logicalAnalysis.level === 'medium') {
            bias -= 0.5; // Medium favor logical
        } else if (logicalAnalysis.level === 'weak') {
            bias -= 0.2; // Slight favor logical
        }
        
        // PRIORITY 2: Expletive contexts (only if logical AND anti-expletive are not strong)
        if (!logicalAnalysis.overridesExpletive && (!antiExpletiveAnalysis || !antiExpletiveAnalysis.overridesExpletive)) {
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
     * Detect contexts that strongly suggest NO expletive "ne" should be used
     * Based on comprehensive corpus analysis of false positive patterns
     */
    detectAntiExpletiveContext(sentence) {
        const contexts = [];
        let totalScore = 0;
        
        // 1. GRAMMATICAL ERRORS - Indicative mood instead of subjunctive (STRONGEST SIGNAL)
        const indicativePatterns = [
            // Standard form: "avant que je ai", "avant que tu as", etc.
            { pattern: /avant\s+qu[e']?\s*(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+(?:ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont|vais|vas|va|allons|allez|vont|pars|part|partons|partez|partent|prend|prends|prenons|prenez|prennent|fait|fais|faisons|faites|font|vient|viens|venons|venez|viennent|dit|dis|disons|dites|disent|peut|peux|pouvons|pouvez|peuvent|veut|veux|voulons|voulez|veulent)\b/i, 
              weight: 3.0, context: 'indicative_mood_error' },
            // Contracted forms: "avant que j'ai", "avant que j'aie" (wrong), etc.
            { pattern: /avant\s+qu[e']?\s*(?:j'|tu\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\s+|elles\s+)(?:ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont|vais|vas|va|allons|allez|vont|pars|part|partons|partez|partent|prend|prends|prenons|prenez|prennent|fait|fais|faisons|faites|font|vient|viens|venons|venez|viennent|dit|dis|disons|dites|disent|peut|peux|pouvons|pouvez|peuvent|veut|veux|voulons|voulez|veulent)\b/i, 
              weight: 3.0, context: 'indicative_mood_error_contracted' },
        ];
        
        // 2. INFORMAL/COLLOQUIAL MARKERS (STRONG SIGNAL)
        const informalPatterns = [
            { pattern: /\b(allez|bon|bah|ouais|nan|putain|merde|clairement|franchement|carrément)\b/i, weight: 2.0, context: 'informal_language' },
            { pattern: /[.]{2,}|!!+|\^\^|:\)|:\(|lol|mdr/i, weight: 1.5, context: 'informal_punctuation' },
            { pattern: /\*[^*]+\*/i, weight: 1.8, context: 'action_description' }, // *michael passait*
            // Explicit/vulgar content (very strong informal signal)
            { pattern: /\b(chatte|queue|salaud|fellation|pistonner|baiser|niquer|enculer|sucer|lécher)\b/i, weight: 2.5, context: 'explicit_vulgar_content' },
            { pattern: /\b(positions|sexuel|sexuelle|cul|bite|con|connasse|pute|salope)\b/i, weight: 2.3, context: 'sexual_vulgar_content' },
        ];
        
        // 3. COMPLETION/DURATION CONTEXTS (STRONG SIGNAL)
        const completionPatterns = [
            { pattern: /\b(il a fallu|ça a pris|cela a duré|il faut compter)\b.*avant\s+que/i, weight: 2.2, context: 'duration_completion' },
            { pattern: /\b(plusieurs|quelques|des)\s+(années|mois|semaines|jours|heures|minutes)\b.*avant\s+que/i, weight: 1.8, context: 'time_duration' },
            { pattern: /\b(jusqu'à|attendre|patienter)\b.*avant\s+que/i, weight: 1.6, context: 'waiting_completion' },
        ];
        
        // 4. NEUTRAL DESCRIPTIVE/NARRATIVE CONTEXTS (MEDIUM-STRONG SIGNAL)
        const narrativePatterns = [
            { pattern: /\b(se déroula|se passa|eut lieu|arriva)\b.*avant\s+que/i, weight: 1.8, context: 'past_narrative' },
            { pattern: /\b(mais ça|cela|ça)\s+(n'a duré|a duré|a commencé)\b.*avant\s+que/i, weight: 1.6, context: 'neutral_description' },
            { pattern: /\b(un court moment|quelques pages|quelques minutes)\b.*avant\s+que/i, weight: 1.4, context: 'brief_duration' },
        ];
        
        // 5. TECHNICAL/PROCEDURAL CONTEXTS (MEDIUM-STRONG SIGNAL)
        const technicalPatterns = [
            { pattern: /\b(il faut|vous devez|il convient de|il est nécessaire de)\b.*avant\s+que/i, weight: 1.8, context: 'procedural_instruction' },
            { pattern: /\b(système|service|programme|logiciel|application|processus)\b.*avant\s+que/i, weight: 1.6, context: 'technical_context' },
            { pattern: /\b(mesures|dispositions|précautions)\b.*avant\s+que/i, weight: 1.4, context: 'administrative_context' },
        ];
        
        // 6. CASUAL CONVERSATION MARKERS (MEDIUM SIGNAL)
        const conversationalPatterns = [
            { pattern: /\b(bon|alors|donc|enfin|bref|sinon)\b.*avant\s+que/i, weight: 1.2, context: 'conversational_markers' },
            { pattern: /\b(je pense|je crois|il me semble)\b.*avant\s+que/i, weight: 1.0, context: 'tentative_opinion' },
        ];
        
        // 7. BUSINESS/FORMAL PROCEDURAL (MEDIUM SIGNAL)
        const businessPatterns = [
            { pattern: /\b(entreprise|société|organisation|administration)\b.*avant\s+que/i, weight: 1.4, context: 'business_context' },
            { pattern: /\b(contrat|accord|décision|modification)\b.*avant\s+que/i, weight: 1.2, context: 'legal_administrative' },
        ];
        
        // 8. NEW ANTI-EXPLETIVE CATEGORIES (BALANCED APPROACH)
        
        // 8a. NEUTRAL HISTORICAL/FACTUAL CONTEXTS (MEDIUM SIGNAL)
        const neutralHistoricalPatterns = [
            { pattern: /\b(historiquement|factuellement|objectivement|simplement)\b.*avant\s+que/i, weight: 1.3, context: 'neutral_historical' },
            { pattern: /\b(chronologie|séquence|ordre|succession)\b.*avant\s+que/i, weight: 1.4, context: 'chronological_sequence' },
            { pattern: /\b(date|époque|période|moment)\b.*avant\s+que/i, weight: 1.2, context: 'temporal_factual' },
        ];
        
        // 8b. ACADEMIC/TECHNICAL INSTRUCTION CONTEXTS (MEDIUM SIGNAL)
        const academicInstructionalPatterns = [
            { pattern: /\b(étape|phase|stade|niveau)\b.*avant\s+que/i, weight: 1.3, context: 'academic_procedural' },
            { pattern: /\b(méthode|technique|approche|stratégie)\b.*avant\s+que/i, weight: 1.4, context: 'methodological' },
            { pattern: /\b(résultat|conclusion|analyse|évaluation)\b.*avant\s+que/i, weight: 1.2, context: 'academic_neutral' },
        ];
        
        // 8c. BUSINESS/PROFESSIONAL ROUTINE CONTEXTS (MEDIUM SIGNAL)
        const businessRoutinePatterns = [
            { pattern: /\b(processus|workflow|procédure|protocole)\b.*avant\s+que/i, weight: 1.4, context: 'business_routine' },
            { pattern: /\b(réunion|meeting|conférence|présentation)\b.*avant\s+que/i, weight: 1.2, context: 'business_meetings' },
            { pattern: /\b(rapport|document|fichier|dossier)\b.*avant\s+que/i, weight: 1.1, context: 'business_documentation' },
        ];
        
        // 8d. MEDICAL/HEALTH ROUTINE CONTEXTS (MEDIUM SIGNAL)
        const medicalRoutinePatterns = [
            { pattern: /\b(consultation|examen|contrôle|visite)\b.*avant\s+que/i, weight: 1.3, context: 'medical_routine' },
            { pattern: /\b(protocole|procédure|traitement standard)\b.*avant\s+que/i, weight: 1.4, context: 'medical_procedural' },
            { pattern: /\b(diagnostic|analyse|test|résultat)\b.*avant\s+que/i, weight: 1.2, context: 'medical_analytical' },
        ];
        
        // 8e. TECHNOLOGICAL/DIGITAL ROUTINE CONTEXTS (MEDIUM SIGNAL)
        const techRoutinePatterns = [
            { pattern: /\b(installation|configuration|mise à jour|sauvegarde)\b.*avant\s+que/i, weight: 1.4, context: 'tech_routine' },
            { pattern: /\b(automatique|programmé|planifié|systématique)\b.*avant\s+que/i, weight: 1.5, context: 'tech_automated' },
            { pattern: /\b(données|fichier|base de données|serveur)\b.*avant\s+que/i, weight: 1.2, context: 'tech_data' },
        ];
        
        // 8f. LEGAL/ADMINISTRATIVE ROUTINE CONTEXTS (MEDIUM SIGNAL)
        const legalRoutinePatterns = [
            { pattern: /\b(formulaire|demande|dossier|inscription)\b.*avant\s+que/i, weight: 1.3, context: 'legal_routine' },
            { pattern: /\b(procédure standard|démarche|formalité)\b.*avant\s+que/i, weight: 1.4, context: 'administrative_routine' },
            { pattern: /\b(délai|échéance|date limite|expiration)\b.*avant\s+que/i, weight: 1.2, context: 'administrative_deadlines' },
        ];
        
        // 8g. ENVIRONMENTAL/NATURAL ROUTINE CONTEXTS (MEDIUM SIGNAL)
        const environmentalRoutinePatterns = [
            { pattern: /\b(cycle|processus naturel|évolution|développement)\b.*avant\s+que/i, weight: 1.3, context: 'natural_routine' },
            { pattern: /\b(saison|période|phase|étape naturelle)\b.*avant\s+que/i, weight: 1.2, context: 'seasonal_routine' },
            { pattern: /\b(croissance|maturation|développement|formation)\b.*avant\s+que/i, weight: 1.1, context: 'natural_development' },
        ];
        
        const allPatterns = [
            ...indicativePatterns,
            ...informalPatterns, 
            ...completionPatterns,
            ...narrativePatterns,
            ...technicalPatterns,
            ...conversationalPatterns,
            ...businessPatterns,
            ...neutralHistoricalPatterns,
            ...academicInstructionalPatterns,
            ...businessRoutinePatterns,
            ...medicalRoutinePatterns,
            ...techRoutinePatterns,
            ...legalRoutinePatterns,
            ...environmentalRoutinePatterns
        ];
        
        for (const { pattern, weight, context } of allPatterns) {
            if (pattern.test(sentence)) {
                contexts.push({ context, weight, pattern: pattern.toString() });
                totalScore += weight;
            }
        }
        
        const strength = totalScore > 3.0 ? 'strong' : totalScore > 1.8 ? 'medium' : totalScore > 0.8 ? 'weak' : 'none';
        
        return {
            hasAntiExpletive: totalScore > 0,
            strength,
            score: totalScore,
            contexts,
            overridesExpletive: totalScore > 2.0 // Lowered threshold for stronger override
        };
    }
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
     * Generate reasoning explanation for the analysis
     * Original implementation from commit cbf7c82
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
