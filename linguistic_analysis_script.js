const fs = require('fs');
const path = require('path');

// Linguistic analysis patterns
const SYNTACTIC_PATTERNS = {
    subjunctive: {
        irregular: /\b(soit|soient|ait|aient|fasse|fassent|vienne|viennent|puisse|puissent|veuille|veuillent|sache|sachent|aille|aillent)\b/gi,
        regular_er: /\b\w+e\b(?=\s|$|[.,!?])/g,
        regular_ir: /\b\w+isse\b(?=\s|$|[.,!?])/g,
        regular_re: /\b\w+e\b(?=\s|$|[.,!?])/g
    },
    triggers: {
        avant_que: /avant\s+qu[e']/gi,
        peur_que: /(peur|crainte?|redoute?)\s+qu[e']/gi,
        sen_faut: /(peu\s+)?s'en\s+(faut|fallut|est\s+fallu)/gi,
        moins_plus: /(plus|moins)\s+.*\s+qu[e']/gi,
        avant_de: /avant\s+de?\b/gi
    },
    complexity: {
        simple: /^[^,;:()]{1,50}$/,
        medium: /^[^,;:()]{51,100}$|[,;:()]{1,2}/,
        complex: /[,;:()]{3,}|.{101,}/
    }
};

const SEMANTIC_PATTERNS = {
    emotional: {
        fear: /\b(peur|crainte?|redoute?|anxiét|inquiét|effrai|terrifi)\b/gi,
        urgency: /\b(urgent|vite|dépêch|rapid|immédiat|tard|temps)\b/gi,
        dramatic: /\b(irréparable|catastroph|désastr|tragédi|dram)\b/gi
    },
    temporal: {
        sequence: /\b(avant|après|puis|ensuite|alors|maintenant)\b/gi,
        duration: /\b(\d+\s*(minute|heure|jour|mois|an)|longtemps|moment)\b/gi,
        urgency: /\b(trop\s+tard|à\s+temps|urgent|vite)\b/gi
    },
    logical: {
        negation: /\b(pas|jamais|plus|rien|personne|aucun|ni)\b/gi,
        causation: /\b(parce\s+que|car|donc|ainsi|par\s+conséquent)\b/gi,
        condition: /\b(si|condition|cas|supposer)\b/gi
    }
};

const DISCOURSE_PATTERNS = {
    register: {
        formal: /\b(il\s+convient|par\s+conséquent|néanmoins|toutefois|cependant|monsieur|madame)\b/gi,
        literary: /\b(fallut|eût|fût|submergeât|irréparable|contempla)\b/gi,
        informal: /\b(bon|allez|dépêche|faut\s+qu'on|ça|ouais|nan)\b/gi,
        technical: /\b(système|processus|données|paramètres|installation|configuration)\b/gi
    },
    stance: {
        assertive: /\b(certainement|sûrement|évidemment|clairement|absolument)\b/gi,
        tentative: /\b(peut-être|probablement|sans\s+doute|il\s+semble)\b/gi,
        polite: /\b(s'il\s+vous\s+plaît|veuillez|pourriez|auriez\s+l'amabilité)\b/gi
    },
    pragmatic: {
        question: /\?/g,
        exclamation: /!/g,
        imperative: /^[A-Z][^.!?]*[ez|ons|s]\s*[.!]?$/gm
    }
};

function analyzeSyntax(text) {
    const analysis = {
        hasSubjunctive: false,
        subjunctiveType: null,
        triggerFound: null,
        complexity: 'simple',
        clauseCount: 1
    };
    
    // Check for subjunctive
    if (SYNTACTIC_PATTERNS.subjunctive.irregular.test(text)) {
        analysis.hasSubjunctive = true;
        analysis.subjunctiveType = 'irregular';
    } else if (SYNTACTIC_PATTERNS.subjunctive.regular_ir.test(text)) {
        analysis.hasSubjunctive = true;
        analysis.subjunctiveType = 'regular_ir';
    }
    
    // Check triggers
    for (const [trigger, pattern] of Object.entries(SYNTACTIC_PATTERNS.triggers)) {
        if (pattern.test(text)) {
            analysis.triggerFound = trigger;
            break;
        }
    }
    
    // Complexity analysis
    if (SYNTACTIC_PATTERNS.complexity.complex.test(text)) {
        analysis.complexity = 'complex';
    } else if (SYNTACTIC_PATTERNS.complexity.medium.test(text)) {
        analysis.complexity = 'medium';
    }
    
    // Clause count (rough estimate)
    analysis.clauseCount = (text.match(/qu[e']/gi) || []).length + 1;
    
    return analysis;
}

function analyzeSemantic(text) {
    const analysis = {
        emotionalContext: [],
        temporalContext: [],
        logicalContext: [],
        semanticField: 'neutral'
    };
    
    // Emotional analysis
    for (const [emotion, pattern] of Object.entries(SEMANTIC_PATTERNS.emotional)) {
        if (pattern.test(text)) {
            analysis.emotionalContext.push(emotion);
        }
    }
    
    // Temporal analysis
    for (const [temporal, pattern] of Object.entries(SEMANTIC_PATTERNS.temporal)) {
        if (pattern.test(text)) {
            analysis.temporalContext.push(temporal);
        }
    }
    
    // Logical analysis
    for (const [logical, pattern] of Object.entries(SEMANTIC_PATTERNS.logical)) {
        if (pattern.test(text)) {
            analysis.logicalContext.push(logical);
        }
    }
    
    // Determine primary semantic field
    if (analysis.emotionalContext.length > 0) {
        analysis.semanticField = 'emotional';
    } else if (analysis.temporalContext.length > 0) {
        analysis.semanticField = 'temporal';
    } else if (analysis.logicalContext.length > 0) {
        analysis.semanticField = 'logical';
    }
    
    return analysis;
}

function analyzeDiscourse(text) {
    const analysis = {
        register: 'neutral',
        stance: 'neutral',
        pragmaticFeatures: [],
        registerScore: {}
    };
    
    // Register analysis
    for (const [register, pattern] of Object.entries(DISCOURSE_PATTERNS.register)) {
        const matches = (text.match(pattern) || []).length;
        analysis.registerScore[register] = matches;
    }
    
    // Determine primary register
    const maxRegister = Object.entries(analysis.registerScore)
        .reduce((a, b) => analysis.registerScore[a[0]] > analysis.registerScore[b[0]] ? a : b);
    if (maxRegister[1] > 0) {
        analysis.register = maxRegister[0];
    }
    
    // Stance analysis
    for (const [stance, pattern] of Object.entries(DISCOURSE_PATTERNS.stance)) {
        if (pattern.test(text)) {
            analysis.stance = stance;
            break;
        }
    }
    
    // Pragmatic features
    if (DISCOURSE_PATTERNS.pragmatic.question.test(text)) {
        analysis.pragmaticFeatures.push('question');
    }
    if (DISCOURSE_PATTERNS.pragmatic.exclamation.test(text)) {
        analysis.pragmaticFeatures.push('exclamation');
    }
    if (DISCOURSE_PATTERNS.pragmatic.imperative.test(text)) {
        analysis.pragmaticFeatures.push('imperative');
    }
    
    return analysis;
}

// Main analysis function
function analyzeTrainingData() {
    const trainingDataDir = './negation-analyzer/public/training_data/';
    const sentenceFiles = fs.readdirSync(trainingDataDir)
        .filter(file => file.endsWith('_sentence.json'));
    
    console.log('=== COMPREHENSIVE LINGUISTIC ANALYSIS ===\n');
    
    let globalStats = {
        syntactic: {},
        semantic: {},
        discourse: {},
        correlations: {}
    };
    
    let allAnalyses = [];
    
    sentenceFiles.forEach(filename => {
        const filePath = path.join(trainingDataDir, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\n--- ${data.trigger.toUpperCase()} LINGUISTIC ANALYSIS ---`);
        
        let triggerStats = {
            syntactic: { subjunctive: 0, complex: 0, multiClause: 0 },
            semantic: { emotional: 0, temporal: 0, logical: 0 },
            discourse: { formal: 0, literary: 0, informal: 0, technical: 0 },
            expletiveCorrelations: { 
                subjunctive: { with: 0, without: 0 },
                emotional: { with: 0, without: 0 },
                formal: { with: 0, without: 0 }
            }
        };
        
        // Analyze balanced sample of examples (50 expletive, 50 non-expletive)
        const expletiveExamples = data.examples.filter(ex => ex.hasExpletive === true);
        const nonExpletiveExamples = data.examples.filter(ex => ex.hasExpletive === false);
        
        const expletiveSample = expletiveExamples.slice(0, 50);
        const nonExpletiveSample = nonExpletiveExamples.slice(0, 50);
        const sample = [...expletiveSample, ...nonExpletiveSample];
        
        console.log(`Analyzing balanced sample: ${expletiveSample.length} expletive + ${nonExpletiveSample.length} non-expletive = ${sample.length} total`);
        
        sample.forEach(example => {
            const syntactic = analyzeSyntax(example.text);
            const semantic = analyzeSemantic(example.text);
            const discourse = analyzeDiscourse(example.text);
            
            const analysis = {
                text: example.text,
                hasExpletive: example.hasExpletive,
                syntactic,
                semantic,
                discourse
            };
            
            allAnalyses.push(analysis);
            
            // Update stats
            if (syntactic.hasSubjunctive) triggerStats.syntactic.subjunctive++;
            if (syntactic.complexity === 'complex') triggerStats.syntactic.complex++;
            if (syntactic.clauseCount > 1) triggerStats.syntactic.multiClause++;
            
            if (semantic.semanticField === 'emotional') triggerStats.semantic.emotional++;
            if (semantic.semanticField === 'temporal') triggerStats.semantic.temporal++;
            if (semantic.semanticField === 'logical') triggerStats.semantic.logical++;
            
            triggerStats.discourse[discourse.register]++;
            
            // Correlations with expletive usage
            if (syntactic.hasSubjunctive) {
                if (example.hasExpletive) {
                    triggerStats.expletiveCorrelations.subjunctive.with++;
                } else {
                    triggerStats.expletiveCorrelations.subjunctive.without++;
                }
            }
            
            if (semantic.semanticField === 'emotional') {
                if (example.hasExpletive) {
                    triggerStats.expletiveCorrelations.emotional.with++;
                } else {
                    triggerStats.expletiveCorrelations.emotional.without++;
                }
            }
            
            if (discourse.register === 'formal' || discourse.register === 'literary') {
                if (example.hasExpletive) {
                    triggerStats.expletiveCorrelations.formal.with++;
                } else {
                    triggerStats.expletiveCorrelations.formal.without++;
                }
            }
        });
        
        // Report trigger-specific findings
        const sampleSize = sample.length;
        console.log(`Sample size: ${sampleSize} examples (${expletiveSample.length} expletive, ${nonExpletiveSample.length} non-expletive)`);
        console.log(`\nSyntactic patterns:`);
        console.log(`  Subjunctive usage: ${triggerStats.syntactic.subjunctive}/${sampleSize} (${(triggerStats.syntactic.subjunctive/sampleSize*100).toFixed(1)}%)`);
        console.log(`  Complex sentences: ${triggerStats.syntactic.complex}/${sampleSize} (${(triggerStats.syntactic.complex/sampleSize*100).toFixed(1)}%)`);
        console.log(`  Multi-clause: ${triggerStats.syntactic.multiClause}/${sampleSize} (${(triggerStats.syntactic.multiClause/sampleSize*100).toFixed(1)}%)`);
        
        console.log(`\nSemantic fields:`);
        console.log(`  Emotional: ${triggerStats.semantic.emotional}/${sampleSize} (${(triggerStats.semantic.emotional/sampleSize*100).toFixed(1)}%)`);
        console.log(`  Temporal: ${triggerStats.semantic.temporal}/${sampleSize} (${(triggerStats.semantic.temporal/sampleSize*100).toFixed(1)}%)`);
        console.log(`  Logical: ${triggerStats.semantic.logical}/${sampleSize} (${(triggerStats.semantic.logical/sampleSize*100).toFixed(1)}%)`);
        
        console.log(`\nRegister distribution:`);
        Object.entries(triggerStats.discourse).forEach(([register, count]) => {
            if (count > 0) {
                console.log(`  ${register}: ${count}/${sampleSize} (${(count/sampleSize*100).toFixed(1)}%)`);
            }
        });
        
        console.log(`\nExpletive correlations:`);
        const subjCorr = triggerStats.expletiveCorrelations.subjunctive;
        if (subjCorr.with + subjCorr.without > 0) {
            const subjExpletiveRate = subjCorr.with / (subjCorr.with + subjCorr.without) * 100;
            console.log(`  Subjunctive + Expletive: ${subjCorr.with}/${subjCorr.with + subjCorr.without} (${subjExpletiveRate.toFixed(1)}%)`);
        }
        
        const emotCorr = triggerStats.expletiveCorrelations.emotional;
        if (emotCorr.with + emotCorr.without > 0) {
            const emotExpletiveRate = emotCorr.with / (emotCorr.with + emotCorr.without) * 100;
            console.log(`  Emotional + Expletive: ${emotCorr.with}/${emotCorr.with + emotCorr.without} (${emotExpletiveRate.toFixed(1)}%)`);
        }
        
        const formalCorr = triggerStats.expletiveCorrelations.formal;
        if (formalCorr.with + formalCorr.without > 0) {
            const formalExpletiveRate = formalCorr.with / (formalCorr.with + formalCorr.without) * 100;
            console.log(`  Formal/Literary + Expletive: ${formalCorr.with}/${formalCorr.with + formalCorr.without} (${formalExpletiveRate.toFixed(1)}%)`);
        }
    });
    
    // Global cross-trigger analysis
    console.log('\n\n=== CROSS-TRIGGER LINGUISTIC PATTERNS ===');
    
    // Analyze patterns across all triggers
    const expletiveAnalyses = allAnalyses.filter(a => a.hasExpletive);
    const nonExpletiveAnalyses = allAnalyses.filter(a => !a.hasExpletive);
    
    console.log(`\nExpletive examples analysis (n=${expletiveAnalyses.length}):`);
    const expletiveSubjunctive = expletiveAnalyses.filter(a => a.syntactic.hasSubjunctive).length;
    const expletiveEmotional = expletiveAnalyses.filter(a => a.semantic.semanticField === 'emotional').length;
    const expletiveFormal = expletiveAnalyses.filter(a => ['formal', 'literary'].includes(a.discourse.register)).length;
    
    console.log(`  With subjunctive: ${expletiveSubjunctive}/${expletiveAnalyses.length} (${(expletiveSubjunctive/expletiveAnalyses.length*100).toFixed(1)}%)`);
    console.log(`  Emotional context: ${expletiveEmotional}/${expletiveAnalyses.length} (${(expletiveEmotional/expletiveAnalyses.length*100).toFixed(1)}%)`);
    console.log(`  Formal/Literary register: ${expletiveFormal}/${expletiveAnalyses.length} (${(expletiveFormal/expletiveAnalyses.length*100).toFixed(1)}%)`);
    
    console.log(`\nNon-expletive examples analysis (n=${nonExpletiveAnalyses.length}):`);
    const nonExpletiveSubjunctive = nonExpletiveAnalyses.filter(a => a.syntactic.hasSubjunctive).length;
    const nonExpletiveEmotional = nonExpletiveAnalyses.filter(a => a.semantic.semanticField === 'emotional').length;
    const nonExpletiveFormal = nonExpletiveAnalyses.filter(a => ['formal', 'literary'].includes(a.discourse.register)).length;
    
    console.log(`  With subjunctive: ${nonExpletiveSubjunctive}/${nonExpletiveAnalyses.length} (${(nonExpletiveSubjunctive/nonExpletiveAnalyses.length*100).toFixed(1)}%)`);
    console.log(`  Emotional context: ${nonExpletiveEmotional}/${nonExpletiveAnalyses.length} (${(nonExpletiveEmotional/nonExpletiveAnalyses.length*100).toFixed(1)}%)`);
    console.log(`  Formal/Literary register: ${nonExpletiveFormal}/${nonExpletiveAnalyses.length} (${(nonExpletiveFormal/nonExpletiveAnalyses.length*100).toFixed(1)}%)`);
    
    // Sample examples by category
    console.log('\n=== REPRESENTATIVE EXAMPLES BY LINGUISTIC PATTERN ===');
    
    console.log('\nExpletive + Subjunctive + Emotional:');
    const expletiveSubjEmo = allAnalyses.filter(a => 
        a.hasExpletive && a.syntactic.hasSubjunctive && a.semantic.semanticField === 'emotional'
    ).slice(0, 2);
    expletiveSubjEmo.forEach(ex => console.log(`  "${ex.text}"`));
    
    console.log('\nNon-expletive + Subjunctive + Neutral:');
    const nonExpletiveSubjNeutral = allAnalyses.filter(a => 
        !a.hasExpletive && a.syntactic.hasSubjunctive && a.semantic.semanticField === 'neutral'
    ).slice(0, 2);
    nonExpletiveSubjNeutral.forEach(ex => console.log(`  "${ex.text}"`));
    
    console.log('\nFormal/Literary + Expletive:');
    const formalExpletive = allAnalyses.filter(a => 
        a.hasExpletive && ['formal', 'literary'].includes(a.discourse.register)
    ).slice(0, 2);
    formalExpletive.forEach(ex => console.log(`  "${ex.text}"`));
}

// Run the analysis
analyzeTrainingData();
