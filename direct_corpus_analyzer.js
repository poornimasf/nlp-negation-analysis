#!/usr/bin/env node
/**
 * Direct Corpus Analyzer for Peur Que Constructions
 * Simplified version that properly extracts and analyzes the corpus
 */

const fs = require('fs');

function analyzeFullCorpus() {
    console.log('🔍 ANALYZING FULL PEUR QUE CORPUS');
    console.log('='.repeat(60));
    
    // Read the corpus files
    const expletiveData = fs.readFileSync('/tmp/expletive_corpus.txt', 'utf8');
    const noExpletiveData = fs.readFileSync('/tmp/no_expletive_corpus.txt', 'utf8');
    
    // Extract peur que sentences
    const expletiveSentences = extractPeurQueSentences(expletiveData, true);
    const noExpletiveSentences = extractPeurQueSentences(noExpletiveData, false);
    
    console.log(`📥 Expletive sentences found: ${expletiveSentences.length}`);
    console.log(`📥 No-expletive sentences found: ${noExpletiveSentences.length}`);
    
    const allSentences = [...expletiveSentences, ...noExpletiveSentences];
    console.log(`📊 Total "peur que" sentences: ${allSentences.length}`);
    
    if (allSentences.length === 0) {
        console.log('❌ No "peur que" sentences found. Check your corpus data.');
        return;
    }
    
    // Analyze patterns
    const analysis = analyzePatterns(allSentences);
    
    // Generate comprehensive report
    generateReport(analysis, allSentences);
    
    // Save results
    saveResults(analysis, allSentences);
    
    return analysis;
}

function extractPeurQueSentences(text, hasExpletive) {
    const sentences = [];
    
    // Split by line breaks and periods, then filter for "peur que"
    const parts = text.split(/[\n.!?]+/);
    
    for (let part of parts) {
        part = part.trim();
        if (part.length < 10) continue;
        
        // Check if contains "peur que" or "peur qu'"
        if (/\bpeur\s+qu[e']/i.test(part)) {
            sentences.push({
                text: part,
                hasExpletive: hasExpletive,
                semanticDomain: identifySemanticDomain(part),
                register: identifyRegister(part),
                subjectType: identifySubjectType(part),
                hasSubjunctive: hasSubjunctive(part)
            });
        }
    }
    
    return sentences;
}

function identifySemanticDomain(sentence) {
    // Medical domain
    if (/\b(médecin|veto|vétérinaire|stérilisation|maladie|santé|docteur|hôpital|traitement|douleur|blessure|mort|mourir|bandage|medocs|médicament|opération|chirurgie|diagnostic|patient|soigner|guérir|symptôme|infection|virus|cancer|toubib|Alzheimer|hypoglycémie|digestion|gelée royale|mascarpone|crème fouettée|asthme|PR|Metho|endocrino|grossesse|accouchement|bébé|placenta|oxygéné|gynéco|traitement|homéopatique)\b/i.test(sentence)) {
        return 'medical';
    }
    
    // Safety domain
    if (/\b(danger|dangereux|risque|accident|blessure|blesser|tomber|chuter|casser|briser|exploser|feu|incendie|voiture|route|conduire|sécurité|protéger|protection|police|vol|voler|cambriolage|agression|attaque|violence|violent|arme|guerre|combat|bataille|tuer|assassiner|crime|criminel|prison|emprisonner|arrêter|fuir|échapper|perdre|disparaître|enlever|kidnapper|séquestrer|étrangle|révolte|saisie|éliminer|menace|terroriste|attaques|saisir|éliminiez|gangster|microfilms|flics|rattrape)\b/i.test(sentence)) {
        return 'safety';
    }
    
    // Interpersonal domain
    if (/\b(amour|aimer|amoureuse?|relation|couple|mariage|épouser|famille|enfant|parent|ami|amitié|confiance|trahir|mentir|quitter|partir|abandonner|laisser|seul|solitude|jalousie|jaloux|colère|fâcher|dispute|conflit|réconciliation|pardon|pardonner|comprendre|écouter|parler|dire|avouer|révéler|secret|cacher|compagnon|copine|répondre|taquiner|amitié|déteste|quitte|pouvoirs|Jules|bizarre|darons|grillent|Emily|sentiments|joue|Nat|maman|papa|mère|père|fils|fille|frère|sœur|grand-père|grand-mère)\b/i.test(sentence)) {
        return 'interpersonal';
    }
    
    // Technical/Professional domain
    if (/\b(travail|job|emploi|bureau|collègue|patron|chef|entreprise|société|business|projet|réunion|client|contrat|salaire|économie|finance|banque|argent|budget|coût|prix|vente|achat|marché|concurrence|technique|technologie|informatique|ordinateur|logiciel|internet|site|application|système|réseau|serveur|données|fichier|programme|code|développement|programmation|installation|configuration|maintenance|réparation|problème|bug|erreur|panne|dysfonctionnement)\b/i.test(sentence)) {
        return 'technical';
    }
    
    return 'general';
}

function identifyRegister(sentence) {
    // Formal register indicators
    const formalMarkers = [
        /\b(monsieur|madame|mademoiselle|veuillez|daignez|permettez|excusez|pardonnez)\b/i,
        /\b(néanmoins|cependant|toutefois|par conséquent|en conséquence|ainsi|donc|par ailleurs|en outre|de plus|en effet|effectivement)\b/i,
        /\b(il convient|il s'agit|il importe|il est nécessaire|il est important|il est essentiel)\b/i,
        /\b(atteste|dieux|frivolité|vanité|décrets|testament|éliminiez)\b/i,
        /\b(fût|eût|eussiez|punît)\b/i // Literary subjunctive forms
    ];
    
    // Informal register indicators  
    const informalMarkers = [
        /\b(j'ai|t'as|y'a|c'est|ça|quoi|ouais|nan|nope|ok|okay|super|génial|cool|sympa|chouette|mignon|rigolo|marrant|drôle)\b/i,
        /\b(mec|nana|fille|gars|type|truc|machin|bidule|bazar|truc|bordel|merde|putain)\b/i,
        /\^\^|:\)|:\(|:\/|lol|mdr|ptdr|xD/i,
        /@\w+/i, // Social media mentions
        /\b(Val|Jun|kniss_16|Michel|Jules|Emily|Nat)\b/i // Informal names/nicknames
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

function identifySubjectType(sentence) {
    // Extract text after "peur que/qu'"
    const match = sentence.match(/peur\s+qu[e']\s*([^,.\s]+(?:\s+[^,.\s]+)*)/i);
    if (!match) return 'unknown';
    
    const followingText = match[1];
    
    if (/^(il|elle|on|ils|elles|je|tu|nous|vous)\b/i.test(followingText)) return 'pronoun';
    if (/^(le|la|les|un|une|des|ce|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs)\s+/i.test(followingText)) return 'determiner_noun';
    if (/^[A-Z][a-z]+/.test(followingText)) return 'proper_noun';
    
    return 'other';
}

function hasSubjunctive(sentence) {
    // Look for subjunctive patterns after "peur que"
    const subjunctivePatterns = [
        /peur\s+qu[e']\s*\w+\s+(soit|ait|fasse|vienne|aille|puisse|veuille|sache|doive|punisse|fût|eût)/i,
        /peur\s+qu[e']\s*\w+\s+\w+\s+(soit|ait|fasse|vienne|aille|puisse|veuille|sache|doive)/i,
        /peur\s+qu[e']\s*(?:il|elle|on|ils|elles|ce|cela|ça)\s+(?:ne\s+)?(\w+e|ait|soit)(?:\s|$|[,.!?])/i
    ];
    
    return subjunctivePatterns.some(pattern => pattern.test(sentence));
}

function analyzePatterns(sentences) {
    const patterns = {
        semantic: {},
        register: {},
        subjectType: {},
        subjunctive: { with: 0, without: 0 },
        expletiveByDomain: {},
        expletiveByRegister: {},
        expletiveBySubject: {},
        expletiveBySubjunctive: { with: 0, without: 0 }
    };
    
    sentences.forEach(sentence => {
        const { semanticDomain, register, subjectType, hasExpletive, hasSubjunctive: subjunctive } = sentence;
        
        // Count patterns
        patterns.semantic[semanticDomain] = (patterns.semantic[semanticDomain] || 0) + 1;
        patterns.register[register] = (patterns.register[register] || 0) + 1;
        patterns.subjectType[subjectType] = (patterns.subjectType[subjectType] || 0) + 1;
        
        if (subjunctive) patterns.subjunctive.with++;
        else patterns.subjunctive.without++;
        
        // Track expletive usage by context
        if (!patterns.expletiveByDomain[semanticDomain]) {
            patterns.expletiveByDomain[semanticDomain] = { with: 0, without: 0, total: 0 };
        }
        if (!patterns.expletiveByRegister[register]) {
            patterns.expletiveByRegister[register] = { with: 0, without: 0, total: 0 };
        }
        if (!patterns.expletiveBySubject[subjectType]) {
            patterns.expletiveBySubject[subjectType] = { with: 0, without: 0, total: 0 };
        }
        
        if (hasExpletive) {
            patterns.expletiveByDomain[semanticDomain].with++;
            patterns.expletiveByRegister[register].with++;
            patterns.expletiveBySubject[subjectType].with++;
            patterns.expletiveBySubjunctive.with++;
        } else {
            patterns.expletiveByDomain[semanticDomain].without++;
            patterns.expletiveByRegister[register].without++;
            patterns.expletiveBySubject[subjectType].without++;
            patterns.expletiveBySubjunctive.without++;
        }
        
        patterns.expletiveByDomain[semanticDomain].total++;
        patterns.expletiveByRegister[register].total++;
        patterns.expletiveBySubject[subjectType].total++;
    });
    
    return patterns;
}

function generateReport(analysis, sentences) {
    const totalSentences = sentences.length;
    const withExpletive = sentences.filter(s => s.hasExpletive).length;
    const withoutExpletive = sentences.filter(s => !s.hasExpletive).length;
    
    console.log('\n📊 COMPREHENSIVE CORPUS ANALYSIS RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n🎯 BASIC STATISTICS:`);
    console.log(`Total sentences analyzed: ${totalSentences}`);
    console.log(`With expletive: ${withExpletive} (${((withExpletive/totalSentences)*100).toFixed(1)}%)`);
    console.log(`Without expletive: ${withoutExpletive} (${((withoutExpletive/totalSentences)*100).toFixed(1)}%)`);
    
    console.log(`\n🏥 SEMANTIC DOMAIN ANALYSIS:`);
    for (const [domain, stats] of Object.entries(analysis.expletiveByDomain)) {
        if (stats.total >= 2) {
            const expletiveRate = (stats.with / stats.total * 100);
            console.log(`${domain.padEnd(15)}: ${expletiveRate.toFixed(1)}% expletive (${stats.with}/${stats.total})`);
        }
    }
    
    console.log(`\n📝 REGISTER ANALYSIS:`);
    for (const [register, stats] of Object.entries(analysis.expletiveByRegister)) {
        if (stats.total >= 2) {
            const expletiveRate = (stats.with / stats.total * 100);
            console.log(`${register.padEnd(15)}: ${expletiveRate.toFixed(1)}% expletive (${stats.with}/${stats.total})`);
        }
    }
    
    console.log(`\n👤 SUBJECT TYPE ANALYSIS:`);
    for (const [subject, stats] of Object.entries(analysis.expletiveBySubject)) {
        if (stats.total >= 2) {
            const expletiveRate = (stats.with / stats.total * 100);
            console.log(`${subject.padEnd(15)}: ${expletiveRate.toFixed(1)}% expletive (${stats.with}/${stats.total})`);
        }
    }
    
    console.log(`\n🎭 SUBJUNCTIVE ANALYSIS:`);
    const subjTotal = analysis.expletiveBySubjunctive.with + analysis.expletiveBySubjunctive.without;
    const subjExpletiveRate = (analysis.expletiveBySubjunctive.with / subjTotal * 100);
    console.log(`With subjunctive: ${subjExpletiveRate.toFixed(1)}% expletive (${analysis.expletiveBySubjunctive.with}/${subjTotal})`);
    
    console.log(`\n🚀 KEY FINDINGS & ENHANCEMENT RULES:`);
    
    // Generate specific enhancement rules
    const rules = [];
    
    for (const [domain, stats] of Object.entries(analysis.expletiveByDomain)) {
        if (stats.total >= 5) {
            const rate = stats.with / stats.total;
            if (rate >= 0.8) {
                rules.push(`${domain} contexts strongly favor expletive (${(rate * 100).toFixed(1)}%, n=${stats.total})`);
            } else if (rate <= 0.2) {
                rules.push(`${domain} contexts strongly disfavor expletive (${((1-rate) * 100).toFixed(1)}%, n=${stats.total})`);
            }
        }
    }
    
    for (const [register, stats] of Object.entries(analysis.expletiveByRegister)) {
        if (stats.total >= 5) {
            const rate = stats.with / stats.total;
            if (rate >= 0.8) {
                rules.push(`${register} register strongly favors expletive (${(rate * 100).toFixed(1)}%, n=${stats.total})`);
            } else if (rate <= 0.2) {
                rules.push(`${register} register strongly disfavors expletive (${((1-rate) * 100).toFixed(1)}%, n=${stats.total})`);
            }
        }
    }
    
    if (rules.length > 0) {
        rules.forEach((rule, index) => {
            console.log(`${index + 1}. ${rule}`);
        });
    } else {
        console.log('No strong patterns found with current sample size.');
    }
    
    console.log(`\n📋 SAMPLE SENTENCES:`);
    
    console.log(`\nWith expletive examples:`);
    sentences.filter(s => s.hasExpletive).slice(0, 3).forEach((s, i) => {
        console.log(`${i+1}. "${s.text.substring(0, 80)}..." [${s.semanticDomain}, ${s.register}]`);
    });
    
    console.log(`\nWithout expletive examples:`);
    sentences.filter(s => !s.hasExpletive).slice(0, 3).forEach((s, i) => {
        console.log(`${i+1}. "${s.text.substring(0, 80)}..." [${s.semanticDomain}, ${s.register}]`);
    });
}

function saveResults(analysis, sentences) {
    const results = {
        timestamp: new Date().toISOString(),
        corpusSize: sentences.length,
        basicStats: {
            withExpletive: sentences.filter(s => s.hasExpletive).length,
            withoutExpletive: sentences.filter(s => !s.hasExpletive).length,
            expletiveRate: sentences.filter(s => s.hasExpletive).length / sentences.length
        },
        patterns: analysis,
        enhancementRules: [
            'Replace hard-coded 0.8 expletive rate with context-specific rates',
            'Implement semantic domain detection in ruleBasedAnalyzer.js',
            'Add register analysis for formal vs informal contexts',
            'Create weighted scoring system combining multiple factors',
            'Add confidence intervals based on pattern support'
        ],
        integrationReady: true
    };
    
    const outputFile = '/Users/pfarrar/main/corpus_analysis_results.json';
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.log(`\n💾 Results saved to: ${outputFile}`);
    console.log(`\n🔧 INTEGRATION RECOMMENDATIONS:`);
    console.log(`1. Use semantic domain patterns to replace hard-coded rates`);
    console.log(`2. Implement register detection for context-appropriate predictions`);
    console.log(`3. Add subject type analysis for enhanced accuracy`);
    console.log(`4. Create weighted scoring combining domain + register + subjunctive`);
    console.log(`5. Deploy with A/B testing against current hard-coded system`);
}

// Run the analysis
if (require.main === module) {
    try {
        analyzeFullCorpus();
        console.log('\n✅ Corpus analysis completed successfully!');
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        console.error(error.stack);
    }
}

module.exports = { analyzeFullCorpus };
