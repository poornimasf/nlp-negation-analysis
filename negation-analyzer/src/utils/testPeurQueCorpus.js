/**
 * Test script for PeurQueCorpusProcessor using sample data
 * Demonstrates how your 798 examples will be processed
 */

const PeurQueCorpusProcessor = require('./peurQueCorpusProcessor');

// Your sample data
const withExpletiveText = `
merci beaucoup Val, j'ai appelé le veto à 14h aujourd hui, en effet, elle a bcp vomi. il m'a dit repos repos repos... j'ai laissé fifa se reposer toute la journée, je suis représenter sa gamelle plusieurs fois, 1 fois avec du thon, une fois avec du fromage, une fois sans rien... elle ne mange pas, mon veto m a dit de ne pas la faire beaucoup boire,.... je dois l appeler demain pour lui donner des news... je pense qu on va aller le voir, car du coup elle ne prends pas ses medocs car il faut qu'elle mange avec... je m'inquiète, j ai la boule au ventre, elle vient me chercher dans la maison avec ses yeux rouge et brillant, elle me fait de la peine... Merci encore pour ton message, je te tiens au courant,... j'ai peur que la stérilisation lui ai fait quelque chose dedans, demain on doit lui enlever le bandage... à demain... je prie pour que ça aille mieux...

La personne âgée doit se sentir en sécurité et ne doit pas avoir peur que son chien la fasse chuter en tirant trop fort sur la laisse ou en sautant sur elle, même pour jouer.

C'est quand on a peur que ça arrive ! » Les idées fusent : abaisser la majorité à 16 ans ?

Elle a eu peur que je lui remplisse la bouche ?  – Ce n'est pas « ma copine », Marek, mais pour le reste, je te l'ai amenée pour ça.
`;

const withoutExpletiveText = `
j'ai peur mon cœur peur qu'il t'arrive quelque choses j'ai peur que l'akatsuki ne t'arrache a moi, j'ai .... Elle fut interrompue par Renji qui avait placer un de ces doigts devant ces lèvres.

Durant une fraction de seconde tu as peur que ses humeurs n'ait pris le dessus sur elle , mais – trop tard pour y réagir – tu comprends que C'est pour toi qu'elle avait eu... peur ?

Dire qu'au début j'avais peur qu'il ne me quitte a cause de mes pouvoirs, maintenant j'ai peur qu'il ne me quitte par ce que je n'en est plus !
`;

async function testCorpusProcessing() {
    console.log('🧪 Testing PeurQueCorpusProcessor with sample data...\n');
    
    const processor = new PeurQueCorpusProcessor();
    
    try {
        // Process the sample corpus
        const report = await processor.processCorpus(withExpletiveText, withoutExpletiveText);
        
        console.log('📊 CORPUS ANALYSIS REPORT');
        console.log('=' .repeat(50));
        
        // Overview
        console.log('\n📈 CORPUS OVERVIEW:');
        console.log(`Total examples: ${report.corpusOverview.totalExamples}`);
        console.log(`With expletive: ${report.corpusOverview.withExpletive}`);
        console.log(`Without expletive: ${report.corpusOverview.withoutExpletive}`);
        console.log(`Overall expletive rate: ${(report.corpusOverview.overallExpletiveRate * 100).toFixed(1)}%`);
        
        // Syntactic patterns
        console.log('\n🔤 SYNTACTIC PATTERNS:');
        if (report.syntacticPatterns.subjectTypes) {
            for (const [type, data] of Object.entries(report.syntacticPatterns.subjectTypes)) {
                if (data.totalCount > 0) {
                    console.log(`  ${type}: ${data.totalCount} examples, ${(data.expletiveRate * 100).toFixed(1)}% expletive`);
                    console.log(`    Sample: "${data.examples[0]?.substring(0, 80)}..."`);
                }
            }
        }
        
        // Semantic domains
        console.log('\n🧠 SEMANTIC DOMAINS:');
        for (const [domain, data] of Object.entries(report.semanticDomains)) {
            if (data.totalCount > 0) {
                console.log(`  ${domain}: ${data.totalCount} examples, ${(data.expletiveRate * 100).toFixed(1)}% expletive`);
                if (data.examples[0]) {
                    console.log(`    Sample: "${data.examples[0].text.substring(0, 80)}..."`);
                }
            }
        }
        
        // Discourse markers
        console.log('\n💬 DISCOURSE MARKERS:');
        for (const [category, subcategories] of Object.entries(report.discourseMarkers)) {
            console.log(`  ${category.toUpperCase()}:`);
            for (const [subtype, data] of Object.entries(subcategories)) {
                if (data.totalCount > 0) {
                    console.log(`    ${subtype}: ${data.totalCount} examples, ${(data.expletiveRate * 100).toFixed(1)}% expletive`);
                }
            }
        }
        
        // Key findings
        console.log('\n🔍 KEY FINDINGS:');
        report.keyFindings.forEach(finding => {
            console.log(`  • ${finding}`);
        });
        
        // Test the analyzer with sample sentences
        console.log('\n🧪 TESTING ANALYZER:');
        const PeurQueCorpusAnalyzer = require('./peurQueCorpusAnalyzer');
        const analyzer = new PeurQueCorpusAnalyzer();
        
        // Update analyzer with corpus rates (this would use real rates from your 798 examples)
        const mockCorpusRates = {
            syntactic: {
                firstPersonSingular: { expletiveRate: 0.3 },
                thirdPersonSingular: { expletiveRate: 0.7 }
            },
            semantic: {
                medical: { expletiveRate: 0.8 },
                interpersonal: { expletiveRate: 0.2 },
                safety: { expletiveRate: 0.9 }
            },
            discourse: {
                register: {
                    formal: { expletiveRate: 0.7 },
                    informal: { expletiveRate: 0.3 }
                },
                emotionalIntensity: {
                    high: { expletiveRate: 0.6 },
                    medium: { expletiveRate: 0.4 }
                }
            }
        };
        
        analyzer.updateCorpusRates(mockCorpusRates);
        
        // Test sentences
        const testSentences = [
            "j'ai peur que la stérilisation lui ai fait quelque chose", // Medical context
            "j'ai peur qu'il t'arrive quelque choses", // Interpersonal context
            "La personne âgée doit se sentir en sécurité et ne doit pas avoir peur que son chien la fasse chuter" // Safety context
        ];
        
        testSentences.forEach((sentence, index) => {
            console.log(`\n  Test ${index + 1}: "${sentence.substring(0, 60)}..."`);
            const result = analyzer.analyze(sentence);
            console.log(`    Prediction: ${result.prediction}`);
            console.log(`    Confidence: ${result.confidence}%`);
            console.log(`    Reasoning: ${result.reasoning.substring(0, 100)}...`);
        });
        
        console.log('\n✅ Test completed successfully!');
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Provide your full 798 examples in the same format');
        console.log('2. Run full corpus analysis to get accurate rates');
        console.log('3. Update the analyzer with real corpus-derived patterns');
        console.log('4. Integrate enhanced analyzer into production system');
        console.log('5. Validate performance against current hard-coded 0.8 rate');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
if (require.main === module) {
    testCorpusProcessing();
}

module.exports = { testCorpusProcessing };
