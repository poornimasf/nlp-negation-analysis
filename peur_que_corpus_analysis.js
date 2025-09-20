/**
 * Comprehensive Analysis of "Peur Que" Corpus
 * Analyzing 798 balanced examples to extract patterns for enhanced prediction
 */

class PeurQueCorpusAnalyzer {
    constructor() {
        this.withoutExpletiveCount = 0;
        this.withExpletiveCount = 0;
        this.patterns = {
            syntactic: {
                subjectTypes: new Map(),
                verbTenses: new Map(),
                intensifiers: new Map(),
                negationMarkers: new Map()
            },
            semantic: {
                domains: new Map(),
                emotionalIntensity: new Map(),
                temporality: new Map()
            },
            discourse: {
                register: new Map(),
                sentenceComplexity: new Map(),
                contextualFactors: new Map()
            }
        };
    }

    analyzeCorpus(sentences) {
        const results = {
            withoutExpletive: [],
            withExpletive: [],
            patterns: this.patterns,
            statistics: {}
        };

        sentences.forEach(sentence => {
            if (sentence.includes('===WITHOUT EXPLETIVE===')) {
                this.analyzeWithoutExpletiveSection(sentence, results);
            } else if (sentence.includes('===WITH EXPLETIVE===')) {
                this.analyzeWithExpletiveSection(sentence, results);
            }
        });

        results.statistics = this.calculateStatistics();
        return results;
    }

    analyzeWithoutExpletiveSection(text, results) {
        const sentences = this.extractSentences(text);
        sentences.forEach(sentence => {
            if (this.containsPeurQue(sentence)) {
                this.withoutExpletiveCount++;
                const analysis = this.analyzeSentence(sentence, false);
                results.withoutExpletive.push(analysis);
                this.updatePatterns(analysis, false);
            }
        });
    }

    analyzeWithExpletiveSection(text, results) {
        const sentences = this.extractSentences(text);
        sentences.forEach(sentence => {
            if (this.containsPeurQue(sentence)) {
                this.withExpletiveCount++;
                const analysis = this.analyzeSentence(sentence, true);
                results.withExpletive.push(analysis);
                this.updatePatterns(analysis, true);
            }
        });
    }

    extractSentences(text) {
        // Remove section markers and split into sentences
        const cleanText = text.replace(/===.*?===/g, '');
        return cleanText.split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }

    containsPeurQue(sentence) {
        return /\bpeur\s+qu[e']/i.test(sentence);
    }

    analyzeSentence(sentence, hasExpletive) {
        return {
            text: sentence.substring(0, 200) + (sentence.length > 200 ? '...' : ''),
            hasExpletive: hasExpletive,
            syntactic: this.analyzeSyntactic(sentence),
            semantic: this.analyzeSemantic(sentence),
            discourse: this.analyzeDiscourse(sentence),
            confidence: this.calculateConfidence(sentence)
        };
    }

    analyzeSyntactic(sentence) {
        const analysis = {
            subjectType: this.identifySubjectType(sentence),
            verbTense: this.identifyVerbTense(sentence),
            intensifiers: this.findIntensifiers(sentence),
            negationMarkers: this.findNegationMarkers(sentence)
        };

        return analysis;
    }

    identifySubjectType(sentence) {
        // Extract subject patterns around "peur que"
        const peurQueMatch = sentence.match(/peur\s+qu[e']\s*([^,.\s]+(?:\s+[^,.\s]+)*)/i);
        if (!peurQueMatch) return 'unknown';

        const followingText = peurQueMatch[1];
        
        if (/^(il|elle|on|ils|elles)\b/i.test(followingText)) return 'pronoun';
        if (/^(le|la|les|un|une|des|ce|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs)\s+/i.test(followingText)) return 'determiner_noun';
        if (/^[A-Z][a-z]+/.test(followingText)) return 'proper_noun';
        
        return 'other';
    }

    identifyVerbTense(sentence) {
        // Look for subjunctive patterns after "peur que"
        const subjunctivePatterns = [
            /peur\s+qu[e']\s*\w+\s+(soit|ait|fasse|vienne|aille|puisse|veuille|sache|doive)/i,
            /peur\s+qu[e']\s*\w+\s+\w+\s+(soit|ait|fasse|vienne|aille|puisse|veuille|sache|doive)/i,
            /peur\s+qu[e']\s*\w+.*?(e|es|ent)(?:\s|$|[,.!?])/i
        ];

        for (const pattern of subjunctivePatterns) {
            if (pattern.test(sentence)) return 'subjunctive';
        }

        return 'other';
    }

    findIntensifiers(sentence) {
        const intensifiers = [];
        const patterns = [
            /\b(très|trop|si|tellement|vraiment|extrêmement|particulièrement)\s+peur/i,
            /\b(grande|grosse|énorme|terrible|horrible)\s+peur/i,
            /peur\s+(terrible|horrible|affreuse|énorme)/i
        ];

        patterns.forEach(pattern => {
            const match = sentence.match(pattern);
            if (match) intensifiers.push(match[1].toLowerCase());
        });

        return intensifiers;
    }

    findNegationMarkers(sentence) {
        const markers = [];
        const patterns = [
            /\b(pas|jamais|plus|rien|personne|aucun|nulle?)\b/gi,
            /\bn[e'](?:(?:pas|jamais|plus|rien|personne|aucun|nulle?)|$)/gi
        ];

        patterns.forEach(pattern => {
            const matches = sentence.match(pattern);
            if (matches) markers.push(...matches.map(m => m.toLowerCase()));
        });

        return markers;
    }

    analyzeSemantic(sentence) {
        return {
            domain: this.identifySemanticDomain(sentence),
            emotionalIntensity: this.assessEmotionalIntensity(sentence),
            temporality: this.identifyTemporality(sentence)
        };
    }

    identifySemanticDomain(sentence) {
        const domains = {
            medical: /\b(maladie|médecin|hôpital|santé|docteur|traitement|symptôme|douleur|blessure|infection|virus|cancer|opération|chirurgie|médicament|diagnostic|patient|soigner|guérir|mort|mourir|décès|décéder|agoniser|souffrir|mal|blessé|malade|hospitalisé|urgence|ambulance|clinique|pharmacie|infirmier|vétérinaire|veto)\b/i,
            
            safety: /\b(danger|dangereux|risque|accident|blessure|blesser|tomber|chuter|casser|briser|exploser|feu|incendie|voiture|route|conduire|sécurité|protéger|protection|police|vol|voler|cambriolage|agression|attaque|violence|violent|arme|guerre|combat|bataille|mort|tuer|assassiner|crime|criminel|prison|emprisonner|arrêter|fuir|échapper|perdre|disparaître|enlever|kidnapper|séquestrer)\b/i,
            
            interpersonal: /\b(amour|aimer|amoureuse?|relation|couple|mariage|épouser|famille|enfant|parent|ami|amitié|confiance|trahir|mentir|quitter|partir|abandonner|laisser|seul|solitude|jalousie|jaloux|colère|fâcher|dispute|conflit|réconciliation|pardon|pardonner|comprendre|écouter|parler|dire|avouer|révéler|secret|cacher|honte|gêne|timide|embarrasser|rougir|pleurer|larme|tristesse|joie|bonheur|sourire|rire|embrasser|baiser|caresser|toucher|tendresse|doux|gentil|méchant|cruel)\b/i,
            
            psychological: /\b(stress|angoisse|anxiété|dépression|déprimé|panique|phobique|phobie|traumatisme|traumatisé|psychologue|psychiatre|thérapie|mental|psychique|esprit|pensée|penser|réfléchir|souvenir|mémoire|oublier|rêve|cauchemar|dormir|sommeil|insomnie|réveil|conscience|inconscient|émotion|sentiment|ressentir|éprouver|subir|supporter|endurer|craindre|redouter|appréhender|inquiéter|soucier|préoccuper|troubler|perturber|bouleverser|choquer|surprendre|étonner|impressionner|marquer|affecter|toucher|émouvoir|attendrir|apitoyer)\b/i,
            
            physical: /\b(corps|physique|peau|visage|tête|cheveux|yeux|nez|bouche|dents|main|bras|jambe|pied|dos|ventre|estomac|cœur|sang|os|muscle|nerf|organe|cerveau|poumon|foie|rein|intestin|digestion|respiration|circulation|température|fièvre|chaud|froid|transpirer|suer|trembler|frissonner|bouger|marcher|courir|sauter|nager|voler|grimper|descendre|monter|porter|soulever|pousser|tirer|lancer|attraper|saisir|tenir|lâcher|serrer|presser|frapper|cogner|heurter|percuter|écraser|pincer|mordre|piquer|brûler|couper|déchirer|arracher|casser|plier|tordre|étirer|contracter|relaxer|détendre|reposer|fatiguer|épuiser|énerver|calmer|apaiser|soulager|guérir|soigner|panser|bander|opérer|amputer|greffer|transplanter|injecter|avaler|mâcher|digérer|vomir|cracher|tousser|éternuer|bâiller|ronfler|respirer|inspirer|expirer|haleter|suffoquer|étouffer|noyer|asphyxier|empoisonner|intoxiquer|contaminer|infecter|contagieux|épidémie|pandémie|vaccin|vacciner|immuniser|stériliser|désinfecter|nettoyer|laver|rincer|essuyer|sécher|mouiller|tremper|imbiber|absorber|évaporer|fondre|geler|congeler|réchauffer|refroidir|cuire|bouillir|frire|griller|rôtir|mijoter|fermenter|pourrir|moisir|rancir|périr|expirer|agoniser|décéder|enterrer|inhumer|incinérer|crémation)\b/i
        };

        for (const [domain, pattern] of Object.entries(domains)) {
            if (pattern.test(sentence)) return domain;
        }

        return 'general';
    }

    assessEmotionalIntensity(sentence) {
        let intensity = 1; // Base intensity

        // High intensity markers
        if (/\b(terrible|horrible|affreux|épouvantable|atroce|dramatique|catastrophique|tragique|désastreux)\b/i.test(sentence)) {
            intensity += 2;
        }

        // Medium intensity markers
        if (/\b(grave|sérieux|important|inquiétant|préoccupant|troublant)\b/i.test(sentence)) {
            intensity += 1;
        }

        // Intensifying adverbs
        if (/\b(très|trop|si|tellement|vraiment|extrêmement|particulièrement|énormément|beaucoup)\b/i.test(sentence)) {
            intensity += 1;
        }

        // Exclamation marks
        const exclamations = (sentence.match(/!/g) || []).length;
        intensity += Math.min(exclamations, 2);

        return Math.min(intensity, 5); // Cap at 5
    }

    identifyTemporality(sentence) {
        const temporal = {
            immediate: /\b(maintenant|tout de suite|immédiatement|aussitôt|bientôt|prochainement|demain|aujourd'hui|ce soir|cette nuit)\b/i,
            future: /\b(plus tard|après|ensuite|puis|alors|un jour|à l'avenir|dans l'avenir|futur|avenir|prochaine?|suivante?)\b/i,
            conditional: /\b(si|au cas où|dans le cas où|supposons|imagine|peut-être|probablement|sans doute|certainement)\b/i,
            past: /\b(avant|auparavant|précédemment|déjà|hier|autrefois|jadis|naguère|anciennement)\b/i
        };

        for (const [type, pattern] of Object.entries(temporal)) {
            if (pattern.test(sentence)) return type;
        }

        return 'present';
    }

    analyzeDiscourse(sentence) {
        return {
            register: this.identifyRegister(sentence),
            complexity: this.assessComplexity(sentence),
            contextualFactors: this.identifyContextualFactors(sentence)
        };
    }

    identifyRegister(sentence) {
        // Formal indicators
        const formalMarkers = [
            /\b(monsieur|madame|mademoiselle|veuillez|daignez|permettez|excusez|pardonnez)\b/i,
            /\b(néanmoins|cependant|toutefois|néanmoins|par conséquent|en conséquence|ainsi|donc|par ailleurs|en outre|de plus|en effet|effectivement)\b/i,
            /\b(il convient|il s'agit|il importe|il est nécessaire|il est important|il est essentiel)\b/i
        ];

        // Informal indicators
        const informalMarkers = [
            /\b(ouais|nan|nope|ok|okay|super|génial|cool|sympa|chouette|mignon|rigolo|marrant|drôle)\b/i,
            /\b(mec|nana|fille|gars|type|truc|machin|bidule|bazar|bordel|merde|putain|con|connard|salaud|enfoiré)\b/i,
            /\b(j'ai|t'as|y'a|c'est|ça|là|ben|bon|bah|euh|hein|quoi|alors|donc|puis|après|sinon)\b/i,
            /[.]{3,}|!!+|\?\?+/
        ];

        let formalScore = 0;
        let informalScore = 0;

        formalMarkers.forEach(pattern => {
            if (pattern.test(sentence)) formalScore++;
        });

        informalMarkers.forEach(pattern => {
            if (pattern.test(sentence)) informalScore++;
        });

        if (formalScore > informalScore) return 'formal';
        if (informalScore > formalScore) return 'informal';
        return 'neutral';
    }

    assessComplexity(sentence) {
        let complexity = 0;

        // Length factor
        if (sentence.length > 100) complexity++;
        if (sentence.length > 200) complexity++;

        // Subordinate clauses
        const subordinateMarkers = (sentence.match(/\b(que|qui|dont|où|quand|comme|si|bien que|alors que|tandis que|pendant que|après que|avant que|depuis que|jusqu'à ce que|pour que|afin que|de sorte que|de façon que|de manière que|parce que|puisque|car|étant donné que|vu que|attendu que|sous prétexte que|à condition que|pourvu que|à moins que|quoique|bien que|encore que|même si|sauf si|excepté si)\b/gi) || []).length;
        complexity += Math.min(subordinateMarkers, 3);

        // Complex verb forms
        if (/\b(aurais|aurait|aurions|auriez|auraient|serais|serait|serions|seriez|seraient|eusse|eût|eussions|eussiez|eussent|fusse|fût|fussions|fussiez|fussent)\b/i.test(sentence)) {
            complexity++;
        }

        return Math.min(complexity, 5);
    }

    identifyContextualFactors(sentence) {
        const factors = [];

        // Question context
        if (/\?/.test(sentence)) factors.push('interrogative');

        // Negation context
        if (/\b(ne|n'|pas|jamais|plus|rien|personne|aucun|nulle?)\b/i.test(sentence)) factors.push('negative');

        // Hypothetical context
        if (/\b(si|au cas où|supposons|imagine|peut-être|probablement)\b/i.test(sentence)) factors.push('hypothetical');

        // Reported speech
        if (/\b(dit|dire|déclare|déclarer|affirme|affirmer|prétend|prétendre|raconte|raconter|explique|expliquer)\b/i.test(sentence)) factors.push('reported');

        return factors;
    }

    updatePatterns(analysis, hasExpletive) {
        // Update syntactic patterns
        this.updateMap(this.patterns.syntactic.subjectTypes, analysis.syntactic.subjectType, hasExpletive);
        this.updateMap(this.patterns.syntactic.verbTenses, analysis.syntactic.verbTense, hasExpletive);
        
        analysis.syntactic.intensifiers.forEach(intensifier => {
            this.updateMap(this.patterns.syntactic.intensifiers, intensifier, hasExpletive);
        });

        // Update semantic patterns
        this.updateMap(this.patterns.semantic.domains, analysis.semantic.domain, hasExpletive);
        this.updateMap(this.patterns.semantic.emotionalIntensity, analysis.semantic.emotionalIntensity, hasExpletive);
        this.updateMap(this.patterns.semantic.temporality, analysis.semantic.temporality, hasExpletive);

        // Update discourse patterns
        this.updateMap(this.patterns.discourse.register, analysis.discourse.register, hasExpletive);
        this.updateMap(this.patterns.discourse.sentenceComplexity, analysis.discourse.complexity, hasExpletive);
    }

    updateMap(map, key, hasExpletive) {
        if (!map.has(key)) {
            map.set(key, { withExpletive: 0, withoutExpletive: 0 });
        }
        
        const entry = map.get(key);
        if (hasExpletive) {
            entry.withExpletive++;
        } else {
            entry.withoutExpletive++;
        }
    }

    calculateConfidence(sentence) {
        // Simple confidence based on pattern clarity
        let confidence = 0.5; // Base confidence

        // Clear subjunctive increases confidence
        if (/peur\s+qu[e']\s*\w+.*?(soit|ait|fasse|vienne|aille|puisse|veuille|sache|doive)/i.test(sentence)) {
            confidence += 0.2;
        }

        // Clear semantic domain increases confidence
        const domains = ['medical', 'safety', 'interpersonal', 'psychological', 'physical'];
        if (domains.some(domain => this.identifySemanticDomain(sentence) === domain)) {
            confidence += 0.1;
        }

        // Clear register increases confidence
        const register = this.identifyRegister(sentence);
        if (register !== 'neutral') {
            confidence += 0.1;
        }

        return Math.min(confidence, 1.0);
    }

    calculateStatistics() {
        const total = this.withoutExpletiveCount + this.withExpletiveCount;
        
        return {
            total: total,
            withoutExpletive: this.withoutExpletiveCount,
            withExpletive: this.withExpletiveCount,
            expletiveRate: total > 0 ? (this.withExpletiveCount / total) : 0,
            patternCounts: {
                syntactic: {
                    subjectTypes: this.mapToObject(this.patterns.syntactic.subjectTypes),
                    verbTenses: this.mapToObject(this.patterns.syntactic.verbTenses),
                    intensifiers: this.mapToObject(this.patterns.syntactic.intensifiers)
                },
                semantic: {
                    domains: this.mapToObject(this.patterns.semantic.domains),
                    emotionalIntensity: this.mapToObject(this.patterns.semantic.emotionalIntensity),
                    temporality: this.mapToObject(this.patterns.semantic.temporality)
                },
                discourse: {
                    register: this.mapToObject(this.patterns.discourse.register),
                    sentenceComplexity: this.mapToObject(this.patterns.discourse.sentenceComplexity)
                }
            }
        };
    }

    mapToObject(map) {
        const obj = {};
        for (const [key, value] of map.entries()) {
            obj[key] = {
                ...value,
                total: value.withExpletive + value.withoutExpletive,
                expletiveRate: (value.withExpletive + value.withoutExpletive) > 0 ? 
                    (value.withExpletive / (value.withExpletive + value.withoutExpletive)) : 0
            };
        }
        return obj;
    }

    generateEnhancementRules() {
        const rules = [];
        
        // Generate rules based on patterns with clear tendencies
        for (const [category, patterns] of Object.entries(this.patterns)) {
            for (const [patternType, patternMap] of Object.entries(patterns)) {
                for (const [key, stats] of patternMap.entries()) {
                    const total = stats.withExpletive + stats.withoutExpletive;
                    if (total >= 5) { // Minimum threshold for reliability
                        const expletiveRate = stats.withExpletive / total;
                        
                        if (expletiveRate >= 0.8) {
                            rules.push({
                                category,
                                patternType,
                                key,
                                recommendation: 'expletive',
                                confidence: expletiveRate,
                                support: total,
                                description: `${category}.${patternType}="${key}" strongly favors expletive (${(expletiveRate * 100).toFixed(1)}%, n=${total})`
                            });
                        } else if (expletiveRate <= 0.2) {
                            rules.push({
                                category,
                                patternType,
                                key,
                                recommendation: 'no_expletive',
                                confidence: 1 - expletiveRate,
                                support: total,
                                description: `${category}.${patternType}="${key}" strongly favors no expletive (${((1-expletiveRate) * 100).toFixed(1)}%, n=${total})`
                            });
                        }
                    }
                }
            }
        }
        
        return rules.sort((a, b) => b.confidence - a.confidence);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PeurQueCorpusAnalyzer;
}
