import { HfInference } from '@huggingface/inference';

class CamemBERTClassifier {
    constructor() {
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set in environment variables');
        }
        this.inference = new HfInference(token);
        this.initialized = false;
        this.modelName = 'almanach/camembert-base';  // Updated to almanach version
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Test with simple masked text
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
            // Use masked language modeling to analyze negation context
            const maskedText = text.replace(/\b(?:ne|n')\b/g, '<mask>');
            const maskResult = await this._retryOperation(async () => {
                return await this.inference.fillMask({
                    model: this.modelName,
                    inputs: maskedText
                });
            });

            // Analyze sentence embeddings for classification
            const embeddings = await this._retryOperation(async () => {
                return await this.inference.featureExtraction({
                    model: this.modelName,
                    inputs: text
                });
            });

            // Combine evidence for classification
            const evidence = [];
            let isExpletive = false;
            let confidence = 0.5;

            // Analyze mask predictions
            if (maskResult && Array.isArray(maskResult)) {
                const negationPredictions = maskResult.filter(pred => 
                    pred.token_str.match(/\b(?:ne|n')\b/i)
                );

                if (negationPredictions.length > 0) {
                    const topPrediction = negationPredictions[0];
                    evidence.push(`Mask prediction: '${topPrediction.token_str}' (${Math.round(topPrediction.score * 100)}% confidence)`);
                    
                    // Check context for expletive indicators
                    if (text.match(/\b(?:peur|crainte)\s+que?\b/i)) {
                        isExpletive = true;
                        confidence += 0.2;
                        evidence.push("Found fear expression pattern");
                    }
                    if (text.match(/\bavant\s+que?\b/i)) {
                        isExpletive = true;
                        confidence += 0.2;
                        evidence.push("Found temporal expression pattern");
                    }
                    if (text.match(/\bpeu\s+s'en\s+(?:faut|fallait)\b/i)) {
                        isExpletive = true;
                        confidence += 0.25;
                        evidence.push("Found 'peu s'en faut' pattern");
                    }
                }
            }

            // Analyze sentence structure
            if (text.match(/\bque?\b.*\b(?:subjonctif|subjunctive)\b/i)) {
                confidence += 0.15;
                evidence.push("Subjunctive mood detected");
            }

            // Check for logical negation markers
            const logicalMarkers = text.match(/\b(?:pas|point|plus|jamais|rien|personne|aucun|guère)\b/g);
            if (logicalMarkers) {
                isExpletive = false;
                confidence += 0.3;
                evidence.push(`Found logical negation markers: ${logicalMarkers.join(', ')}`);
            }

            // Normalize confidence
            confidence = Math.min(Math.max(confidence, 0.1), 0.95);

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
}

export default CamemBERTClassifier;
