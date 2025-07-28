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
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set');
        }

        // Remove 'hf_' prefix if present
        const cleanToken = token.startsWith('hf_') ? token.slice(3) : token;

        console.log('Making request to:', this.ENDPOINT_URL);
        console.log('Request payload:', {
            inputs: prompt,
            parameters: {
                max_new_tokens: 256,
                temperature: 0.1,
                top_p: 0.95,
                return_full_text: false
            }
        });

        const response = await fetch(this.ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cleanToken}`,
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
            const errorText = await response.text();
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}, error: ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        return result[0]?.generated_text || '';
    }

    static async analyzeSyntax(text) {
        try {
            console.log('Analyzing syntax:', text);
            
            const prompt = `Analyze this French sentence where a 'ne' has been removed, using both linguistic rules and world knowledge:

'${text}'

Consider the FULL context:
1. Semantic meaning and real-world implications
2. Common usage patterns in French
3. Speaker's likely intent
4. Real-world situations where this would be used
5. Cultural and pragmatic context

For example:
- "J'ai peur qu'il ne pleuve" - Consider: Is rain likely? Is this about preventing rain (logical) or expressing worry about rain (expletive)?
- "Avant qu'il ne parte" - Consider: Is this about preventing departure (logical) or timing before departure (expletive)?
- "Je crains qu'il ne soit malade" - Consider: Is this about preventing illness (logical) or expressing worry about possible illness (expletive)?

Format de réponse souhaité:
1. Type de négation (expletive/logique)
2. Confiance (0-1)
3. Justification syntaxique et sémantique
4. Indices linguistiques et contextuels`;

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
            
            const prompt = `Analyze this French sentence using both linguistic patterns and world knowledge:

'${text}'

Pattern found: '${pattern}'

Consider the FULL context:
1. Semantic meaning in real-world situations
2. Common usage in French discourse
3. Pragmatic implications
4. Cultural context
5. Speaker's likely intent

Examples to consider:
- With "peur que": Is this about preventing something (logical) or expressing anxiety (expletive)?
- With "avant que": Is this about timing (expletive) or preventing an action (logical)?
- With "craindre que": What's the real-world situation being described?

Format de réponse souhaité:
1. Motif expletif (oui/non)
2. Validité syntaxique (0-1)
3. Justification linguistique et pragmatique
4. Mode verbal et contexte d'usage`;

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
            
            const prompt = `Analyze this French sentence using both linguistic patterns and real-world knowledge:

'${text}'

Current analysis:
- Score initial: ${initialConfidence}
- Evidence actuelle: ${evidence}

Consider the FULL context:
1. Real-world implications of the sentence
2. Common usage patterns in French
3. Cultural and pragmatic context
4. Speaker's likely intent
5. Typical situations where this would be used

For example:
- With weather: "Je crains qu'il ne pleuve" - Is this about preventing rain (unlikely in real world) or expressing worry?
- With time: "Avant qu'il ne soit trop tard" - Is this about preventing lateness or expressing timing?
- With health: "J'ai peur qu'il ne soit malade" - Is this about preventing illness or expressing concern?

Format de réponse souhaité:
1. Score ajusté (0-1)
2. Justification sémantique et pragmatique
3. Facteurs contextuels décisifs`;

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

            // Start with moderate confidence for ambiguous patterns
            let adjustedConfidence = confidence || 0.5;

            // Lower confidence for ambiguous cases
            if (text.toLowerCase().includes('peur que') || 
                text.toLowerCase().includes('avant que') || 
                text.toLowerCase().includes('peu s\'en faut')) {
                // Only high confidence if there are clear additional indicators
                if (adjustedConfidence > 0.7) {
                    adjustedConfidence = 0.7;
                }
            }

            const result = {
                isExpletive,
                confidence: adjustedConfidence,
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

            // Adjust validity for ambiguous patterns
            let adjustedValidity = validity;
            if (text.toLowerCase().includes('peur que') || 
                text.toLowerCase().includes('avant que') || 
                text.toLowerCase().includes('peu s\'en faut')) {
                // Lower validity unless there are clear additional indicators
                if (adjustedValidity > 0.7) {
                    adjustedValidity = 0.7;
                }
            }

            const result = {
                isExpletive,
                validity: adjustedValidity,
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

            // Adjust confidence for ambiguous patterns
            let balancedScore = adjustedScore;
            if (text.toLowerCase().includes('peur que') || 
                text.toLowerCase().includes('avant que') || 
                text.toLowerCase().includes('peu s\'en faut')) {
                // Lower confidence unless there are clear additional indicators
                if (balancedScore > 0.7) {
                    balancedScore = 0.7;
                }
            }

            const result = {
                adjustedScore: balancedScore,
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
