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
            // Test with simple sequence classification
            await this._retryOperation(async () => {
                return await this.inference.tokenClassification({
                    model: this.modelName,
                    endpointUrl: this.endpointUrl,
                    inputs: "Le chat est sur la table."
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
            console.log('Analyzing text with CamemBERT:', text);

            // Use token classification to identify parts of speech and negation
            const tokenResult = await this._retryOperation(async () => {
                return await this.inference.tokenClassification({
                    model: this.modelName,
                    endpointUrl: this.endpointUrl,
                    inputs: text
                });
            });

            console.log('Token classification result:', tokenResult);

            // Analyze the results
            const evidence = [];
            let isExpletive = false;
            let confidence = 0.5;

            // Analyze token patterns
            if (tokenResult && Array.isArray(tokenResult)) {
                // Look for verb forms and negation markers
                const tokens = tokenResult.map(t => ({
                    word: t.word,
                    entity: t.entity_group,
                    score: t.score
                }));

                console.log('Analyzed tokens:', tokens);

                // Check for subjunctive verbs
                const hasSubjunctive = tokens.some(t => 
                    t.entity === 'VERB' && 
                    /\b(?:soit|sois|soyons|soyez|soient|fasse|fasses|fassions|fassiez|fassent)\b/i.test(t.word)
                );

                if (hasSubjunctive) {
                    confidence += 0.2;
                    evidence.push("Mode subjonctif détecté dans l'analyse syntaxique");
                }
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

            // Check for logical negation markers
            const logicalMarkers = text.match(/\b(?:pas|point|plus|jamais|rien|personne|aucun|guère)\b/g);
            if (logicalMarkers) {
                isExpletive = false;
                confidence = Math.max(confidence + 0.3, 0.95);
                evidence.push(`Marqueurs de négation logique trouvés: ${logicalMarkers.join(', ')}`);
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
