import { HfInference } from '@huggingface/inference';

class CamemBERTClassifier {
    constructor() {
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            console.error('No Hugging Face token found in environment variables');
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set in environment variables');
        }

        try {
            this.inference = new HfInference(token);
            this.initialized = false;
            this.modelName = 'jean-baptiste/camembert-ner';  // Updated to a specific CamemBERT model
            this.maxRetries = 3;
            this.retryDelay = 1000; // 1 second
        } catch (error) {
            console.error('Error creating HfInference instance:', error);
            throw new Error('Failed to initialize Hugging Face inference client');
        }
    }

    async _retryOperation(operation) {
        let lastError;
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(\`Attempt \${i + 1} failed: \${error.message}\`);
                lastError = error;
                if (i < this.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
                }
            }
        }
        throw lastError;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log('Initializing CamemBERT with model:', this.modelName);
            
            // Test connection with a simple inference
            const testResult = await this._retryOperation(async () => {
                return await this.inference.tokenClassification({
                    model: this.modelName,
                    inputs: "Test de connexion."
                });
            });

            if (!testResult) {
                throw new Error('No response from model test');
            }

            console.log('CamemBERT test inference result:', testResult);
            this.initialized = true;
            console.log('CamemBERT initialized successfully');
        } catch (error) {
            console.error('Failed to initialize CamemBERT:', error);
            
            // Provide more specific error messages
            if (error.message.includes('401')) {
                throw new Error('Invalid Hugging Face token - Please check your REACT_APP_HF_TOKEN');
            } else if (error.message.includes('404')) {
                throw new Error('Model not found - Please check model availability');
            } else if (error.message.includes('429')) {
                throw new Error('Rate limit exceeded - Please try again later');
            } else if (error.message.includes('503')) {
                throw new Error('Model is currently unavailable - Please try again later');
            } else {
                throw new Error(\`CamemBERT initialization failed: \${error.message}\`);
            }
        }
    }

    async classifyNegation(text) {
        if (!text) {
            throw new Error('No text provided for classification');
        }

        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // First, analyze the text for negation presence
            const result = await this._retryOperation(async () => {
                return await this.inference.tokenClassification({
                    model: this.modelName,
                    inputs: text,
                    parameters: {
                        aggregation_strategy: "simple"
                    }
                });
            });

            if (!result) {
                throw new Error('No response from model');
            }

            // Extract patterns that might indicate expletive negation
            const hasExpletivePatterns = this._checkExpletivePatterns(text);
            const hasLogicalPatterns = this._checkLogicalPatterns(text);
            
            // Combine model prediction with pattern analysis
            const classification = this._determineClassification(
                result,
                hasExpletivePatterns,
                hasLogicalPatterns
            );

            return {
                classification: classification.type,
                confidence: classification.confidence,
                evidence: classification.evidence
            };
        } catch (error) {
            console.error('Error during CamemBERT classification:', error);
            
            // Provide more specific error messages
            if (error.message.includes('rate limit')) {
                throw new Error('Rate limit exceeded - Please try again later');
            } else if (error.message.includes('model is currently loading')) {
                throw new Error('Model is loading - Please try again in a few seconds');
            } else {
                throw new Error(\`Classification failed: \${error.message}\`);
            }
        }
    }

    _checkExpletivePatterns(text) {
        const expletivePatterns = [
            /\b(?:avoir\s+)?peur\s+que\b.*\bne\b(?!\s+pas\b)/i,
            /\bavant\s+que\b.*\bne\b(?!\s+pas\b)/i,
            /\bpeu\s+s'en\s+faut\b/i
        ];
        return expletivePatterns.some(pattern => pattern.test(text));
    }

    _checkLogicalPatterns(text) {
        const logicalPatterns = [
            /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i
        ];
        return logicalPatterns.some(pattern => pattern.test(text));
    }

    _determineClassification(modelResult, hasExpletivePatterns, hasLogicalPatterns) {
        // Process token classification results
        const entities = modelResult;
        let negationScore = 0;
        let evidence = [];

        // Analyze token classifications
        if (entities && entities.length > 0) {
            entities.forEach(entity => {
                if (entity.entity_group === 'B-NEGATION' || entity.entity_group === 'I-NEGATION') {
                    negationScore += entity.score;
                    evidence.push(\`Found negation marker: "\${entity.word}" (score: \${entity.score.toFixed(2)})\`);
                }
            });
        }

        // Normalize negation score
        negationScore = negationScore > 0 ? negationScore / entities.length : 0;

        // Combine with pattern evidence
        if (hasExpletivePatterns) {
            negationScore += 0.3;
            evidence.push('Expletive negation pattern detected');
        }
        if (hasLogicalPatterns) {
            negationScore -= 0.3;
            evidence.push('Logical negation pattern detected');
        }

        // Determine classification
        let type;
        let confidence;

        if (negationScore < 0.4) {
            type = 'LOGICAL';
            confidence = 1 - negationScore;
            evidence.push('Strong indicators of logical negation');
        } else if (negationScore > 0.6) {
            type = 'EXPLETIVE';
            confidence = negationScore;
            evidence.push('Strong indicators of expletive negation');
        } else {
            type = 'UNCERTAIN';
            confidence = 0.5;
            evidence.push('Mixed or unclear indicators');
        }

        return {
            type,
            confidence: Math.min(Math.max(confidence, 0), 0.95),
            evidence: evidence.join('\n')
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

export default CamemBERTClassifier;
