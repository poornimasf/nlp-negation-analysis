const fs = require('fs');
const path = require('path');

// Enhanced discourse patterns for paragraph analysis
const DISCOURSE_PATTERNS = {
    coherence: {
        connectors: /\b(cependant|néanmoins|toutefois|par\s+conséquent|ainsi|donc|en\s+effet|d'ailleurs|de\s+plus|en\s+outre)\b/gi,
        temporal_sequence: /\b(d'abord|ensuite|puis|enfin|finalement|premièrement|deuxièmement)\b/gi,
        contrast: /\b(mais|cependant|pourtant|néanmoins|au\s+contraire|en\s+revanche)\b/gi
    },
    context_depth: {
        background_info: /\b(contexte|situation|circonstances|conditions|environnement)\b/gi,
        elaboration: /\b(c'est-à-dire|autrement\s+dit|en\s+d'autres\s+termes|notamment|par\s+exemple)\b/gi,
        causation: /\b(parce\s+que|car|puisque|étant\s+donné|du\s+fait\s+que|en\s+raison\s+de)\b/gi
    },
    speaker_stance: {
        certainty: /\b(certainement|sûrement|évidemment|clairement|sans\s+doute|assurément)\b/gi,
        uncertainty: /\b(peut-être|probablement|sans\s+doute|il\s+semble|apparemment|vraisemblablement)\b/gi,
        evaluation: /\b(heureusement|malheureusement|étonnamment|curieusement|bizarrement)\b/gi
    },
    pragmatic_context: {
        politeness: /\b(s'il\s+vous\s+plaît|veuillez|pourriez|auriez\s+l'amabilité|je\s+vous\s+prie)\b/gi,
        emphasis: /\b(vraiment|absolument|complètement|totalement|entièrement|particulièrement)\b/gi,
        hedging: /\b(plutôt|assez|quelque\s+peu|relativement|en\s+quelque\s+sorte)\b/gi
    }
};

function analyzeDiscourseContext(text, mode) {
    const analysis = {
        mode: mode,
        textLength: text.length,
        sentenceCount: (text.match(/[.!?]+/g) || []).length,
        coherenceMarkers: 0,
        contextDepth: 0,
        speakerStance: 'neutral',
        pragmaticFeatures: [],
        discourseComplexity: 'simple'
    };
    
    // Coherence analysis
    let coherenceScore = 0;
    for (const [category, pattern] of Object.entries(DISCOURSE_PATTERNS.coherence)) {
        const matches = (text.match(pattern) || []).length;
        coherenceScore += matches;
        analysis[category] = matches;
    }
    analysis.coherenceMarkers = coherenceScore;
    
    // Context depth analysis
    let contextScore = 0;
    for (const [category, pattern] of Object.entries(DISCOURSE_PATTERNS.context_depth)) {
        const matches = (text.match(pattern) || []).length;
        contextScore += matches;
        analysis[category] = matches;
    }
    analysis.contextDepth = contextScore;
    
    // Speaker stance analysis
    let stanceScore = { certainty: 0, uncertainty: 0, evaluation: 0 };
    for (const [stance, pattern] of Object.entries(DISCOURSE_PATTERNS.speaker_stance)) {
        const matches = (text.match(pattern) || []).length;
        stanceScore[stance] = matches;
    }
    
    // Determine dominant stance
    const maxStance = Object.entries(stanceScore).reduce((a, b) => 
        stanceScore[a[0]] > stanceScore[b[0]] ? a : b
    );
    if (maxStance[1] > 0) {
        analysis.speakerStance = maxStance[0];
    }
    
    // Pragmatic features
    for (const [feature, pattern] of Object.entries(DISCOURSE_PATTERNS.pragmatic_context)) {
        const matches = (text.match(pattern) || []).length;
        if (matches > 0) {
            analysis.pragmaticFeatures.push(feature);
        }
        analysis[feature] = matches;
    }
    
    // Discourse complexity assessment
    const complexityScore = coherenceScore + contextScore + Object.values(stanceScore).reduce((a, b) => a + b, 0);
    if (complexityScore >= 5) {
        analysis.discourseComplexity = 'complex';
    } else if (complexityScore >= 2) {
        analysis.discourseComplexity = 'medium';
    }
    
    return analysis;
}

function compareModesForTrigger(trigger) {
    const trainingDataDir = './negation-analyzer/public/training_data/';
    
    // Load sentence and paragraph data
    const sentenceFile = path.join(trainingDataDir, `${trigger}_sentence.json`);
    const paragraphFile = path.join(trainingDataDir, `${trigger}_paragraph.json`);
    
    if (!fs.existsSync(sentenceFile) || !fs.existsSync(paragraphFile)) {
        console.log(`Missing files for ${trigger}`);
        return null;
    }
    
    const sentenceData = JSON.parse(fs.readFileSync(sentenceFile, 'utf8'));
    const paragraphData = JSON.parse(fs.readFileSync(paragraphFile, 'utf8'));
    
    console.log(`\n=== ${trigger.toUpperCase()} SENTENCE vs PARAGRAPH DISCOURSE ANALYSIS ===`);
    
    // Analyze samples from each mode
    const sentenceExpletive = sentenceData.examples.filter(ex => ex.hasExpletive === true).slice(0, 25);
    const sentenceNonExpletive = sentenceData.examples.filter(ex => ex.hasExpletive === false).slice(0, 25);
    const paragraphExpletive = paragraphData.examples.filter(ex => ex.hasExpletive === true).slice(0, 25);
    const paragraphNonExpletive = paragraphData.examples.filter(ex => ex.hasExpletive === false).slice(0, 25);
    
    const analyses = {
        sentence_expletive: sentenceExpletive.map(ex => analyzeDiscourseContext(ex.text || '', 'sentence')),
        sentence_non_expletive: sentenceNonExpletive.map(ex => analyzeDiscourseContext(ex.text || '', 'sentence')),
        paragraph_expletive: paragraphExpletive.map(ex => analyzeDiscourseContext(ex.paragraph || ex.text || '', 'paragraph')),
        paragraph_non_expletive: paragraphNonExpletive.map(ex => analyzeDiscourseContext(ex.paragraph || ex.text || '', 'paragraph'))
    };
    
    // Calculate statistics for each group
    function calculateStats(analysisGroup, groupName) {
        const stats = {
            name: groupName,
            count: analysisGroup.length,
            avgLength: analysisGroup.reduce((sum, a) => sum + a.textLength, 0) / analysisGroup.length,
            avgSentences: analysisGroup.reduce((sum, a) => sum + a.sentenceCount, 0) / analysisGroup.length,
            avgCoherence: analysisGroup.reduce((sum, a) => sum + a.coherenceMarkers, 0) / analysisGroup.length,
            avgContextDepth: analysisGroup.reduce((sum, a) => sum + a.contextDepth, 0) / analysisGroup.length,
            complexDiscourse: analysisGroup.filter(a => a.discourseComplexity === 'complex').length,
            certainStance: analysisGroup.filter(a => a.speakerStance === 'certainty').length,
            uncertainStance: analysisGroup.filter(a => a.speakerStance === 'uncertainty').length,
            evaluativeStance: analysisGroup.filter(a => a.speakerStance === 'evaluation').length,
            politenessFeatures: analysisGroup.filter(a => a.pragmaticFeatures.includes('politeness')).length,
            emphasisFeatures: analysisGroup.filter(a => a.pragmaticFeatures.includes('emphasis')).length,
            hedgingFeatures: analysisGroup.filter(a => a.pragmaticFeatures.includes('hedging')).length
        };
        return stats;
    }
    
    const stats = {
        sentence_expletive: calculateStats(analyses.sentence_expletive, 'Sentence Expletive'),
        sentence_non_expletive: calculateStats(analyses.sentence_non_expletive, 'Sentence Non-Expletive'),
        paragraph_expletive: calculateStats(analyses.paragraph_expletive, 'Paragraph Expletive'),
        paragraph_non_expletive: calculateStats(analyses.paragraph_non_expletive, 'Paragraph Non-Expletive')
    };
    
    // Display comparison
    console.log('\nDISCOURSE COMPLEXITY COMPARISON:');
    console.log('Mode & Type                | Avg Length | Sentences | Coherence | Context | Complex | Certainty | Uncertainty | Evaluation');
    console.log('---------------------------|------------|-----------|-----------|---------|---------|-----------|-------------|------------');
    
    Object.values(stats).forEach(stat => {
        const complexPct = (stat.complexDiscourse / stat.count * 100).toFixed(1);
        const certainPct = (stat.certainStance / stat.count * 100).toFixed(1);
        const uncertainPct = (stat.uncertainStance / stat.count * 100).toFixed(1);
        const evalPct = (stat.evaluativeStance / stat.count * 100).toFixed(1);
        
        console.log(`${stat.name.padEnd(26)} | ${stat.avgLength.toFixed(0).padStart(10)} | ${stat.avgSentences.toFixed(1).padStart(9)} | ${stat.avgCoherence.toFixed(1).padStart(9)} | ${stat.avgContextDepth.toFixed(1).padStart(7)} | ${complexPct.padStart(6)}% | ${certainPct.padStart(8)}% | ${uncertainPct.padStart(10)}% | ${evalPct.padStart(9)}%`);
    });
    
    // Key differences analysis
    console.log('\nKEY DISCOURSE DIFFERENCES:');
    
    // Sentence vs Paragraph mode differences
    const sentenceAvgCoherence = (stats.sentence_expletive.avgCoherence + stats.sentence_non_expletive.avgCoherence) / 2;
    const paragraphAvgCoherence = (stats.paragraph_expletive.avgCoherence + stats.paragraph_non_expletive.avgCoherence) / 2;
    const coherenceDiff = ((paragraphAvgCoherence - sentenceAvgCoherence) / sentenceAvgCoherence * 100).toFixed(1);
    
    const sentenceAvgContext = (stats.sentence_expletive.avgContextDepth + stats.sentence_non_expletive.avgContextDepth) / 2;
    const paragraphAvgContext = (stats.paragraph_expletive.avgContextDepth + stats.paragraph_non_expletive.avgContextDepth) / 2;
    const contextDiff = ((paragraphAvgContext - sentenceAvgContext) / sentenceAvgContext * 100).toFixed(1);
    
    console.log(`Paragraph vs Sentence coherence markers: ${coherenceDiff}% difference`);
    console.log(`Paragraph vs Sentence context depth: ${contextDiff}% difference`);
    
    // Expletive vs Non-expletive differences within modes
    console.log('\nEXPLETIVE vs NON-EXPLETIVE DISCOURSE PATTERNS:');
    
    // Sentence mode
    const sentenceExpletiveCoherence = stats.sentence_expletive.avgCoherence;
    const sentenceNonExpletiveCoherence = stats.sentence_non_expletive.avgCoherence;
    const sentenceCoherenceDiff = ((sentenceExpletiveCoherence - sentenceNonExpletiveCoherence) / sentenceNonExpletiveCoherence * 100).toFixed(1);
    
    // Paragraph mode
    const paragraphExpletiveCoherence = stats.paragraph_expletive.avgCoherence;
    const paragraphNonExpletiveCoherence = stats.paragraph_non_expletive.avgCoherence;
    const paragraphCoherenceDiff = ((paragraphExpletiveCoherence - paragraphNonExpletiveCoherence) / paragraphNonExpletiveCoherence * 100).toFixed(1);
    
    console.log(`Sentence mode - Expletive vs Non-expletive coherence: ${sentenceCoherenceDiff}% difference`);
    console.log(`Paragraph mode - Expletive vs Non-expletive coherence: ${paragraphCoherenceDiff}% difference`);
    
    // Sample examples showing discourse differences
    console.log('\nREPRESENTATIVE EXAMPLES:');
    
    console.log('\nSentence Expletive (high discourse complexity):');
    const complexSentenceExpletive = analyses.sentence_expletive
        .filter(a => a.discourseComplexity === 'complex')
        .slice(0, 1);
    if (complexSentenceExpletive.length > 0) {
        const exampleIndex = analyses.sentence_expletive.findIndex(a => a.discourseComplexity === 'complex');
        if (exampleIndex >= 0 && sentenceExpletive[exampleIndex]) {
            console.log(`  "${sentenceExpletive[exampleIndex].text}"`);
        }
    }
    
    console.log('\nParagraph Expletive (high discourse complexity):');
    const complexParagraphExpletive = analyses.paragraph_expletive
        .filter(a => a.discourseComplexity === 'complex')
        .slice(0, 1);
    if (complexParagraphExpletive.length > 0) {
        const exampleIndex = analyses.paragraph_expletive.findIndex(a => a.discourseComplexity === 'complex');
        if (exampleIndex >= 0 && paragraphExpletive[exampleIndex]) {
            const text = paragraphExpletive[exampleIndex].paragraph || paragraphExpletive[exampleIndex].text || '';
            console.log(`  "${text.substring(0, 200)}..."`);
        }
    }
    
    return {
        trigger,
        stats,
        coherenceDiff: parseFloat(coherenceDiff),
        contextDiff: parseFloat(contextDiff),
        sentenceCoherenceDiff: parseFloat(sentenceCoherenceDiff),
        paragraphCoherenceDiff: parseFloat(paragraphCoherenceDiff)
    };
}

// Main analysis
console.log('=== SENTENCE vs PARAGRAPH DISCOURSE CONTEXT ANALYSIS ===');

const triggers = ['avant_que', 'peur_que', 'sen_faut_que', 'avant_de', 'moins_plus'];
const results = [];

triggers.forEach(trigger => {
    const result = compareModesForTrigger(trigger);
    if (result) {
        results.push(result);
    }
});

// Summary across all triggers
console.log('\n\n=== CROSS-TRIGGER SUMMARY ===');
console.log('\nMode Comparison (Paragraph vs Sentence):');
const avgCoherenceDiff = results.reduce((sum, r) => sum + r.coherenceDiff, 0) / results.length;
const avgContextDiff = results.reduce((sum, r) => sum + r.contextDiff, 0) / results.length;

console.log(`Average coherence marker increase in paragraphs: ${avgCoherenceDiff.toFixed(1)}%`);
console.log(`Average context depth increase in paragraphs: ${avgContextDiff.toFixed(1)}%`);

console.log('\nExpletive vs Non-Expletive Discourse Patterns:');
const avgSentenceExpletiveDiff = results.reduce((sum, r) => sum + r.sentenceCoherenceDiff, 0) / results.length;
const avgParagraphExpletiveDiff = results.reduce((sum, r) => sum + r.paragraphCoherenceDiff, 0) / results.length;

console.log(`Sentence mode - Average expletive coherence advantage: ${avgSentenceExpletiveDiff.toFixed(1)}%`);
console.log(`Paragraph mode - Average expletive coherence advantage: ${avgParagraphExpletiveDiff.toFixed(1)}%`);

console.log('\nDiscourse Context Insights:');
if (Math.abs(avgParagraphExpletiveDiff) > Math.abs(avgSentenceExpletiveDiff)) {
    console.log('✓ Paragraph mode shows stronger discourse-expletive correlations');
} else {
    console.log('✓ Sentence mode shows stronger discourse-expletive correlations');
}

if (avgCoherenceDiff > 20) {
    console.log('✓ Paragraph mode provides significantly richer discourse context');
} else if (avgCoherenceDiff > 0) {
    console.log('✓ Paragraph mode provides moderately richer discourse context');
} else {
    console.log('✓ Sentence and paragraph modes show similar discourse complexity');
}
