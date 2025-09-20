#!/usr/bin/env node
/**
 * Full Corpus Analyzer for Peur Que Constructions
 * Processes the complete 798 balanced examples
 */

const fs = require('fs');
const PeurQueCorpusAnalyzer = require('./peur_que_corpus_analysis.js');

function processCorpusData(expletiveData, noExpletiveData) {
    console.log('🔍 PROCESSING FULL PEUR QUE CORPUS (798 EXAMPLES)');
    console.log('='.repeat(60));
    
    const analyzer = new PeurQueCorpusAnalyzer();
    const allSentences = [];
    
    // Process expletive sentences
    console.log('📥 Processing expletive sentences...');
    const expletiveSentences = extractSentences(expletiveData, true);
    allSentences.push(...expletiveSentences);
    console.log(`   Found ${expletiveSentences.length} expletive sentences`);
    
    // Process no-expletive sentences  
    console.log('📥 Processing no-expletive sentences...');
    const noExpletiveSentences = extractSentences(noExpletiveData, false);
    allSentences.push(...noExpletiveSentences);
    console.log(`   Found ${noExpletiveSentences.length} no-expletive sentences`);
    
    console.log(`📊 Total sentences: ${allSentences.length}`);
    
    if (allSentences.length === 0) {
        console.log('❌ No sentences found. Please check your input data.');
        return;
    }
    
    // Run comprehensive analysis
    console.log('\n🧠 Running comprehensive analysis...');
    const results = analyzer.analyzeCorpus(allSentences.map(s => s.text));
    
    // Generate detailed report
    generateDetailedReport(results, allSentences);
    
    // Save results for integration
    saveResultsForIntegration(results);
    
    return results;
}

function extractSentences(data, hasExpletive) {
    if (!data || typeof data !== 'string') {
        return [];
    }
    
    // Split by various sentence delimiters and clean
    const sentences = data
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10 && /\bpeur\s+qu[e']/i.test(s))
        .map(s => ({
            text: s,
            hasExpletive: hasExpletive
        }));
    
    return sentences;
}

function generateDetailedReport(results, allSentences) {
    console.log('\n📊 COMPREHENSIVE CORPUS ANALYSIS RESULTS');
    console.log('='.repeat(60));
    
    const stats = results.statistics;
    
    console.log(`\n🎯 BASIC STATISTICS:`);
    console.log(`Total sentences analyzed: ${stats.total}`);
    console.log(`With expletive: ${stats.withExpletive} (${(stats.expletiveRate * 100).toFixed(1)}%)`);
    console.log(`Without expletive: ${stats.withoutExpletive} (${((1-stats.expletiveRate) * 100).toFixed(1)}%)`);
    
    console.log(`\n🏥 SEMANTIC DOMAIN ANALYSIS:`);
    const domains = stats.patternCounts.semantic.domains;
    for (const [domain, domainStats] of Object.entries(domains)) {
        if (domainStats.total >= 5) { // Only show domains with sufficient data
            console.log(`${domain.padEnd(15)}: ${(domainStats.expletiveRate * 100).toFixed(1)}% expletive (${domainStats.withExpletive}/${domainStats.total})`);
        }
    }
    
    console.log(`\n📝 REGISTER ANALYSIS:`);
    const registers = stats.patternCounts.discourse.register;
    for (const [register, registerStats] of Object.entries(registers)) {
        if (registerStats.total >= 5) {
            console.log(`${register.padEnd(15)}: ${(registerStats.expletiveRate * 100).toFixed(1)}% expletive (${registerStats.withExpletive}/${registerStats.total})`);
        }
    }
    
    console.log(`\n👤 SUBJECT TYPE ANALYSIS:`);
    const subjects = stats.patternCounts.syntactic.subjectTypes;
    for (const [subject, subjectStats] of Object.entries(subjects)) {
        if (subjectStats.total >= 5) {
            console.log(`${subject.padEnd(15)}: ${(subjectStats.expletiveRate * 100).toFixed(1)}% expletive (${subjectStats.withExpletive}/${subjectStats.total})`);
        }
    }
    
    console.log(`\n🎭 EMOTIONAL INTENSITY ANALYSIS:`);
    const intensities = stats.patternCounts.semantic.emotionalIntensity;
    for (const [intensity, intensityStats] of Object.entries(intensities)) {
        if (intensityStats.total >= 3) {
            console.log(`Intensity ${intensity}: ${(intensityStats.expletiveRate * 100).toFixed(1)}% expletive (${intensityStats.withExpletive}/${intensityStats.total})`);
        }
    }
    
    // Generate enhancement rules
    console.log(`\n🚀 ENHANCEMENT RULES (High Confidence):`);
    const rules = results.generateEnhancementRules ? results.generateEnhancementRules() : [];
    
    if (rules.length > 0) {
        rules.slice(0, 10).forEach((rule, index) => {
            console.log(`${index + 1}. ${rule.description}`);
        });
    } else {
        console.log('No high-confidence rules generated. Analyzing patterns manually...');
        
        // Manual rule generation from patterns
        for (const [domain, domainStats] of Object.entries(domains)) {
            if (domainStats.total >= 10) {
                if (domainStats.expletiveRate >= 0.8) {
                    console.log(`• ${domain} contexts strongly favor expletive (${(domainStats.expletiveRate * 100).toFixed(1)}%, n=${domainStats.total})`);
                } else if (domainStats.expletiveRate <= 0.2) {
                    console.log(`• ${domain} contexts strongly disfavor expletive (${((1-domainStats.expletiveRate) * 100).toFixed(1)}%, n=${domainStats.total})`);
                }
            }
        }
    }
    
    console.log(`\n📋 SAMPLE ANALYSIS:`);
    
    // Show examples from each major pattern
    const expletiveExamples = allSentences.filter(s => s.hasExpletive).slice(0, 3);
    const noExpletiveExamples = allSentences.filter(s => !s.hasExpletive).slice(0, 3);
    
    console.log(`\nWith expletive examples:`);
    expletiveExamples.forEach((s, i) => {
        console.log(`${i+1}. "${s.text.substring(0, 80)}..."`);
    });
    
    console.log(`\nWithout expletive examples:`);
    noExpletiveExamples.forEach((s, i) => {
        console.log(`${i+1}. "${s.text.substring(0, 80)}..."`);
    });
}

function saveResultsForIntegration(results) {
    const integrationData = {
        timestamp: new Date().toISOString(),
        corpusSize: results.statistics.total,
        expletiveRate: results.statistics.expletiveRate,
        patterns: results.statistics.patternCounts,
        enhancementRules: results.generateEnhancementRules ? results.generateEnhancementRules() : [],
        recommendations: [
            'Replace hard-coded 0.8 expletive rate with context-specific rates',
            'Implement semantic domain detection in ruleBasedAnalyzer.js',
            'Add register analysis for formal vs informal contexts',
            'Create weighted scoring system combining multiple factors',
            'Add confidence intervals based on pattern support'
        ]
    };
    
    const outputFile = '/Users/pfarrar/main/corpus_analysis_results.json';
    fs.writeFileSync(outputFile, JSON.stringify(integrationData, null, 2));
    
    console.log(`\n💾 Results saved to: ${outputFile}`);
    console.log(`\n🔧 NEXT STEPS:`);
    console.log(`1. Review the enhancement rules above`);
    console.log(`2. Integrate patterns into ruleBasedAnalyzer.js`);
    console.log(`3. Test enhanced system with sample sentences`);
    console.log(`4. Deploy to production with A/B testing`);
}

// Handle command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 2) {
        // File-based input
        const expletiveFile = args[0];
        const noExpletiveFile = args[1];
        
        try {
            const expletiveData = fs.readFileSync(expletiveFile, 'utf8');
            const noExpletiveData = fs.readFileSync(noExpletiveFile, 'utf8');
            
            processCorpusData(expletiveData, noExpletiveData);
        } catch (error) {
            console.error('❌ Error reading files:', error.message);
            console.log('\n📖 Usage:');
            console.log('  node analyze_full_corpus.js <expletive_file> <no_expletive_file>');
            console.log('  echo "sentences..." | node analyze_full_corpus.js --stdin');
        }
    } else if (args[0] === '--stdin') {
        // Stdin input (for piped data)
        let inputData = '';
        process.stdin.setEncoding('utf8');
        
        process.stdin.on('data', (chunk) => {
            inputData += chunk;
        });
        
        process.stdin.on('end', () => {
            // Assume first half is expletive, second half is no-expletive
            const lines = inputData.trim().split('\n');
            const midpoint = Math.floor(lines.length / 2);
            
            const expletiveData = lines.slice(0, midpoint).join('\n');
            const noExpletiveData = lines.slice(midpoint).join('\n');
            
            processCorpusData(expletiveData, noExpletiveData);
        });
    } else {
        console.log('📖 Usage:');
        console.log('  File input: node analyze_full_corpus.js <expletive_file> <no_expletive_file>');
        console.log('  Stdin input: echo "sentences..." | node analyze_full_corpus.js --stdin');
        console.log('');
        console.log('📝 You can also create temporary files:');
        console.log('  echo "expletive sentences..." > /tmp/expletive.txt');
        console.log('  echo "no-expletive sentences..." > /tmp/no_expletive.txt');
        console.log('  node analyze_full_corpus.js /tmp/expletive.txt /tmp/no_expletive.txt');
    }
}

module.exports = { processCorpusData };
