import { HfInference } from '@huggingface/inference';

class CroissantLLMService {
    static instance = null;
    static MODEL_ID = 'croissantllm/CroissantLLMChat-v0.1';

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
            
            const prompt = `Cette phrase avait un 'ne' qui a été supprimé. Analyse la structure syntaxique et détermine si ce 'ne' manquant était une négation expletive ou logique:
'${text}'

Format de réponse souhaité:
1. Type de négation (expletive/logique)
2. Confiance (0-1)
3. Justification syntaxique
4. Indices linguistiques`;

            const response = await hf.textGeneration({
                model: this.MODEL_ID,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 256,
                    temperature: 0.1,
                    top_p: 0.95
                }
            });

            return this.parseResponse(response.generated_text);
        } catch (error) {
            throw error;
        }
    }

    static parseResponse(text) {
        if (!text) {
            throw new Error('Empty response from model');
        }

        try {
            const lines = text.split('\\n');
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
            return null;
        }
    }
}

export default CroissantLLMService;
