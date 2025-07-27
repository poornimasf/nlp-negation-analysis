import { HfInference } from '@huggingface/inference';

class CamemBERTClassifier {
    constructor() {
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set in environment variables');
        }
        this.inference = new HfInference(token);
        this.initialized = false;
        this.modelName = 'facebook/camembert-base';  // Updated to full model identifier
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Test with fill-mask task which is definitely supported
            await this.inference.fillMask({
                model: this.modelName,
                inputs: "Le chat est <mask> la table."
            });
            
            this.initialized = true;
            console.log('CamemBERT initialized successfully');
        } catch (error) {
            console.error('CamemBERT initialization error:', error);
            throw new Error(`CamemBERT initialization failed: ${error.message}`);
        }
    }

    async _retryOperation(operation) {
        let lastError;
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed:`, error);
                lastError = error;
                if (i < this.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
                }
            }
        }
        throw lastError;
    }

    async classifyNegation(text) {
        if (!text) {
            throw new Error('No text provided for classification');
        }

        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Use token classification to identify negation markers
            const tokenResult = await this._retryOperation(async () => {
                return await this.inference.tokenClassification({
                    model: this.modelName,
                    inputs: text,
                    parameters: {
                        aggregation_strategy: "simple"
                    }
                });
            });

            // Use zero-shot classification for negation type
            const classificationResult = await this._retryOperation(async () => {
                return await this.inference.zeroShotClassification({
                    model: this.modelName,
                    inputs: text,
                    parameters: {
                        candidate_labels: ["négation expletive", "négation logique"]
                    }
                });
            });

            // Combine results for final classification
            const isExpletive = classificationResult.labels[0] === "négation expletive";
            const confidence = classificationResult.scores[0];
            
            // Enhanced evidence collection
            const evidence = [];
            
            // Add token-level evidence
            if (tokenResult && tokenResult.length > 0) {
                evidence.push("Token Analysis:");
                tokenResult.forEach(token => {
                    if (token.score > 0.5) {
                        evidence.push(`- Found '${token.word}' (${Math.round(token.score * 100)}% confidence)`);
                    }
                });
            }

            // Add classification evidence
            evidence.push("\nClassification Analysis:");
            evidence.push(`- Primary prediction: ${classificationResult.labels[0]}`);
            evidence.push(`- Confidence: ${Math.round(confidence * 100)}%`);
            
            // Add any additional linguistic patterns found
            if (text.includes("que") || text.includes("qu'")) {
                evidence.push("- Contains 'que/qu'' construction");
            }
            if (/\b(peur|crainte)\b/.test(text)) {
                evidence.push("- Contains fear expression");
            }
            if (/\bavant\b/.test(text)) {
                evidence.push("- Contains temporal marker");
            }

            return {
                classification: isExpletive ? "EXPLETIVE NEGATION" : "LOGICAL NEGATION",
                confidence: confidence,
                evidence: evidence.join("\n")
            };
        } catch (error) {
            console.error('CamemBERT classification error:', error);
            throw new Error(`Classification failed: ${error.message}`);
        }
    }

    async _analyzeTokens(text) {
        try {
            const result = await this.inference.tokenClassification({
                model: this.modelName,
                inputs: text
            });
            return result;
        } catch (error) {
            console.error('Token analysis failed:', error);
            return null;
        }
    }
}

export default CamemBERTClassifier;
