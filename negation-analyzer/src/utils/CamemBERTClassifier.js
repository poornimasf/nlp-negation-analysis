import { HfInference } from '@huggingface/inference';

class CamemBERTClassifier {
    constructor() {
        // Check for token
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            console.error('No Hugging Face token found in environment variables');
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set in environment variables');
        }

        try {
            this.inference = new HfInference(token);
            this.initialized = false;
            this.modelName = 'camembert-base';
        } catch (error) {
            console.error('Error creating HfInference instance:', error);
            throw new Error('Failed to initialize Hugging Face inference client');
        }
    }

    async initialize() {
        if (!this.initialized) {
            try {
                console.log('Initializing CamemBERT with model:', this.modelName);
                
                // Test connection with a simple inference
                const testResult = await this.inference.textClassification({
                    model: this.modelName,
                    inputs: "Test connection"
                });

                console.log('CamemBERT test inference result:', testResult);
                this.initialized = true;
                console.log('CamemBERT initialized successfully');
            } catch (error) {
                console.error('Failed to initialize CamemBERT:', error);
                if (error.message.includes('401')) {
                    throw new Error('Invalid Hugging Face token - Please check your REACT_APP_HF_TOKEN');
                } else if (error.message.includes('404')) {
                    throw new Error('Model not found - Please check if camembert-base is available');
                } else {
                    throw new Error(`CamemBERT initialization failed: ${error.message}`);
                }
            }
        }
    }

    async classifyNegation(text) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // First, analyze the text for negation presence
            const result = await this.inference.textClassification({
                model: this.modelName,
                inputs: text
            });

            // Extract patterns that might indicate expletive negation
            const hasExpletivePatterns = this._checkExpletivePatterns(text);
            const hasLogicalPatterns = this._checkLogicalPatterns(text);
            
            // Combine model prediction with pattern analysis
            const classification = this._determineClassification(
                result[0],
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
            return {
                classification: 'UNCERTAIN',
                confidence: 0,
                evidence: 'Error during model prediction: ' + error.message
            };
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
        const score = modelResult.score;
        const label = modelResult.label;

        // Combine model prediction with pattern analysis
        if (score < 0.6) {
            return {
                type: 'UNCERTAIN',
                confidence: score,
                evidence: `Low confidence prediction (${(score * 100).toFixed(1)}%)`
            };
        }

        // Strong pattern indicators take precedence
        if (hasExpletivePatterns && !hasLogicalPatterns) {
            return {
                type: 'EXPLETIVE',
                confidence: Math.max(score, 0.8),
                evidence: 'Expletive negation patterns detected with high confidence'
            };
        }

        if (hasLogicalPatterns && !hasExpletivePatterns) {
            return {
                type: 'LOGICAL',
                confidence: Math.max(score, 0.8),
                evidence: 'Logical negation patterns detected with high confidence'
            };
        }

        // If both or no patterns found, rely more on model prediction
        const predictedType = label.includes('NEGATIVE') ? 'LOGICAL' : 'EXPLETIVE';
        return {
            type: predictedType,
            confidence: score,
            evidence: `Model prediction: ${predictedType} (${(score * 100).toFixed(1)}% confidence)`
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
                results.push({
                    classification: 'UNCERTAIN',
                    confidence: 0,
                    evidence: 'Error during analysis: ' + error.message
                });
            }
        }
        return results;
    }
}

export default CamemBERTClassifier;
