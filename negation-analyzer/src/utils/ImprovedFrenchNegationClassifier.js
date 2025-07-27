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
            expletive_triggers: [
                // Fear expressions
                /\b(?:avoir\s+)?peur\s+que?\b/i,
                /\b(?:craindre|redouter)\s+que?\b/i,
                /\bpar\s+(?:peur|crainte)\s+que?\b/i,
                
                // Temporal expressions
                /\bavant\s+que?\b/i,
                /\b(?:jusqu'à|en attendant)\s+que?\b/i,
                
                // Other expletive triggers
                /\bpeu\s+s['']en\s+(?:faut|fallait|faudra)\b/i,
                /\bà\s+moins\s+que?\b/i,
                /\bempêcher\s+que?\b/i
            ],
            
            logical_markers: [
                // Standard negation
                /\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|guère|nullement)\b/i,
                
                // Compound negation
                /\bni\b.*\bni\b/i,
                /\bsans\b.*\bni\b/i,
                
                // Restrictive expressions
                /\bque?\b.*\bseulement\b/i,
                /\bseulement\b.*\bque?\b/i
            ],
            
            subjunctive_triggers: [
                // Common subjunctive verbs
                /\b(?:soit|ait|fasse|vienne|puisse|sache|veuille|doive)\b/i,
                
                // Compound subjunctive
                /\b(?:sois|aie|fasse|vienne|puisse|sache|veuille|doive)\s+(?:été|eu|fait|venu)\b/i
            ]
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
            throw new Error(\`Classifier initialization failed: \${error.message}\`);
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
            throw new Error(\`Classification failed: \${error.message}\`);
        }
    }

    _analyzePatterns(text) {
        const evidence = {
            expletiveTriggers: [],
            logicalMarkers: [],
            subjunctiveForms: [],
            confidence: 0,
            reasoning: []
        };

        // Check expletive triggers
        this.patterns.expletive_triggers.forEach(pattern => {
            const match = text.match(pattern);
            if (match) {
                evidence.expletiveTriggers.push({
                    pattern: match[0],
                    context: text.slice(
                        Math.max(0, match.index - 20),
                        Math.min(text.length, match.index + match[0].length + 20)
                    )
                });
            }
        });

        // Check logical markers
        this.patterns.logical_markers.forEach(pattern => {
            const match = text.match(pattern);
            if (match) {
                evidence.logicalMarkers.push({
                    pattern: match[0],
                    context: text.slice(
                        Math.max(0, match.index - 20),
                        Math.min(text.length, match.index + match[0].length + 20)
                    )
                });
            }
        });

        // Check subjunctive forms
        this.patterns.subjunctive_triggers.forEach(pattern => {
            const match = text.match(pattern);
            if (match) {
                evidence.subjunctiveForms.push({
                    form: match[0],
                    context: text.slice(
                        Math.max(0, match.index - 20),
                        Math.min(text.length, match.index + match[0].length + 20)
                    )
                });
            }
        });

        // Calculate initial confidence
        if (evidence.expletiveTriggers.length > 0) {
            evidence.confidence += 0.4;
            evidence.reasoning.push('Found expletive trigger pattern(s)');
        }
        
        if (evidence.logicalMarkers.length > 0) {
            evidence.confidence -= 0.3;
            evidence.reasoning.push('Found logical negation marker(s)');
        }
        
        if (evidence.subjunctiveForms.length > 0) {
            evidence.confidence += 0.2;
            evidence.reasoning.push('Found subjunctive form(s)');
        }

        return evidence;
    }

    async _getLLMPrediction(text, patternEvidence) {
        const prompt = \`Analysez cette phrase française pour déterminer si un "ne" manquant était expletif ou logique.

Phrase: "\${text}"

Contexte trouvé:
${patternEvidence.expletiveTriggers.length > 0 ? '- Déclencheurs expletifs: ' + patternEvidence.expletiveTriggers.map(t => t.pattern).join(', ') : ''}
${patternEvidence.logicalMarkers.length > 0 ? '- Marqueurs logiques: ' + patternEvidence.logicalMarkers.map(m => m.pattern).join(', ') : ''}
${patternEvidence.subjunctiveForms.length > 0 ? '- Formes du subjonctif: ' + patternEvidence.subjunctiveForms.map(f => f.form).join(', ') : ''}

Instructions:
1. Analysez la structure syntaxique complète
2. Considérez le contexte sémantique
3. Évaluez la présence de déclencheurs expletifs
4. Vérifiez les marqueurs de négation logique
5. Examinez le mode verbal

Format de réponse:
Type: [EXPLETIF/LOGIQUE]
Confiance: [0-1]
Indices: [liste d'indices]
Justification: [explication détaillée]\`;

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
            
            // Extract type
            const typeMatch = lines.find(l => l.toLowerCase().includes('type:'))?.split(':')[1]?.trim().toLowerCase();
            const isExpletive = typeMatch?.includes('expletif') || typeMatch?.includes('explétif');
            
            // Extract confidence
            const confidenceMatch = lines.find(l => l.toLowerCase().includes('confiance:'))?.split(':')[1]?.trim();
            const confidence = parseFloat(confidenceMatch) || 0;
            
            // Extract evidence
            const indicesMatch = lines.find(l => l.toLowerCase().includes('indices:'))?.split(':')[1]?.trim();
            const indices = indicesMatch ? indicesMatch.split(',').map(i => i.trim()) : [];
            
            // Extract reasoning
            const justificationMatch = lines.find(l => l.toLowerCase().includes('justification:'))?.split(':')[1]?.trim();
            
            return {
                type: isExpletive ? 'EXPLETIVE' : 'LOGICAL',
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

    _combineEvidence(llmResult, patternEvidence) {
        // Weight factors
        const weights = {
            llm: 0.5,
            patterns: 0.3,
            subjunctive: 0.2
        };

        // Calculate combined confidence
        let combinedConfidence = (
            llmResult.confidence * weights.llm +
            patternEvidence.confidence * weights.patterns
        );

        // Adjust for agreement between LLM and patterns
        const llmSupportsExpletive = llmResult.type === 'EXPLETIVE';
        const patternsSupportsExpletive = patternEvidence.confidence > 0;
        
        if (llmSupportsExpletive === patternsSupportsExpletive) {
            combinedConfidence += 0.1; // Boost confidence when evidence agrees
        }

        // Cap confidence
        combinedConfidence = Math.min(Math.max(combinedConfidence, 0), 0.95);

        // Collect all evidence
        const evidence = [
            ...patternEvidence.reasoning,
            \`Model prediction: \${llmResult.type} (\${Math.round(llmResult.confidence * 100)}% confidence)\`,
            ...llmResult.indices
        ];

        // Determine final classification
        let classification;
        if (combinedConfidence < 0.4) {
            classification = 'UNCERTAIN';
        } else {
            classification = llmResult.type; // Trust model's binary decision
        }

        return {
            classification,
            confidence: combinedConfidence,
            evidence: evidence.join('\n'),
            details: {
                llmAnalysis: llmResult,
                patternAnalysis: patternEvidence,
                combinedConfidence
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
                console.error(\`Batch classification error for text: \${text}\`, error);
                results.push({
                    classification: 'ERROR',
                    confidence: 0,
                    evidence: \`Classification error: \${error.message}\`
                });
            }
        }
        return results;
    }
}

export default ImprovedFrenchNegationClassifier;
