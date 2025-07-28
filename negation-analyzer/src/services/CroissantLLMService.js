import { HfInference } from '@huggingface/inference';

class CroissantLLMService {
    static instance = null;
    static MODEL_ID = 'croissantllm';
    static ENDPOINT_URL = 'https://frwk8k50dyslyiwo.us-east-1.aws.endpoints.huggingface.cloud';
    static MAX_RETRIES = 3;
    static RETRY_DELAY = 1000; // 1 second

    static async getInstance() {
        if (!this.instance) {
            const token = process.env.REACT_APP_HF_TOKEN;
            if (!token) {
                throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set');
            }
            this.instance = new HfInference(token);
        }
        return this.instance;
    }

    static async makeRequest(prompt) {
        const response = await fetch(this.ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 256,
                    temperature: 0.1,
                    top_p: 0.95,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result[0]?.generated_text || '';
    }

    static async analyzeSyntax(text) {
        try {
            console.log('Analyzing syntax:', text);
            
            const prompt = `Cette phrase avait un 'ne' qui a été supprimé. Analyse la structure syntaxique et détermine si ce 'ne' manquant était une négation expletive ou logique:
'${text}'

Format de réponse souhaité:
1. Type de négation (expletive/logique)
2. Confiance (0-1)
3. Justification syntaxique
4. Indices linguistiques`;

            const response = await this._retryOperation(() => this.makeRequest(prompt));
            console.log('Analysis response:', response);

            return this.parseResponse(response);
        } catch (error) {
            console.error('Syntax analysis failed:', error);
            throw error;
        }
    }

    static async validatePattern(text, pattern) {
        try {
            console.log('Validating pattern:', { text, pattern });
            
            const prompt = `Cette phrase avait un 'ne' supprimé. Vérifie si le motif '${pattern}' indique une négation expletive:
'${text}'

Contexte: Un 'ne' manque dans cette phrase. Le motif '${pattern}' suggère-t-il que ce 'ne' était expletif?

Format de réponse souhaité:
1. Motif expletif (oui/non)
2. Validité syntaxique (0-1)
3. Justification
4. Mode verbal attendu`;

            const response = await this._retryOperation(() => this.makeRequest(prompt));
            console.log('Validation response:', response);

            return this.parseValidationResponse(response);
        } catch (error) {
            console.error('Pattern validation failed:', error);
            throw error;
        }
    }

    static async enhanceConfidence(text, initialConfidence, evidence) {
        try {
            console.log('Enhancing confidence:', { text, initialConfidence, evidence });
            
            const prompt = `Cette phrase avait un 'ne' supprimé. Analyse et ajuste le score de confiance pour prédire si ce 'ne' était expletif:
'${text}'

Score initial: ${initialConfidence}
Evidence actuelle: ${evidence}

Format de réponse souhaité:
1. Score ajusté (0-1)
2. Justification
3. Facteurs décisifs`;

            const response = await this._retryOperation(() => this.makeRequest(prompt));
            console.log('Confidence enhancement response:', response);

            return this.parseConfidenceResponse(response);
        } catch (error) {
            console.error('Confidence enhancement failed:', error);
            throw error;
        }
    }

    static async _retryOperation(operation) {
        let lastError;
        for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed:`, error);
                lastError = error;
                if (i < this.MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
                }
            }
        }
        throw lastError;
    }

    static parseResponse(text) {
        if (!text) {
            throw new Error('Empty response from model');
        }

        try {
            console.log('Parsing response:', text);
            const lines = text.split('\n');
            const typeMatch = lines.find(l => l.includes('Type'))?.split(':')?.[1]?.trim().toLowerCase();
            const isExpletive = typeMatch?.includes('expletive') || typeMatch?.includes('expletif');
            const confidence = parseFloat(lines.find(l => l.includes('Confiance'))?.split(':')?.[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')?.[1]?.trim();
            const indices = lines.find(l => l.includes('Indices'))?.split(':')?.[1]?.trim();

            const result = {
                isExpletive,
                confidence,
                justification,
                indices,
                rawResponse: text
            };
            console.log('Parsed result:', result);
            return result;
        } catch (error) {
            console.error('Error parsing response:', error);
            return null;
        }
    }

    static parseValidationResponse(text) {
        if (!text) {
            throw new Error('Empty validation response from model');
        }

        try {
            console.log('Parsing validation response:', text);
            const lines = text.split('\n');
            const expletiveMatch = lines.find(l => l.includes('Motif expletif'))?.split(':')?.[1]?.trim().toLowerCase();
            const isExpletive = expletiveMatch === 'oui' || expletiveMatch?.includes('oui');
            const validity = parseFloat(lines.find(l => l.includes('Validité'))?.split(':')?.[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')?.[1]?.trim();
            const mood = lines.find(l => l.includes('Mode'))?.split(':')?.[1]?.trim();

            const result = {
                isExpletive,
                validity,
                justification,
                expectedMood: mood,
                rawResponse: text
            };
            console.log('Parsed validation result:', result);
            return result;
        } catch (error) {
            console.error('Error parsing validation response:', error);
            return null;
        }
    }

    static parseConfidenceResponse(text) {
        if (!text) {
            throw new Error('Empty confidence response from model');
        }

        try {
            console.log('Parsing confidence response:', text);
            const lines = text.split('\n');
            const adjustedScore = parseFloat(lines.find(l => l.includes('Score'))?.split(':')?.[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')?.[1]?.trim();
            const factors = lines.find(l => l.includes('Facteurs'))?.split(':')?.[1]?.trim();

            const result = {
                adjustedScore,
                justification,
                decisiveFactors: factors,
                rawResponse: text
            };
            console.log('Parsed confidence result:', result);
            return result;
        } catch (error) {
            console.error('Error parsing confidence response:', error);
            return null;
        }
    }
}

export default CroissantLLMService;
