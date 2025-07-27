import EnhancedPatternMatcher from './EnhancedPatternMatcher';

class BalancedNegationClassifier {
    static LOGICAL_MARKERS = [
        { pattern: /\b(?:pas|point)\b/i, weight: 0.4, desc: "Basic negation marker" },
        { pattern: /\b(?:jamais|plus|rien)\b/i, weight: 0.35, desc: "Strong negative adverb" },
        { pattern: /\b(?:personne|aucun[e]?|nul)\b/i, weight: 0.35, desc: "Negative pronoun/determiner" },
        { pattern: /\b(?:guère|nullement)\b/i, weight: 0.3, desc: "Literary negation" },
        { pattern: /\b(?:ni\s+ni)\b/i, weight: 0.35, desc: "Coordinated negation" }
    ];

    static EXPLETIVE_WEIGHTS = {
        'peur_que': 0.35,
        'avant': 0.3,
        'peu_sen_faut': 0.35,
        'craindre': 0.3,
        'douter': 0.25,
        'empecher': 0.25
    };

    static async classifyNegation(text) {
        // Initialize evidence tracking
        const evidence = {
            expletive: { score: 0, points: [] },
            logical: { score: 0, points: [] }
        };

        // 1. Check for logical negation markers
        this.analyzeLogicalMarkers(text, evidence);

        // 2. Check for expletive triggers
        await this.analyzeExpletiveTriggers(text, evidence);

        // 3. Analyze verb mood and tense
        await this.analyzeVerbMood(text, evidence);

        // 4. Analyze sentence structure
        this.analyzeSentenceStructure(text, evidence);

        // 5. Get LLM analysis
        await this.getLLMAnalysis(text, evidence);

        // Make final decision
        return this.makeDecision(evidence);
    }

    static analyzeLogicalMarkers(text, evidence) {
        for (const marker of this.LOGICAL_MARKERS) {
            if (marker.pattern.test(text)) {
                evidence.logical.score += marker.weight;
                evidence.logical.points.push(`Found ${marker.desc}: +${marker.weight}`);
            }
        }
    }

    static async analyzeExpletiveTriggers(text, evidence) {
        const triggerInfo = await EnhancedPatternMatcher.findExpletiveTrigger(text);
        if (triggerInfo) {
            const weight = this.EXPLETIVE_WEIGHTS[triggerInfo.type] || 0.25;
            evidence.expletive.score += weight;
            evidence.expletive.points.push(`Found ${triggerInfo.type} trigger: +${weight}`);

            if (triggerInfo.confidence > 0.8) {
                evidence.expletive.score += 0.1;
                evidence.expletive.points.push("High confidence trigger match: +0.1");
            }
        }
    }

    static async analyzeVerbMood(text, evidence) {
        const hasSubjunctive = /\b(?:sois|soit|soyons|soyez|soient|aie|aies|ait|ayons|ayez|aient)\b/i.test(text);
        if (hasSubjunctive) {
            const queIndex = text.indexOf('que');
            if (queIndex !== -1) {
                const afterQue = text.slice(queIndex + 3);
                if (/\b(?:sois|soit|soyons|soyez|soient|aie|aies|ait|ayons|ayez|aient)\b/i.test(afterQue)) {
                    evidence.expletive.score += 0.2;
                    evidence.expletive.points.push("Properly placed subjunctive: +0.2");
                } else {
                    evidence.logical.score += 0.1;
                    evidence.logical.points.push("Subjunctive without proper placement: +0.1");
                }
            }
        }
    }

    static analyzeSentenceStructure(text, evidence) {
        const hasComplexStructure = /\bqu[e']\s+[^.!?]+$/i.test(text);
        if (hasComplexStructure) {
            // Check for typical expletive structures
            if (/\b(?:peur|crainte|avant|doute)\s+qu[e']/i.test(text)) {
                evidence.expletive.score += 0.1;
                evidence.expletive.points.push("Complex clause with expletive trigger: +0.1");
            } else {
                evidence.logical.score += 0.1;
                evidence.logical.points.push("Complex clause without expletive trigger: +0.1");
            }
        }
    }

    static async getLLMAnalysis(text, evidence) {
        try {
            const analysis = await EnhancedPatternMatcher.analyzeSyntacticContext(text);
            if (analysis) {
                const weight = 0.3;
                if (analysis.isExpletive) {
                    evidence.expletive.score += weight * analysis.confidence;
                    evidence.expletive.points.push(`LLM suggests expletive: +${(weight * analysis.confidence).toFixed(2)}`);
                } else {
                    evidence.logical.score += weight * analysis.confidence;
                    evidence.logical.points.push(`LLM suggests logical: +${(weight * analysis.confidence).toFixed(2)}`);
                }
            }
        } catch (error) {
            console.warn('LLM analysis failed:', error);
        }
    }

    static makeDecision(evidence) {
        const totalEvidence = evidence.expletive.score + evidence.logical.score;
        const normalizedExpletive = totalEvidence > 0 ? evidence.expletive.score / totalEvidence : 0;
        const normalizedLogical = totalEvidence > 0 ? evidence.logical.score / totalEvidence : 0;

        let classification, confidence;
        const margin = Math.abs(evidence.expletive.score - evidence.logical.score);

        if (evidence.expletive.score > evidence.logical.score) {
            if (margin > 0.5) {
                classification = "✅ EXPLETIVE NEGATION";
                confidence = 0.8 + Math.min(margin * 0.3, 0.15);
            } else {
                classification = "LIKELY EXPLETIVE NEGATION";
                confidence = 0.6 + Math.min(margin * 0.3, 0.15);
            }
        } else if (evidence.logical.score > evidence.expletive.score) {
            if (margin > 0.5) {
                classification = "✅ LOGICAL NEGATION";
                confidence = 0.8 + Math.min(margin * 0.3, 0.15);
            } else {
                classification = "LIKELY LOGICAL NEGATION";
                confidence = 0.6 + Math.min(margin * 0.3, 0.15);
            }
        } else {
            classification = "UNCERTAIN NEGATION TYPE";
            confidence = 0.5;
        }

        return {
            classification,
            confidence,
            details: [
                {
                    aspect: "Evidence Summary",
                    finding: `Analyzed both logical and expletive indicators`,
                    impact: `Found ${evidence.logical.points.length} logical and ${evidence.expletive.points.length} expletive indicators`,
                    confidence: 1.0
                },
                {
                    aspect: "Logical Evidence",
                    finding: evidence.logical.points.join("\n"),
                    impact: `Total logical weight: ${evidence.logical.score.toFixed(2)}`,
                    confidence: normalizedLogical
                },
                {
                    aspect: "Expletive Evidence",
                    finding: evidence.expletive.points.join("\n"),
                    impact: `Total expletive weight: ${evidence.expletive.score.toFixed(2)}`,
                    confidence: normalizedExpletive
                },
                {
                    aspect: "Final Classification",
                    finding: `${classification} (${Math.round(confidence * 100)}% confidence)`,
                    impact: `Based on comparative analysis of ${totalEvidence.toFixed(2)} total evidence weight`,
                    confidence: confidence
                }
            ]
        };
    }
}

export default BalancedNegationClassifier;
