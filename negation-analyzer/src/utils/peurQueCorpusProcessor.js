/**
 * PeurQueCorpusProcessor - Processes 798 "peur que" examples to extract patterns
 * Analyzes syntactic, semantic, and discourse features for expletive prediction
 */

class PeurQueCorpusProcessor {
    constructor() {
        this.corpusData = [];
        this.analysisResults = {
            syntactic: {},
            semantic: {},
            discourse: {},
            overall: {}
        };
    }

    /**
     * Process raw corpus text into structured examples
     */
    processRawCorpus(withExpletiveText, withoutExpletiveText) {
        console.log('🔍 Processing raw corpus data...');
        
        // Split and clean examples
        const withExpletiveExamples = this.extractSentences(withExpletiveText, true);
        const withoutExpletiveExamples = this.extractSentences(withoutExpletiveText, false);
        
        console.log(`✅ Extracted ${withExpletiveExamples.length} WITH expletive examples`);
        console.log(`✅ Extracted ${withoutExpletiveExamples.length} WITHOUT expletive examples`);
        
        // Combine and structure data
        this.corpusData = [
            ...withExpletiveExamples,
            ...withoutExpletiveExamples
        ];
        
        console.log(`📊 Total corpus size: ${this.corpusData.length} examples`);
        return this.corpusData;
    }

    extractSentences(text, hasExpletive) {
        // Split by sentence boundaries, looking for "peur que" constructions
        const sentences = text.split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 10 && /peur\s+qu[e']/i.test(s));
        
        return sentences.map((sentence, index) => ({
            id: `${hasExpletive ? 'exp' : 'noexp'}_${index}`,
            text: sentence,
            has_expletive_ne: hasExpletive,
            classification: hasExpletive, // For compatibility with existing format
            trigger: 'peur que',
            ne_position: hasExpletive ? this.findNePosition(sentence) : null
        }));
    }

    findNePosition(sentence) {
        // Simple heuristic to find "ne" position in expletive examples
        const neMatch = sentence.match(/\bne\b/i);
        return neMatch ? neMatch.index : null;
    }

    /**
     * Analyze corpus for syntactic patterns
     */
    analyzeSyntacticPatterns() {
        console.log('🔍 Analyzing syntactic patterns...');
        
        const patterns = {
            subjectTypes: {
                firstPersonSingular: /\bj'(?:ai|avais|aurai|aurais)\s+peur\s+qu[e']/i,
                thirdPersonSingular: /\b(?:il|elle)\s+(?:a|avait|aura|aurait)\s+peur\s+qu[e']/i,
                impersonal: /\b(?:on|la\s+personne|les\s+gens)\s+(?:a|ont|avait|avaient)\s+peur\s+qu[e']/i
            },
            verbTenses: {
                present: /\b(?:ai|as|a|avons|avez|ont)\s+peur\s+qu[e']/i,
                imperfect: /\b(?:avais|avait|avions|aviez|avaient)\s+peur\s+qu[e']/i,
                future: /\b(?:aurai|auras|aura|aurons|aurez|auront)\s+peur\s+qu[e']/i
            },
            intensifiers: {
                high: /\b(?:très|tellement|si|vraiment|énormément)\s+peur\s+qu[e']/i,
                medium: /\b(?:un\s+peu|assez|plutôt)\s+peur\s+qu[e']/i,
                none: /^(?!.*(?:très|tellement|si|vraiment|énormément|un\s+peu|assez|plutôt)).*peur\s+qu[e']/i
            }
        };

        const results = {};
        
        for (const [category, categoryPatterns] of Object.entries(patterns)) {
            results[category] = {};
            
            for (const [type, pattern] of Object.entries(categoryPatterns)) {
                const matches = this.corpusData.filter(example => pattern.test(example.text));
                const expletiveMatches = matches.filter(example => example.has_expletive_ne);
                
                results[category][type] = {
                    totalCount: matches.length,
                    expletiveCount: expletiveMatches.length,
                    expletiveRate: matches.length > 0 ? expletiveMatches.length / matches.length : 0,
                    examples: matches.slice(0, 3).map(ex => ex.text) // Sample examples
                };
            }
        }

        this.analysisResults.syntactic = results;
        return results;
    }

    /**
     * Analyze corpus for semantic domain patterns
     */
    analyzeSemanticDomains() {
        console.log('🔍 Analyzing semantic domains...');
        
        const domains = {
            medical: [
                /\b(?:stérilisation|opération|chirurgie|médecin|vétérinaire|santé|maladie|symptôme)\b/i,
                /\b(?:médicament|traitement|diagnostic|examen|consultation|docteur|hôpital)\b/i
            ],
            safety: [
                /\b(?:chuter|tomber|accident|danger|sécurité|blesser|faire\s+mal)\b/i,
                /\b(?:risque|prudence|attention|éviter|protéger|laisse|tirer)\b/i
            ],
            interpersonal: [
                /\b(?:quitter|partir|abandonner|laisser|relation|couple|mariage)\b/i,
                /\b(?:amour|cœur|sentiment|émotion|jalousie|confiance|copain|copine)\b/i,
                /\b(?:mari|femme|ami|famille|enfant|parent|akatsuki)\b/i
            ],
            psychological: [
                /\b(?:humeur|caractère|personnalité|mental|psychologique)\b/i,
                /\b(?:stress|anxiété|angoisse|dépression|nerveux|boule\s+au\s+ventre)\b/i,
                /\b(?:comportement|réaction|attitude|dessus|prendre\s+le\s+dessus)\b/i
            ],
            physical: [
                /\b(?:bouche|corps|physique|toucher|contact|remplir)\b/i,
                /\b(?:faire|prendre|donner|action|arriver|quelque\s+chose)\b/i
            ],
            temporal: [
                /\b(?:temps|heure|moment|instant|aujourd'hui|demain|bientôt)\b/i,
                /\b(?:maintenant|actuellement|en\s+ce\s+moment|tout\s+de\s+suite)\b/i
            ]
        };

        const results = {};
        
        for (const [domain, patterns] of Object.entries(domains)) {
            const matches = this.corpusData.filter(example => 
                patterns.some(pattern => pattern.test(example.text))
            );
            const expletiveMatches = matches.filter(example => example.has_expletive_ne);
            
            results[domain] = {
                totalCount: matches.length,
                expletiveCount: expletiveMatches.length,
                expletiveRate: matches.length > 0 ? expletiveMatches.length / matches.length : 0,
                examples: matches.slice(0, 3).map(ex => ({
                    text: ex.text,
                    hasExpletive: ex.has_expletive_ne
                }))
            };
        }

        this.analysisResults.semantic = results;
        return results;
    }

    /**
     * Analyze corpus for discourse markers
     */
    analyzeDiscourseMarkers() {
        console.log('🔍 Analyzing discourse markers...');
        
        const markers = {
            register: {
                formal: [
                    /\b(?:doit|devrait|il\s+convient|il\s+faut|nécessaire)\b/i,
                    /\b(?:personne\s+âgée|sécurité|professionnel|madame|monsieur)\b/i
                ],
                informal: [
                    /\b(?:mon\s+cœur|j'ai\s+la\s+boule|ça\s+va|super|cool)\b/i,
                    /\b(?:copain|copine|pote|mec|nana|fifa)\b/i,
                    /\b(?:bcp|veto|medocs|du\s+coup)\b/i // Abbreviations and colloquialisms
                ]
            },
            emotionalIntensity: {
                high: [
                    /\b(?:boule\s+au\s+ventre|angoisse|terreur|panique|énormément)\b/i,
                    /\b(?:tellement|vraiment\s+très|je\s+prie|yeux\s+rouge)\b/i
                ],
                medium: [
                    /\b(?:inquiète|souci|préoccupe|nerveux|un\s+peu)\b/i,
                    /\b(?:assez|plutôt|quelque\s+peu)\b/i
                ],
                low: [
                    /\b(?:peut-être|possiblement|éventuellement)\b/i,
                    /\b(?:légèrement|faiblement|un\s+petit\s+peu)\b/i
                ]
            },
            temporality: {
                immediate: [
                    /\b(?:maintenant|aujourd'hui|demain|bientôt|tout\s+de\s+suite)\b/i,
                    /\b(?:en\s+ce\s+moment|actuellement|présentement)\b/i
                ],
                hypothetical: [
                    /\b(?:si|dans\s+le\s+cas|supposons|imaginons)\b/i,
                    /\b(?:peut-être|possiblement|éventuellement)\b/i
                ]
            }
        };

        const results = {};
        
        for (const [category, subcategories] of Object.entries(markers)) {
            results[category] = {};
            
            for (const [subtype, patterns] of Object.entries(subcategories)) {
                const matches = this.corpusData.filter(example => 
                    patterns.some(pattern => pattern.test(example.text))
                );
                const expletiveMatches = matches.filter(example => example.has_expletive_ne);
                
                results[category][subtype] = {
                    totalCount: matches.length,
                    expletiveCount: expletiveMatches.length,
                    expletiveRate: matches.length > 0 ? expletiveMatches.length / matches.length : 0,
                    examples: matches.slice(0, 2).map(ex => ({
                        text: ex.text.substring(0, 100) + '...',
                        hasExpletive: ex.has_expletive_ne
                    }))
                };
            }
        }

        this.analysisResults.discourse = results;
        return results;
    }

    /**
     * Generate comprehensive corpus analysis report
     */
    generateAnalysisReport() {
        console.log('📊 Generating comprehensive analysis report...');
        
        const report = {
            corpusOverview: {
                totalExamples: this.corpusData.length,
                withExpletive: this.corpusData.filter(ex => ex.has_expletive_ne).length,
                withoutExpletive: this.corpusData.filter(ex => !ex.has_expletive_ne).length,
                overallExpletiveRate: this.corpusData.filter(ex => ex.has_expletive_ne).length / this.corpusData.length
            },
            syntacticPatterns: this.analysisResults.syntactic,
            semanticDomains: this.analysisResults.semantic,
            discourseMarkers: this.analysisResults.discourse,
            keyFindings: this.extractKeyFindings()
        };

        return report;
    }

    extractKeyFindings() {
        const findings = [];
        
        // Syntactic findings
        const syntactic = this.analysisResults.syntactic;
        if (syntactic.subjectTypes) {
            const firstPerson = syntactic.subjectTypes.firstPersonSingular?.expletiveRate || 0;
            const thirdPerson = syntactic.subjectTypes.thirdPersonSingular?.expletiveRate || 0;
            
            if (Math.abs(firstPerson - thirdPerson) > 0.1) {
                findings.push(`Subject type effect: First person (${(firstPerson * 100).toFixed(1)}%) vs Third person (${(thirdPerson * 100).toFixed(1)}%) expletive rates`);
            }
        }

        // Semantic findings
        const semantic = this.analysisResults.semantic;
        const domainRates = Object.entries(semantic)
            .map(([domain, data]) => ({ domain, rate: data.expletiveRate }))
            .sort((a, b) => b.rate - a.rate);
        
        if (domainRates.length > 0) {
            findings.push(`Highest expletive domain: ${domainRates[0].domain} (${(domainRates[0].rate * 100).toFixed(1)}%)`);
            findings.push(`Lowest expletive domain: ${domainRates[domainRates.length - 1].domain} (${(domainRates[domainRates.length - 1].rate * 100).toFixed(1)}%)`);
        }

        // Discourse findings
        const discourse = this.analysisResults.discourse;
        if (discourse.register) {
            const formal = discourse.register.formal?.expletiveRate || 0;
            const informal = discourse.register.informal?.expletiveRate || 0;
            
            if (Math.abs(formal - informal) > 0.1) {
                findings.push(`Register effect: Formal (${(formal * 100).toFixed(1)}%) vs Informal (${(informal * 100).toFixed(1)}%) expletive rates`);
            }
        }

        return findings;
    }

    /**
     * Export corpus data in training format
     */
    exportTrainingData() {
        return {
            examples: this.corpusData.map(example => ({
                text: example.text,
                has_expletive_ne: example.has_expletive_ne,
                classification: example.classification,
                trigger: example.trigger,
                ne_position: example.ne_position
            }))
        };
    }

    /**
     * Main processing pipeline
     */
    async processCorpus(withExpletiveText, withoutExpletiveText) {
        console.log('🚀 Starting corpus processing pipeline...');
        
        // Step 1: Process raw text
        this.processRawCorpus(withExpletiveText, withoutExpletiveText);
        
        // Step 2: Analyze patterns
        await this.analyzeSyntacticPatterns();
        await this.analyzeSemanticDomains();
        await this.analyzeDiscourseMarkers();
        
        // Step 3: Generate report
        const report = this.generateAnalysisReport();
        
        console.log('✅ Corpus processing complete!');
        return report;
    }
}

module.exports = PeurQueCorpusProcessor;
