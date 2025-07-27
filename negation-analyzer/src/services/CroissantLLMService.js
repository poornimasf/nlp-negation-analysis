import { HfInference } from '@huggingface/inference';

class CroissantLLMService {
    static instance = null;
    static MODEL_ID = 'croissantllm/CroissantLLMChat-v0.1';
    static MAX_RETRIES = 3;
    static RETRY_DELAY = 1000; // 1 second

    static async getInstance() {
        if (!this.instance) {
            const token = process.env.REACT_APP_HF_TOKEN;
            if (!token) {
                throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set');
            }

            try {
                this.instance = new HfInference(token);
                await this._testConnection();
                console.log('CroissantLLM service initialized successfully');
            } catch (error) {
                console.error('Failed to initialize CroissantLLM service:', error);
                this.instance = null;
                throw new Error(`CroissantLLM initialization failed: ${error.message}`);
            }
        }
        return this.instance;
    }

    static async _testConnection() {
        try {
            const response = await this.instance.textGeneration({
                model: this.MODEL_ID,
                inputs: 'Test connection. Répondez en une phrase.',
                parameters: {
                    max_new_tokens: 50,
                    temperature: 0.1,
                    top_p: 0.95
                }
            });

            if (!response?.generated_text) {
                throw new Error('No response from model');
            }
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }

    static async _retryOperation(operation, retries = this.MAX_RETRIES) {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed: ${error.message}`);
                lastError = error;
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (i + 1)));
                }
            }
        }
        throw lastError;
    }

    static async analyzeSyntax(text) {
        try {
            const hf = await this.getInstance();
            
            const prompt = `Cette phrase avait un 'ne' qui a été supprimé. Analyse la structure syntaxique et détermine si ce 'ne' manquant était une négation expletive ou logique:
'${text}'

Contexte: Le 'ne' a été retiré de cette phrase. Votre tâche est de prédire son type.

Format de réponse souhaité:
1. Type de négation (expletive/logique)
2. Confiance (0-1)
3. Justification syntaxique
4. Indices linguistiques`;

            const response = await this._retryOperation(async () => {
                return await hf.textGeneration({
                    model: this.MODEL_ID,
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 256,
                        temperature: 0.1,
                        top_p: 0.95,
                        repetition_penalty: 1.15
                    }
                });
            });

            return this.parseResponse(response.generated_text);
        } catch (error) {
            console.error('CroissantLLM analysis failed:', error);
            throw error;
        }
    }

    static parseResponse(text) {
        if (!text) {
            throw new Error('Empty response from model');
        }

        try {
            const lines = text.split('\n');
            const typeMatch = lines.find(l => l.includes('Type'))?.split(':')[1]?.trim().toLowerCase();
            const isExpletive = typeMatch?.includes('expletive') || typeMatch?.includes('expletif');
            const confidence = parseFloat(lines.find(l => l.includes('Confiance'))?.split(':')[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')[1]?.trim();
            const indices = lines.find(l => l.includes('Indices'))?.split(':')[1]?.trim();

            return {
                isExpletive,
                confidence,
                justification,
                indices,
                rawResponse: text
            };
        } catch (error) {
            console.error('Failed to parse LLM response:', error);
            return null;
        }
    }

    static async validatePattern(text, pattern) {
        try {
            const hf = await this.getInstance();
            
            const prompt = `Cette phrase avait un 'ne' supprimé. Vérifie si le motif '${pattern}' indique une négation expletive:
'${text}'

Contexte: Un 'ne' manque dans cette phrase. Le motif '${pattern}' suggère-t-il que ce 'ne' était expletif?

Format de réponse souhaité:
1. Motif expletif (oui/non)
2. Validité syntaxique (0-1)
3. Justification
4. Mode verbal attendu`;

            const response = await this._retryOperation(async () => {
                return await hf.textGeneration({
                    model: this.MODEL_ID,
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 256,
                        temperature: 0.1,
                        top_p: 0.95,
                        repetition_penalty: 1.15
                    }
                });
            });

            return this.parseValidationResponse(response.generated_text);
        } catch (error) {
            console.error('CroissantLLM validation failed:', error);
            throw error;
        }
    }

    static parseValidationResponse(text) {
        if (!text) {
            throw new Error('Empty validation response from model');
        }

        try {
            const lines = text.split('\n');
            const expletiveMatch = lines.find(l => l.includes('Motif expletif'))?.split(':')[1]?.trim().toLowerCase();
            const isExpletive = expletiveMatch === 'oui' || expletiveMatch?.includes('oui');
            const validity = parseFloat(lines.find(l => l.includes('Validité'))?.split(':')[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')[1]?.trim();
            const mood = lines.find(l => l.includes('Mode'))?.split(':')[1]?.trim();

            return {
                isExpletive,
                validity,
                justification,
                expectedMood: mood,
                rawResponse: text
            };
        } catch (error) {
            console.error('Failed to parse validation response:', error);
            return null;
        }
    }

    static async enhanceConfidence(text, initialConfidence, evidence) {
        try {
            const hf = await this.getInstance();
            
            const prompt = `Cette phrase avait un 'ne' supprimé. Analyse et ajuste le score de confiance pour prédire si ce 'ne' était expletif:
'${text}'

Score initial: ${initialConfidence}
Evidence actuelle: ${evidence}

Contexte: Nous prédisons le type d'un 'ne' manquant.

Format de réponse souhaité:
1. Score ajusté (0-1)
2. Justification
3. Facteurs décisifs`;

            const response = await this._retryOperation(async () => {
                return await hf.textGeneration({
                    model: this.MODEL_ID,
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 256,
                        temperature: 0.1,
                        top_p: 0.95,
                        repetition_penalty: 1.15
                    }
                });
            });

            return this.parseConfidenceResponse(response.generated_text);
        } catch (error) {
            console.error('CroissantLLM confidence enhancement failed:', error);
            throw error;
        }
    }

    static parseConfidenceResponse(text) {
        if (!text) {
            throw new Error('Empty confidence response from model');
        }

        try {
            const lines = text.split('\n');
            const adjustedScore = parseFloat(lines.find(l => l.includes('Score'))?.split(':')[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')[1]?.trim();
            const factors = lines.find(l => l.includes('Facteurs'))?.split(':')[1]?.trim();

            return {
                adjustedScore,
                justification,
                decisiveFactors: factors,
                rawResponse: text
            };
        } catch (error) {
            console.error('Failed to parse confidence response:', error);
            return null;
        }
    }
}

export default CroissantLLMService;
