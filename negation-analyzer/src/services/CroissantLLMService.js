import { HfInference } from '@huggingface/inference';

class CroissantLLMService {
    static instance = null;
    static MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.3';  // Updated to latest Mistral version

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

    static async analyzeSyntax(text) {
        try {
            const hf = await this.getInstance();
            
            const prompt = `<s>[INST] Analyze this French sentence where a 'ne' has been removed. Determine if the missing 'ne' was an expletive or logical negation:

'${text}'

Please provide your analysis in French following this format:
1. Type de négation (expletive/logique)
2. Confiance (0-1)
3. Justification syntaxique
4. Indices linguistiques [/INST]</s>`;

            const response = await hf.textGeneration({
                model: this.MODEL_ID,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 512,
                    temperature: 0.1,
                    top_p: 0.95,
                    return_full_text: false
                }
            });

            return this.parseResponse(response.generated_text);
        } catch (error) {
            throw error;
        }
    }

    static async validatePattern(text, pattern) {
        try {
            const hf = await this.getInstance();
            
            const prompt = `<s>[INST] Analyze this French sentence where a 'ne' has been removed. Check if the pattern '${pattern}' indicates an expletive negation:

'${text}'

Context: A 'ne' is missing from this sentence. Does the pattern '${pattern}' suggest it was an expletive 'ne'?

Please respond in French following this format:
1. Motif expletif (oui/non)
2. Validité syntaxique (0-1)
3. Justification
4. Mode verbal attendu [/INST]</s>`;

            const response = await hf.textGeneration({
                model: this.MODEL_ID,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 512,
                    temperature: 0.1,
                    top_p: 0.95,
                    return_full_text: false
                }
            });

            return this.parseValidationResponse(response.generated_text);
        } catch (error) {
            throw error;
        }
    }

    static async enhanceConfidence(text, initialConfidence, evidence) {
        try {
            const hf = await this.getInstance();
            
            const prompt = `<s>[INST] Analyze this French sentence where a 'ne' has been removed and adjust the confidence score for predicting if it was an expletive negation:

'${text}'

Initial score: ${initialConfidence}
Current evidence: ${evidence}

Please respond in French following this format:
1. Score ajusté (0-1)
2. Justification
3. Facteurs décisifs [/INST]</s>`;

            const response = await hf.textGeneration({
                model: this.MODEL_ID,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 512,
                    temperature: 0.1,
                    top_p: 0.95,
                    return_full_text: false
                }
            });

            return this.parseConfidenceResponse(response.generated_text);
        } catch (error) {
            throw error;
        }
    }

    static parseResponse(text) {
        if (!text) {
            throw new Error('Empty response from model');
        }

        try {
            const lines = text.split('\n');
            const typeMatch = lines.find(l => l.includes('Type'))?.split(':')?.[1]?.trim().toLowerCase();
            const isExpletive = typeMatch?.includes('expletive') || typeMatch?.includes('expletif');
            const confidence = parseFloat(lines.find(l => l.includes('Confiance'))?.split(':')?.[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')?.[1]?.trim();
            const indices = lines.find(l => l.includes('Indices'))?.split(':')?.[1]?.trim();

            return {
                isExpletive,
                confidence,
                justification,
                indices,
                rawResponse: text
            };
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
            const lines = text.split('\n');
            const expletiveMatch = lines.find(l => l.includes('Motif expletif'))?.split(':')?.[1]?.trim().toLowerCase();
            const isExpletive = expletiveMatch === 'oui' || expletiveMatch?.includes('oui');
            const validity = parseFloat(lines.find(l => l.includes('Validité'))?.split(':')?.[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')?.[1]?.trim();
            const mood = lines.find(l => l.includes('Mode'))?.split(':')?.[1]?.trim();

            return {
                isExpletive,
                validity,
                justification,
                expectedMood: mood,
                rawResponse: text
            };
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
            const lines = text.split('\n');
            const adjustedScore = parseFloat(lines.find(l => l.includes('Score'))?.split(':')?.[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')?.[1]?.trim();
            const factors = lines.find(l => l.includes('Facteurs'))?.split(':')?.[1]?.trim();

            return {
                adjustedScore,
                justification,
                decisiveFactors: factors,
                rawResponse: text
            };
        } catch (error) {
            console.error('Error parsing confidence response:', error);
            return null;
        }
    }
}

export default CroissantLLMService;
