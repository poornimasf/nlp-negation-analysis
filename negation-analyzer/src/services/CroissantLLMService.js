import { HfInference } from '@huggingface/inference';

const MODEL_ID = 'croissantllm/CroissantLLMChat-v0.1';
const hf = new HfInference(process.env.REACT_APP_HF_TOKEN);

class CroissantLLMService {
    static async analyzeSyntax(text) {
        try {
            const prompt = `Analyse la structure syntaxique de cette phrase et identifie les marqueurs de négation expletive:
            "${text}"
            
            Format de réponse souhaité:
            1. Structure syntaxique
            2. Marqueurs de négation
            3. Confiance (0-1)
            4. Justification`;

            const response = await hf.textGeneration({
                model: MODEL_ID,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 256,
                    temperature: 0.3,
                    top_p: 0.95,
                    repetition_penalty: 1.15
                }
            });

            return this.parseResponse(response.generated_text);
        } catch (error) {
            console.error('CroissantLLM analysis failed:', error);
            return null;
        }
    }

    static parseResponse(text) {
        try {
            // Extract structured information from the response
            const lines = text.split('\n');
            const structure = lines.find(l => l.includes('Structure'))?.split(':')[1]?.trim();
            const markers = lines.find(l => l.includes('Marqueurs'))?.split(':')[1]?.trim();
            const confidence = parseFloat(lines.find(l => l.includes('Confiance'))?.split(':')[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')[1]?.trim();

            return {
                structure,
                markers,
                confidence,
                justification,
                rawResponse: text
            };
        } catch (error) {
            console.error('Failed to parse LLM response:', error);
            return null;
        }
    }

    static async validatePattern(text, pattern) {
        try {
            const prompt = `Vérifie si cette phrase contient le motif "${pattern}" et analyse sa validité syntaxique:
            "${text}"
            
            Format de réponse souhaité:
            1. Motif trouvé (oui/non)
            2. Position du motif
            3. Validité syntaxique (0-1)
            4. Justification`;

            const response = await hf.textGeneration({
                model: MODEL_ID,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 256,
                    temperature: 0.3,
                    top_p: 0.95,
                    repetition_penalty: 1.15
                }
            });

            return this.parseValidationResponse(response.generated_text);
        } catch (error) {
            console.error('CroissantLLM validation failed:', error);
            return null;
        }
    }

    static parseValidationResponse(text) {
        try {
            const lines = text.split('\n');
            const found = lines.find(l => l.includes('Motif trouvé'))?.split(':')[1]?.trim().toLowerCase() === 'oui';
            const position = lines.find(l => l.includes('Position'))?.split(':')[1]?.trim();
            const validity = parseFloat(lines.find(l => l.includes('Validité'))?.split(':')[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')[1]?.trim();

            return {
                found,
                position,
                validity,
                justification,
                rawResponse: text
            };
        } catch (error) {
            console.error('Failed to parse validation response:', error);
            return null;
        }
    }

    static async enhanceConfidence(text, initialConfidence, evidence) {
        try {
            const prompt = `Analyse cette phrase et ajuste le score de confiance pour la négation expletive:
            "${text}"
            
            Score initial: ${initialConfidence}
            Evidence actuelle: ${evidence}
            
            Format de réponse souhaité:
            1. Score ajusté (0-1)
            2. Justification
            3. Suggestions d'amélioration`;

            const response = await hf.textGeneration({
                model: MODEL_ID,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 256,
                    temperature: 0.3,
                    top_p: 0.95,
                    repetition_penalty: 1.15
                }
            });

            return this.parseConfidenceResponse(response.generated_text);
        } catch (error) {
            console.error('CroissantLLM confidence enhancement failed:', error);
            return null;
        }
    }

    static parseConfidenceResponse(text) {
        try {
            const lines = text.split('\n');
            const adjustedScore = parseFloat(lines.find(l => l.includes('Score'))?.split(':')[1]?.trim()) || 0;
            const justification = lines.find(l => l.includes('Justification'))?.split(':')[1]?.trim();
            const suggestions = lines.find(l => l.includes('Suggestions'))?.split(':')[1]?.trim();

            return {
                adjustedScore,
                justification,
                suggestions,
                rawResponse: text
            };
        } catch (error) {
            console.error('Failed to parse confidence response:', error);
            return null;
        }
    }
}

export default CroissantLLMService;
