import { HfInference } from '@huggingface/inference';

class CamemBERTClassifier {
    constructor() {
        const token = process.env.REACT_APP_HF_TOKEN;
        if (!token) {
            throw new Error('Missing HF_TOKEN - Please ensure REACT_APP_HF_TOKEN is set in environment variables');
        }
        this.inference = new HfInference(token);
        this.initialized = false;
        this.modelName = 'camembert';  // Base model identifier
        this.endpointUrl = 'https://blw2gc8euan45k1a.us-east-1.aws.endpoints.huggingface.cloud';  // Custom endpoint
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Test with direct API call
            const response = await fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: "Le chat est sur la table."
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await response.json(); // Validate response format
            
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
            console.log('Analyzing text with CamemBERT:', text);

            // Make direct API call
            const response = await fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: text
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('CamemBERT raw response:', result);

            // Analyze the results
            const evidence = [];
            let isExpletive = false;
            let confidence = 0.5;

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

            // Analyze model output if available
            if (result && Array.isArray(result)) {
                // Look for relevant tokens and their scores
                const relevantTokens = result.filter(token => 
                    token.score > 0.5 && 
                    (token.entity_group === 'B-NEG' || token.entity_group === 'I-NEG')
                );

                if (relevantTokens.length > 0) {
                    evidence.push('Analyse CamemBERT:');
                    relevantTokens.forEach(token => {
                        evidence.push(`- Token '${token.word}': ${Math.round(token.score * 100)}% confiance`);
                    });
                }
            }

            const finalResult = {
                classification: isExpletive ? "EXPLETIVE NEGATION" : "LOGICAL NEGATION",
                confidence: confidence,
                evidence: evidence.join("\n")
            };

            console.log('Final classification:', finalResult);
            return finalResult;

        } catch (error) {
            console.error('CamemBERT classification error:', error);
            throw new Error(`Classification failed: ${error.message}`);
        }
    }
}

export default CamemBERTClassifier;
