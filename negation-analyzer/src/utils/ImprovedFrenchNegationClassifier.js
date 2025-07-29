import { HfInference } from '@huggingface/inference';

class ImprovedFrenchNegationClassifier {
    constructor() {
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set');
        }

        this.inference = new HfInference(token);
        this.initialized = false;
        this.modelId = 'croissantllm/CroissantLLMChat-v0.1';
        
        // Comprehensive French patterns
        this.patterns = {
            // Expletive negation patterns
            expletive_triggers: [
                // Fear expressions
                /\b(?:[Aa]voir\s+)?[Pp]eur\s+que?\b/i,
                /\b(?:[Cc]raindre|[Rr]edouter)\s+que?\b/i,
                /\b[Pp]ar\s+(?:[Pp]eur|[Cc]rainte)\s+que?\b/i,
                
                // Temporal expressions
                /\b[Aa]vant\s+que?\b/i,
                /\b(?:[Jj]usqu['']à|[Ee]n\s+attendant)\s+que?\b/i,
                
                // Other expletive triggers
                /\b(?:[Pp]eu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)|[Pp]eu\s+s['']en\s+(?:est|était|ait)\s+fallu(?:\s+de\s+peu)?(?:\s+que?)?|s['']en\s+(?:est|était|ait)\s+fallu\s+de\s+peu(?:\s+qu[''](?:une?|elle?|ils?|elles?|on|il|[aeiouyh]|\w+))?|[Pp]eu\s+s['']en\s+fall(?:ut|ait)(?:\s+qu[''](?:une?|elle?|ils?|elles?|on|il|[aeiouyh]|\w+))?|s['']en\s+fall(?:ut|ait)(?:\s+de\s+peu)?(?:\s+que?)?|[Pp]eu\s+s['']en\s+(?:faudra|faudrait)(?:\s+qu[''](?:une?|elle?|ils?|elles?|on|il|[aeiouyh]|\w+))?|(?:il\s+)?(?:ne\s+)?s['']en\s+(?:faut|fallait|faudra|faudrait)\s+de\s+peu|il\s+s['']en\s+(?:est|était|ait)\s+fallu\s+de\s+peu|(?:il\s+)?ne\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+pas\s+de\s+beaucoup|peu\s+qu[''](?:un|il\s+fût))\b/i,
                /\bà\s+moins\s+que?\b/i,
                /\bempêcher\s+que?\b/i
            ],
            
            // Logical negation patterns
            logical_markers: {
                // Complete negation constructions (requiring both parts)
                complete_negation: [
                    /\bne\b[^.]*?\bpas\b/i,
                    /\bne\b[^.]*?\bpoint\b/i,
                    /\bne\b[^.]*?\bplus\b/i,
                    /\bne\b[^.]*?\bjamais\b/i,
                    /\bne\b[^.]*?\bguère\b/i,
                    /\bne\b[^.]*?\bnullement\b/i,
                    /\bne\b[^.]*?\bpersonne\b/i,
                    /\bne\b[^.]*?\brien\b/i
                ],
                
                // Secondary negation particles (only considered with proper context)
                particles: [
                    /\bpas\b/i,
                    /\bpoint\b/i,
                    /\bplus\b/i,
                    /\bjamais\b/i,
                    /\bguère\b/i,
                    /\bnullement\b/i
                ],
                
                // Negative pronouns and determiners
                pronouns: [
                    /\bpersonne\b/i,
                    /\baucun(?:e)?\b/i,
                    /\bnul(?:le)?\b/i,
                    /\brien\b/i
                ],
                
                // Compound negation
                compound: [
                    /\bni\b.*\bni\b/i,
                    /\bsans\b.*\bni\b/i
                ],
                
                // Restrictive expressions (not necessarily negative)
                restrictive: [
                    /\bne\b.*\bque\b/i,
                    /\bseulement\b/i,
                    /\buniquement\b/i
                ]
            },
            
            // Verb forms and moods
            verb_forms: {
                // Subjunctive (often with expletive)
                subjunctive: [
                    /\b(?:soit|ait|fasse|vienne|puisse|sache|veuille|doive)\b/i,
                    /\b(?:sois|aie|fasse|vienne|puisse|sache|veuille|doive)\s+(?:été|eu|fait|venu)\b/i
                ],
                
                // Indicative (often with logical)
                indicative: [
                    /\b(?:est|sont|était|étaient|sera|seront)\b/i,
                    /\b(?:a|ont|avait|avaient|aura|auront)\b/i,
                    /\b(?:fait|font|faisait|faisaient|fera|feront)\b/i
                ]
            }
        };
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log('Initializing French negation classifier...');
            
            // Test connection with a simple prompt
            const testResult = await this.inference.textGeneration({
                model: this.modelId,
                inputs: 'Test connection. Répondez en une phrase.',
                parameters: {
                    max_new_tokens: 50,
                    temperature: 0.1,
                    top_p: 0.95
                }
            });

            if (!testResult?.generated_text) {
                throw new Error('Model initialization failed - no response');
            }

            this.initialized = true;
            console.log('French negation classifier initialized successfully');
        } catch (error) {
            console.error('Initialization failed:', error);
            throw new Error(`Classifier initialization failed: ${error.message}`);
        }
    }

    async classifyNegation(text) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // 1. Pattern Analysis
            const patternEvidence = this._analyzePatterns(text);
            
            // 2. LLM Analysis
            const llmResult = await this._getLLMPrediction(text, patternEvidence);
            
            // 3. Combine Evidence
            return this._combineEvidence(llmResult, patternEvidence);
            
        } catch (error) {
            console.error('Classification error:', error);
            throw new Error(`Classification failed: ${error.message}`);
        }
    }

    _analyzePatterns(text) {
        const evidence = {
            expletiveEvidence: {
                triggers: [],
                score: 0,
                reasoning: []
            },
            logicalEvidence: {
                markers: [],
                score: 0,
                reasoning: []
            },
            verbForms: {
                forms: [],
                score: 0,
                reasoning: []
            }
        };

        // Check expletive triggers
        this.patterns.expletive_triggers.forEach(pattern => {
            const match = text.match(pattern);
            if (match) {
                evidence.expletiveEvidence.triggers.push({
                    pattern: match[0],
                    context: text.slice(
                        Math.max(0, match.index - 20),
                        Math.min(text.length, match.index + match[0].length + 20)
                    )
                });
                evidence.expletiveEvidence.score += 0.3;
                evidence.expletiveEvidence.reasoning.push(
                    `Found expletive trigger: "${match[0]}"`
                );
            }
        });

        // Check logical markers
        Object.entries(this.patterns.logical_markers).forEach(([type, patterns]) => {
            patterns.forEach(pattern => {
                const match = text.match(pattern);
                if (match) {
                    evidence.logicalEvidence.markers.push({
                        type,
                        pattern: match[0],
                        context: text.slice(
                            Math.max(0, match.index - 20),
                            Math.min(text.length, match.index + match[0].length + 20)
                        )
                    });
                    
                    // Weight different types of logical markers
                    let score = 0;
                    switch(type) {
                        case 'complete_negation':
                            score = 0.6;
                            evidence.logicalEvidence.reasoning.push(
                                `Found complete negation construction: "${match[0]}"`
                            );
                            break;
                        case 'particles':
                            score = 0.2;
                            evidence.logicalEvidence.reasoning.push(
                                `Found negation particle: "${match[0]}" (weak indicator without ne)`
                            );
                            break;
                        case 'pronouns':
                            score = 0.35;
                            break;
                        case 'compound':
                            score = 0.45;
                            break;
                        case 'restrictive':
                            score = 0.15;
                            evidence.logicalEvidence.reasoning.push(
                                `Found restrictive expression: "${match[0]}" (needs context)`
                            );
                            break;
                        default:
                            score = 0.1;
                    }
                    
                    evidence.logicalEvidence.score += score;
                    evidence.logicalEvidence.reasoning.push(
                        `Found ${type} negation: "${match[0]}"`
                    );
                }
            });
        });

        // Check verb forms
        Object.entries(this.patterns.verb_forms).forEach(([mood, patterns]) => {
            patterns.forEach(pattern => {
                const match = text.match(pattern);
                if (match) {
                    evidence.verbForms.forms.push({
                        mood,
                        form: match[0],
                        context: text.slice(
                            Math.max(0, match.index - 20),
                            Math.min(text.length, match.index + match[0].length + 20)
                        )
                    });
                    
                    if (mood === 'subjunctive') {
                        evidence.expletiveEvidence.score += 0.2;
                        evidence.verbForms.reasoning.push(
                            `Found subjunctive form: "${match[0]}" (supports expletive)`
                        );
                    } else if (mood === 'indicative') {
                        evidence.logicalEvidence.score += 0.15;
                        evidence.verbForms.reasoning.push(
                            `Found indicative form: "${match[0]}" (supports logical)`
                        );
                    }
                }
            });
        });

        evidence.expletiveEvidence.score = Math.min(evidence.expletiveEvidence.score, 0.95);
        evidence.logicalEvidence.score = Math.min(evidence.logicalEvidence.score, 0.95);

        return evidence;
    }

    async _getLLMPrediction(text, evidence) {
        const prompt = `En tant que linguiste spécialisé en français, analysez cette phrase pour déterminer si le "ne" (présent ou absent) est explétif ou de négation logique.

Phrase à analyser : "${text}"

Éléments grammaticaux repérés :
${evidence.expletiveEvidence.triggers.length > 0 ? 
  '• Constructions déclenchant le ne explétif :\n' + 
  evidence.expletiveEvidence.triggers.map(t => `  - ${t.pattern} (construction ${t.type})`).join('\n') : ''}

${evidence.logicalEvidence.markers.length > 0 ? 
  '• Marqueurs de négation logique :\n' + 
  evidence.logicalEvidence.markers.map(m => `  - ${m.pattern} (négation ${m.type})`).join('\n') : ''}

${evidence.verbForms.forms.length > 0 ? 
  '• Modes et temps verbaux :\n' + 
  evidence.verbForms.forms.map(f => `  - ${f.form} (${f.mood === 'subjunctive' ? 'subjonctif' : 'indicatif'})`).join('\n') : ''}

Rappel des constructions typiques :
• Ne explétif :
  - Verbes de crainte : "avoir peur que", "craindre que"
  - Locutions : "avant que", "à moins que"
  - Tournures : "peu s'en faut que", "il s'en faut de peu que"

• Négation logique :
  - Ne...pas, ne...plus, ne...jamais
  - Ne...rien, ne...personne
  - Ne...guère, ne...point

Analyse détaillée et justification :
- Identifiez la construction principale
- Examinez le mode verbal (subjonctif/indicatif)
- Vérifiez la présence d'autres marqueurs
- Déterminez si le "ne" est explétif ou logique

Format de réponse :
Type : [LOGIQUE/EXPLETIF]
Confiance : [0-1]
Indices : [liste d'indices trouvés]
Justification : [explication détaillée]`;

        const response = await this.inference.textGeneration({
            model: this.modelId,
            inputs: prompt,
            parameters: {
                max_new_tokens: 256,
                temperature: 0.1,
                top_p: 0.95,
                repetition_penalty: 1.15
            }
        });

        return this._parseLLMResponse(response.generated_text);
    }

    _parseLLMResponse(text) {
        try {
            const lines = text.split('\n');
            
            const typeMatch = lines.find(l => l.toLowerCase().includes('type :'))?.split(':')[1]?.trim().toLowerCase();
            const isExpletive = typeMatch?.includes('expletif') || typeMatch?.includes('explétif');
            const isLogical = typeMatch?.includes('logique');
            
            const confidenceMatch = lines.find(l => l.toLowerCase().includes('confiance :'))?.split(':')[1]?.trim();
            const confidence = parseFloat(confidenceMatch) || 0;
            
            const indicesMatch = lines.find(l => l.toLowerCase().includes('indices :'))?.split(':')[1]?.trim();
            const indices = indicesMatch ? indicesMatch.split(',').map(i => i.trim()) : [];
            
            const justificationMatch = lines.find(l => l.toLowerCase().includes('justification :'))?.split(':')[1]?.trim();
            
            let type = 'UNCERTAIN';
            if (isExpletive) type = 'EXPLETIVE';
            else if (isLogical) type = 'LOGICAL';
            
            return {
                type,
                confidence,
                indices,
                justification: justificationMatch || '',
                rawResponse: text
            };
        } catch (error) {
            console.error('Failed to parse LLM response:', error);
            return {
                type: 'UNCERTAIN',
                confidence: 0,
                indices: [],
                justification: 'Failed to parse model response',
                rawResponse: text
            };
        }
    }

    _combineEvidence(llmResult, evidence) {
        const weights = {
            llm: 0.4,
            patterns: 0.4,
            verbForms: 0.2
        };

        const expletiveScore = (
            (llmResult.type === 'EXPLETIVE' ? llmResult.confidence : 0) * weights.llm +
            evidence.expletiveEvidence.score * weights.patterns
        );

        const logicalScore = (
            (llmResult.type === 'LOGICAL' ? llmResult.confidence : 0) * weights.llm +
            evidence.logicalEvidence.score * weights.patterns
        );

        let classification, confidence;
        
        if (Math.abs(expletiveScore - logicalScore) < 0.2) {
            classification = 'UNCERTAIN';
            confidence = Math.max(expletiveScore, logicalScore);
        } else if (expletiveScore > logicalScore) {
            classification = 'EXPLETIVE';
            confidence = expletiveScore;
        } else {
            classification = 'LOGICAL';
            confidence = logicalScore;
        }

        confidence = Math.min(Math.max(confidence, 0), 0.95);

        const allEvidence = [
            `Prédiction du modèle : ${llmResult.type} (confiance ${Math.round(llmResult.confidence * 100)}%)`,
            llmResult.justification,
            
            ...evidence.expletiveEvidence.reasoning,
            ...evidence.logicalEvidence.reasoning,
            ...evidence.verbForms.reasoning,
            
            `Confiance combinée : ${Math.round(confidence * 100)}%`
        ].filter(Boolean);

        return {
            classification,
            confidence,
            evidence: allEvidence.join('\n'),
            details: {
                llmAnalysis: llmResult,
                patternAnalysis: evidence,
                combinedConfidence: confidence
            }
        };
    }

    async batchClassify(texts) {
        if (!this.initialized) {
            await this.initialize();
        }

        const results = [];
        for (const text of texts) {
            try {
                const result = await this.classifyNegation(text);
                results.push(result);
            } catch (error) {
                console.error(`Batch classification error for text: ${text}`, error);
                results.push({
                    classification: 'ERROR',
                    confidence: 0,
                    evidence: `Classification error: ${error.message}`
                });
            }
        }
        return results;
    }
}

export default ImprovedFrenchNegationClassifier;
