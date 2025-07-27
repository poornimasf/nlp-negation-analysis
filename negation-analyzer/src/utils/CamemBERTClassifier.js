import { HfInference } from '@huggingface/inference';

class CamemBERTClassifier {
    constructor() {
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set in environment variables');
        }
        this.inference = new HfInference(token);
        this.initialized = false;
        this.modelName = 'camembert-base';
    }

    async initialize() {
        if (!this.initialized) {
            try {
                await this.inference.textClassification({
                    model: this.modelName,
                    inputs: 'Test de connexion.'
                });
                this.initialized = true;
            } catch (error) {
                throw new Error(`CamemBERT initialization failed: ${error.message}`);
            }
        }
    }

    async classifyNegation(text) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const result = await this.inference.textClassification({
                model: this.modelName,
                inputs: text
            });

            return {
                classification: result[0].label,
                confidence: result[0].score,
                evidence: `Model prediction: ${result[0].label} (${Math.round(result[0].score * 100)}% confidence)`
            };
        } catch (error) {
            throw new Error(`Classification failed: ${error.message}`);
        }
    }
}

export default CamemBERTClassifier;
