const fs = require('fs');
const path = require('path');

// Discourse markers to analyze in the actual corpus
const DISCOURSE_MARKERS = {
    speaker_stance: {
        tentative: /\b(il\s+semble\s+que|on\s+dirait\s+que|j'ai\s+l'impression\s+que|peut-être|probablement|sans\s+doute|apparemment|vraisemblablement)\b/gi,
        polite: /\b(si\s+vous\s+permettez|avec\s+votre\s+permission|j'ose\s+espérer|s'il\s+vous\s+plaît|veuillez|pourriez|auriez\s+l'amabilité|je\s+vous\s+prie)\b/gi,
        assertive: /\b(je\s+suis\s+certain\s+que|il\s+est\s+évident\s+que|sans\s+aucun\s+doute|certainement|sûrement|évidemment|clairement|assurément)\b/gi
    },
    discourse_function: {
        expository: /\b(il\s+faut\s+noter\s+que|on\s+peut\s+observer\s+que|il\s+convient\s+de\s+souligner|il\s+est\s+important\s+de|notons\s+que|observons\s+que)\b/gi,
        argumentative: /\b(cependant|néanmoins|toutefois|en\s+revanche|par\s+contre|mais|pourtant|au\s+contraire|d'un\s+autre\s+côté)\b/gi,
        narrative: /\b(puis|ensuite|finalement|à\s+ce\s+moment-là|alors|après|d'abord|premièrement|deuxièmement|enfin)\b/gi
    },
    register_specific: {
        literary: /\b(fallut|eût|fût|submergeât|contempla|irréparable|naguère|jadis|désormais|néanmoins|toutefois)\b/gi,
        formal: /\b(il\s+convient\s+de|par\s+conséquent|en\s+conséquence|ainsi|donc|monsieur|madame|veuillez\s+agréer|nous\s+avons\s+l'honneur)\b/gi,
        technical: /\b(système|processus|données|paramètres|installation|configuration|procédure|spécification|manuel|documentation)\b/gi,
        conversational: /\b(bon|allez|dépêche|faut\s+qu'on|ça|ouais|nan|ben|alors|tu\s+vois|enfin\s+bref)\b/gi
    }
};

function analyzeDiscourseMarkers(text, hasExpletive) {
    const analysis = {
        hasExpletive: hasExpletive,
        textLength: text.length,
        markerCounts: {},
        totalMarkers: 0,
        dominantCategory: 'none',
        dominantSubcategory: 'none'
    };
    
    let maxCount = 0;
    let maxCategory = 'none';
    let maxSubcategory = 'none';
    
    // Analyze each category of discourse markers
    for (const [category, subcategories] of Object.entries(DISCOURSE_MARKERS)) {
        analysis.markerCounts[category] = {};
        
        for (const [subcategory, pattern] of Object.entries(subcategories)) {
            const matches = (text.match(pattern) || []).length;
            analysis.markerCounts[category][subcategory] = matches;
            analysis.totalMarkers += matches;
            
            if (matches > maxCount) {
                maxCount = matches;
                maxCategory = category;
                maxSubcategory = subcategory;
            }
        }
    }
    
    if (maxCount > 0) {
        analysis.dominantCategory = maxCategory;
        analysis.dominantSubcategory = maxSubcategory;
    }
    
    return analysis;
}

function analyzeCorpusDiscourseMarkers() {
    const trainingDataDir = './negation-analyzer/public/training_data/';
    const sentenceFiles = fs.readdirSync(trainingDataDir)
        .filter(file => file.endsWith('_sentence.json'));
    
    console.log('=== CORPUS DISCOURSE MARKER ANALYSIS ===\n');
    
    let globalStats = {
        expletive: { total: 0, analyses: [] },
        nonExpletive: { total: 0, analyses: [] },
        markerCorrelations: {}
    };
    
    // Initialize correlation tracking
    for (const category of Object.keys(DISCOURSE_MARKERS)) {
        globalStats.markerCorrelations[category] = {};
        for (const subcategory of Object.keys(DISCOURSE_MARKERS[category])) {
            globalStats.markerCorrelations[category][subcategory] = {
                expletive: 0,
                nonExpletive: 0,
                totalExpletive: 0,
                totalNonExpletive: 0
            };
        }
    }
    
    sentenceFiles.forEach(filename => {
        const filePath = path.join(trainingDataDir, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\n--- ${data.trigger.toUpperCase()} DISCOURSE MARKER ANALYSIS ---`);
        
        // Analyze sample of examples (50 expletive, 50 non-expletive)
        const expletiveExamples = data.examples.filter(ex => ex.hasExpletive === true).slice(0, 50);
        const nonExpletiveExamples = data.examples.filter(ex => ex.hasExpletive === false).slice(0, 50);
        
        const expletiveAnalyses = expletiveExamples.map(ex => 
            analyzeDiscourseMarkers(ex.text || '', true)
        );
        const nonExpletiveAnalyses = nonExpletiveExamples.map(ex => 
            analyzeDiscourseMarkers(ex.text || '', false)
        );
        
        globalStats.expletive.analyses.push(...expletiveAnalyses);
        globalStats.nonExpletive.analyses.push(...nonExpletiveAnalyses);
        globalStats.expletive.total += expletiveAnalyses.length;
        globalStats.nonExpletive.total += nonExpletiveAnalyses.length;
        
        // Calculate trigger-specific statistics
        const triggerStats = {
            expletive: {
                totalMarkers: expletiveAnalyses.reduce((sum, a) => sum + a.totalMarkers, 0),
                avgMarkers: expletiveAnalyses.reduce((sum, a) => sum + a.totalMarkers, 0) / expletiveAnalyses.length,
                categories: {}
            },
            nonExpletive: {
                totalMarkers: nonExpletiveAnalyses.reduce((sum, a) => sum + a.totalMarkers, 0),
                avgMarkers: nonExpletiveAnalyses.reduce((sum, a) => sum + a.totalMarkers, 0) / nonExpletiveAnalyses.length,
                categories: {}
            }
        };
        
        // Count markers by category
        for (const category of Object.keys(DISCOURSE_MARKERS)) {
            triggerStats.expletive.categories[category] = {};
            triggerStats.nonExpletive.categories[category] = {};
            
            for (const subcategory of Object.keys(DISCOURSE_MARKERS[category])) {
                const expletiveCount = expletiveAnalyses.reduce((sum, a) => 
                    sum + a.markerCounts[category][subcategory], 0
                );
                const nonExpletiveCount = nonExpletiveAnalyses.reduce((sum, a) => 
                    sum + a.markerCounts[category][subcategory], 0
                );
                
                triggerStats.expletive.categories[category][subcategory] = expletiveCount;
                triggerStats.nonExpletive.categories[category][subcategory] = nonExpletiveCount;
                
                // Update global correlations
                globalStats.markerCorrelations[category][subcategory].expletive += expletiveCount;
                globalStats.markerCorrelations[category][subcategory].nonExpletive += nonExpletiveCount;
                globalStats.markerCorrelations[category][subcategory].totalExpletive += expletiveAnalyses.length;
                globalStats.markerCorrelations[category][subcategory].totalNonExpletive += nonExpletiveAnalyses.length;
            }
        }
        
        console.log(`Sample: ${expletiveAnalyses.length} expletive + ${nonExpletiveAnalyses.length} non-expletive`);
        console.log(`Average markers per example:`);
        console.log(`  Expletive: ${triggerStats.expletive.avgMarkers.toFixed(2)}`);
        console.log(`  Non-expletive: ${triggerStats.nonExpletive.avgMarkers.toFixed(2)}`);
        
        // Show category breakdown
        console.log(`\nDiscourse marker categories:`);
        for (const [category, subcategories] of Object.entries(triggerStats.expletive.categories)) {
            const expletiveTotal = Object.values(subcategories).reduce((sum, count) => sum + count, 0);
            const nonExpletiveTotal = Object.values(triggerStats.nonExpletive.categories[category]).reduce((sum, count) => sum + count, 0);
            
            if (expletiveTotal > 0 || nonExpletiveTotal > 0) {
                console.log(`  ${category}: Expletive=${expletiveTotal}, Non-expletive=${nonExpletiveTotal}`);
                
                for (const [subcategory, count] of Object.entries(subcategories)) {
                    const nonExpCount = triggerStats.nonExpletive.categories[category][subcategory];
                    if (count > 0 || nonExpCount > 0) {
                        console.log(`    ${subcategory}: ${count} vs ${nonExpCount}`);
                    }
                }
            }
        }
        
        // Show examples with discourse markers
        console.log(`\nExamples with discourse markers:`);
        const markedExpletive = expletiveAnalyses.filter(a => a.totalMarkers > 0).slice(0, 2);
        const markedNonExpletive = nonExpletiveAnalyses.filter(a => a.totalMarkers > 0).slice(0, 2);
        
        if (markedExpletive.length > 0) {
            console.log(`  Expletive with markers:`);
            markedExpletive.forEach((analysis, i) => {
                const example = expletiveExamples[expletiveAnalyses.indexOf(analysis)];
                if (example) {
                    console.log(`    [${analysis.dominantSubcategory}] "${example.text.substring(0, 100)}..."`);
                }
            });
        }
        
        if (markedNonExpletive.length > 0) {
            console.log(`  Non-expletive with markers:`);
            markedNonExpletive.forEach((analysis, i) => {
                const example = nonExpletiveExamples[nonExpletiveAnalyses.indexOf(analysis)];
                if (example) {
                    console.log(`    [${analysis.dominantSubcategory}] "${example.text.substring(0, 100)}..."`);
                }
            });
        }
    });
    
    // Global analysis
    console.log('\n\n=== GLOBAL DISCOURSE MARKER CORRELATIONS ===');
    console.log(`Total analyzed: ${globalStats.expletive.total} expletive + ${globalStats.nonExpletive.total} non-expletive`);
    
    console.log('\nDiscourse Marker → Expletive Correlations:');
    console.log('Category/Subcategory           | Expletive Rate | Non-Expletive Rate | Correlation');
    console.log('-------------------------------|----------------|--------------------|-----------');
    
    for (const [category, subcategories] of Object.entries(globalStats.markerCorrelations)) {
        for (const [subcategory, stats] of Object.entries(subcategories)) {
            if (stats.expletive > 0 || stats.nonExpletive > 0) {
                const expletiveRate = (stats.expletive / stats.totalExpletive * 100).toFixed(1);
                const nonExpletiveRate = (stats.nonExpletive / stats.totalNonExpletive * 100).toFixed(1);
                const correlation = stats.totalExpletive > 0 && stats.totalNonExpletive > 0 ? 
                    (parseFloat(expletiveRate) / parseFloat(nonExpletiveRate)).toFixed(2) : 'N/A';
                
                console.log(`${(category + '/' + subcategory).padEnd(30)} | ${expletiveRate.padStart(13)}% | ${nonExpletiveRate.padStart(17)}% | ${correlation.padStart(9)}x`);
            }
        }
    }
    
    // Summary insights
    console.log('\n=== KEY FINDINGS ===');
    
    // Find strongest correlations
    let strongestCorrelations = [];
    for (const [category, subcategories] of Object.entries(globalStats.markerCorrelations)) {
        for (const [subcategory, stats] of Object.entries(subcategories)) {
            if (stats.expletive > 0 && stats.nonExpletive > 0 && stats.totalExpletive > 0 && stats.totalNonExpletive > 0) {
                const expletiveRate = stats.expletive / stats.totalExpletive * 100;
                const nonExpletiveRate = stats.nonExpletive / stats.totalNonExpletive * 100;
                const correlation = expletiveRate / nonExpletiveRate;
                
                if (correlation > 1.2 || correlation < 0.8) { // Significant correlation
                    strongestCorrelations.push({
                        category,
                        subcategory,
                        correlation,
                        expletiveRate,
                        nonExpletiveRate,
                        totalOccurrences: stats.expletive + stats.nonExpletive
                    });
                }
            }
        }
    }
    
    strongestCorrelations.sort((a, b) => Math.abs(b.correlation - 1) - Math.abs(a.correlation - 1));
    
    console.log('\nStrongest discourse marker correlations:');
    strongestCorrelations.slice(0, 5).forEach(item => {
        const direction = item.correlation > 1 ? 'favors expletive' : 'favors non-expletive';
        console.log(`  ${item.category}/${item.subcategory}: ${item.correlation.toFixed(2)}x (${direction})`);
        console.log(`    Expletive: ${item.expletiveRate.toFixed(1)}%, Non-expletive: ${item.nonExpletiveRate.toFixed(1)}%`);
    });
}

// Run the analysis
analyzeCorpusDiscourseMarkers();
