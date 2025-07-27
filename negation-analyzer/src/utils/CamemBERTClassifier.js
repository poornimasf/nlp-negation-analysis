import { HfInference } from '@huggingface/inference';

class CamemBERTClassifier {
    constructor() {
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set in environment variables');
        }
        this.inference = new HfInference(token);
        this.initialized = false;
        this.modelName = 'https://blw2gc8euan45k1a.us-east-1.aws.endpoints.huggingface.cloud';  // Custom AWS endpoint
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Test with simple text classification
            await this._retryOperation(async () => {
                return await this.inference.textClassification({
                    model: this.modelName,
                    inputs: "Test de connexion."
                });
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
            // Use text classification for negation type
            const result = await this._retryOperation(async () => {
                return await this.inference.textClassification({
                    model: this.modelName,
                    inputs: text,
                    parameters: {
                        candidate_labels: ["négation expletive", "négation logique"]
                    }
                });
            });

            // Analyze the results
            const evidence = [];
            let isExpletive = false;
            let confidence = 0.5;

            if (result && result.labels) {
                const primaryLabel = result.labels[0];
                isExpletive = primaryLabel === "négation expletive";
                confidence = result.scores[0];
                evidence.push(`Classification principale: ${primaryLabel} (${Math.round(confidence * 100)}% confiance)`);
            }

            // Add pattern-based evidence
            if (text.match(/\b(?:peur|crainte)\s+que?\b/i)) {
                isExpletive = true;
                confidence = Math.min(confidence + 0.2, 0.95);
                evidence.push("Motif trouvé: expression de peur");
            }
            if (text.match(/\bavant\s+que?\b/i)) {
                isExpletive = true;
                confidence = Math.min(confidence + 0.2, 0.95);
                evidence.push("Motif trouvé: expression temporelle");
            }
            if (text.match(/\bpeu\s+s'en\s+(?:faut|fallait)\b/i)) {
                isExpletive = true;
                confidence = Math.min(confidence + 0.25, 0.95);
                evidence.push("Motif trouvé: 'peu s'en faut'");
            }

            // Check for subjunctive mood
            if (text.match(/\b(?:soit|sois|soyons|soyez|soient|fasse|fasses|fassions|fassiez|fassent)\b/i)) {
                confidence = Math.min(confidence + 0.15, 0.95);
                evidence.push("Mode subjonctif détecté");
            }

            // Check for logical negation markers
            const logicalMarkers = text.match(/\b(?:pas|point|plus|jamais|rien|personne|aucun|guère)\b/g);
            if (logicalMarkers) {
                isExpletive = false;
                confidence = Math.max(confidence + 0.3, 0.95);
                evidence.push(`Marqueurs de négation logique trouvés: ${logicalMarkers.join(', ')}`);
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
}

export default CamemBERTClassifier;
