/**
 * Test Script for Peur Que Corpus Analysis
 * Processes the corpus and generates enhancement rules for the negation prediction system
 */

const PeurQueCorpusAnalyzer = require('./peur_que_corpus_analysis.js');

// Sample corpus data (you would replace this with your full corpus)
const corpusText = `
===WITHOUT EXPLETIVE=== 
merci beaucoup Val, j'ai appelé le veto à 14h aujourd hui, en effet, elle a bcp vomi. il m'a dit repos repos repos... j'ai laissé fifa se reposer toute la journée, je suis représenter sa gamelle plusieurs fois, 1 fois avec du thon, une fois avec du fromage, une fois sans rien... elle ne mange pas, mon veto m a dit de ne pas la faire beaucoup boire,.... je dois l appeler demain pour lui donner des news... je pense qu on va aller le voir, car du coup elle ne prends pas ses medocs car il faut qu'elle mange avec... je m'inquiète, j ai la boule au ventre, elle vient me chercher dans la maison avec ses yeux rouge et brillant, elle me fait de la peine... Merci encore pour ton message, je te tiens au courant,... j'ai peur que la stérilisation lui ai fait quelque chose dedans, demain on doit lui enlever le bandage... à demain... je prie pour que ça aille mieux...

La personne âgée doit se sentir en sécurité et ne doit pas avoir peur que son chien la fasse chuter en tirant trop fort sur la laisse ou en sautant sur elle, même pour jouer.

C'est quand on a peur que ça arrive ! » Les idées fusent : abaisser la majorité à 16 ans ?

Elle a eu peur que je lui remplisse la bouche ? – Ce n'est pas « ma copine », Marek, mais pour le reste, je te l'ai amenée pour ça.

j'ai eu peur que vous eussiez fait une galette des Rois aux épinards.... Superbe idée que la pâte de pistache, et jolie, en plus...

j'ai peur que ça fasse beaucoup de route mais je préfère en avoir le coeur net, car si C'est faisable je n'hésiterai pas une seconde à te confier Jun^^ Mais je préfère éviter de lui faire faire 4h de route quoi :/

===WITH EXPLETIVE===
Le suspect explique son comportement par le fait que le véhicule ne lui appartient pas et qu'à la vue de la police, il a eu peur que la voiture ne soit saisie, car il n' avait pas de documents en règles.

j'en atteste les dieux : connaissant la frivolité naturelle de mon fils, j'ai eu peur qu'Aurélien ne le punît trop durement pour quelque légèreté qu'il aurait commise. »

j'ai eu peur que notre amitié ne fût sujette aux décrets d'une vanité déjà caduque, et que vous n'y eussiez pas vu autre chose qu'un pis aller, des relations quasi obligées de voisinage dans cette solitude, à défaut de meilleures...

Il a raconté que vous le suiviez et qu'il avait peur que vous ne l'éliminiez. Il l'a même écrit sur son testament.

Ce dernier est muselé aujourd'hui par le Dg Mbemi qui a peur que celui-ci ne lui fasse ombrage et monopolise tout , alors qu'il ignore tout du domaine de l'énergie.
`;

function runCorpusAnalysis() {
    console.log('🔍 Starting Peur Que Corpus Analysis...\n');
    
    const analyzer = new PeurQueCorpusAnalyzer();
    
    // Split corpus into sentences for analysis
    const sentences = corpusText.split('\n').filter(s => s.trim().length > 0);
    
    // Run the analysis
    const results = analyzer.analyzeCorpus(sentences);
    
    // Display statistics
    console.log('📊 CORPUS STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total sentences analyzed: ${results.statistics.total}`);
    console.log(`Without expletive: ${results.statistics.withoutExpletive} (${((1-results.statistics.expletiveRate) * 100).toFixed(1)}%)`);
    console.log(`With expletive: ${results.statistics.withExpletive} (${(results.statistics.expletiveRate * 100).toFixed(1)}%)`);
    console.log();
    
    // Display pattern analysis
    console.log('🎯 PATTERN ANALYSIS');
    console.log('='.repeat(50));
    
    // Semantic domains
    console.log('\n📋 Semantic Domains:');
    const domains = results.statistics.patternCounts.semantic.domains;
    for (const [domain, stats] of Object.entries(domains)) {
        if (stats.total >= 2) {
            console.log(`  ${domain}: ${(stats.expletiveRate * 100).toFixed(1)}% expletive (${stats.withExpletive}/${stats.total})`);
        }
    }
    
    // Register analysis
    console.log('\n📝 Register Analysis:');
    const registers = results.statistics.patternCounts.discourse.register;
    for (const [register, stats] of Object.entries(registers)) {
        if (stats.total >= 2) {
            console.log(`  ${register}: ${(stats.expletiveRate * 100).toFixed(1)}% expletive (${stats.withExpletive}/${stats.total})`);
        }
    }
    
    // Subject types
    console.log('\n👤 Subject Types:');
    const subjects = results.statistics.patternCounts.syntactic.subjectTypes;
    for (const [subject, stats] of Object.entries(subjects)) {
        if (stats.total >= 2) {
            console.log(`  ${subject}: ${(stats.expletiveRate * 100).toFixed(1)}% expletive (${stats.withExpletive}/${stats.total})`);
        }
    }
    
    // Generate enhancement rules
    console.log('\n🚀 ENHANCEMENT RULES');
    console.log('='.repeat(50));
    const rules = analyzer.generateEnhancementRules();
    
    if (rules.length > 0) {
        console.log('\nTop enhancement rules based on corpus patterns:');
        rules.slice(0, 10).forEach((rule, index) => {
            console.log(`${index + 1}. ${rule.description}`);
        });
    } else {
        console.log('No strong patterns found with current sample size.');
        console.log('Recommendation: Analyze larger corpus for reliable patterns.');
    }
    
    // Sample sentence analysis
    console.log('\n📝 SAMPLE SENTENCE ANALYSIS');
    console.log('='.repeat(50));
    
    if (results.withoutExpletive.length > 0) {
        console.log('\nWithout expletive example:');
        const sample = results.withoutExpletive[0];
        console.log(`Text: "${sample.text}"`);
        console.log(`Semantic domain: ${sample.semantic.domain}`);
        console.log(`Register: ${sample.discourse.register}`);
        console.log(`Subject type: ${sample.syntactic.subjectType}`);
        console.log(`Confidence: ${(sample.confidence * 100).toFixed(1)}%`);
    }
    
    if (results.withExpletive.length > 0) {
        console.log('\nWith expletive example:');
        const sample = results.withExpletive[0];
        console.log(`Text: "${sample.text}"`);
        console.log(`Semantic domain: ${sample.semantic.domain}`);
        console.log(`Register: ${sample.discourse.register}`);
        console.log(`Subject type: ${sample.syntactic.subjectType}`);
        console.log(`Confidence: ${(sample.confidence * 100).toFixed(1)}%`);
    }
    
    // Integration recommendations
    console.log('\n🔧 INTEGRATION RECOMMENDATIONS');
    console.log('='.repeat(50));
    console.log('1. Replace hard-coded 0.8 expletive rate with context-specific rates');
    console.log('2. Add semantic domain detection to ruleBasedAnalyzer.js');
    console.log('3. Implement register analysis for formal vs informal contexts');
    console.log('4. Create weighted scoring system combining multiple factors');
    console.log('5. Add confidence intervals based on pattern support');
    
    return results;
}

// Run the analysis
if (require.main === module) {
    try {
        const results = runCorpusAnalysis();
        console.log('\n✅ Analysis completed successfully!');
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        console.error(error.stack);
    }
}

module.exports = { runCorpusAnalysis };
