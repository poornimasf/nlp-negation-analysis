const fs = require('fs');
const path = require('path');

// Find all sentence.json files
const trainingDataDir = './negation-analyzer/public/training_data/';
const sentenceFiles = fs.readdirSync(trainingDataDir)
    .filter(file => file.endsWith('_sentence.json'));

console.log('=== COMPREHENSIVE SENTENCE TRAINING DATA ANALYSIS ===\n');
console.log(`Found ${sentenceFiles.length} sentence training files:`);
sentenceFiles.forEach(file => console.log(`  - ${file}`));
console.log();

let totalStats = {
    totalExamples: 0,
    expletiveCount: 0,
    nonExpletiveCount: 0,
    triggerStats: {}
};

let allRegisterStats = {};

sentenceFiles.forEach(filename => {
    const filePath = path.join(trainingDataDir, filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`\n--- ${data.trigger.toUpperCase()} ANALYSIS ---`);
    console.log(`File: ${filename}`);
    console.log(`Total examples: ${data.examples.length}`);
    
    // Count expletive vs non-expletive using correct field name
    const expletiveCount = data.examples.filter(ex => ex.hasExpletive === true).length;
    const nonExpletiveCount = data.examples.filter(ex => ex.hasExpletive === false).length;
    
    console.log(`Expletive examples: ${expletiveCount}`);
    console.log(`Non-expletive examples: ${nonExpletiveCount}`);
    console.log(`Balance ratio: ${expletiveCount}/${nonExpletiveCount} (${(expletiveCount/data.examples.length*100).toFixed(1)}% expletive)`);
    
    // Update total stats
    totalStats.totalExamples += data.examples.length;
    totalStats.expletiveCount += expletiveCount;
    totalStats.nonExpletiveCount += nonExpletiveCount;
    totalStats.triggerStats[data.trigger] = {
        total: data.examples.length,
        expletive: expletiveCount,
        nonExpletive: nonExpletiveCount,
        expletiveRate: (expletiveCount / data.examples.length * 100).toFixed(1)
    };
    
    // Show sample examples
    console.log('\nSample examples:');
    const expletiveExamples = data.examples.filter(ex => ex.hasExpletive === true).slice(0, 2);
    const nonExpletiveExamples = data.examples.filter(ex => ex.hasExpletive === false).slice(0, 2);
    
    console.log('  EXPLETIVE examples:');
    expletiveExamples.forEach(ex => {
        console.log(`    "${ex.text}"`);
    });
    
    console.log('  NON-EXPLETIVE examples:');
    nonExpletiveExamples.forEach(ex => {
        console.log(`    "${ex.text}"`);
    });
});

console.log('\n\n=== COMPREHENSIVE OVERALL ANALYSIS ===');
console.log(`Total examples across all triggers: ${totalStats.totalExamples}`);
console.log(`Total expletive examples: ${totalStats.expletiveCount}`);
console.log(`Total non-expletive examples: ${totalStats.nonExpletiveCount}`);
console.log(`Overall balance: ${(totalStats.expletiveCount/totalStats.totalExamples*100).toFixed(1)}% expletive`);

console.log('\nPer-trigger statistics:');
Object.entries(totalStats.triggerStats).sort((a,b) => parseFloat(b[1].expletiveRate) - parseFloat(a[1].expletiveRate)).forEach(([trigger, stats]) => {
    console.log(`  ${trigger}: ${stats.expletive}/${stats.total} (${stats.expletiveRate}% expletive)`);
});

// Check if data is actually balanced (500/500)
console.log('\n=== BALANCE VERIFICATION ===');
Object.entries(totalStats.triggerStats).forEach(([trigger, stats]) => {
    const isBalanced = stats.expletive === 500 && stats.nonExpletive === 500;
    console.log(`${trigger}: ${isBalanced ? '✅ BALANCED' : '❌ NOT BALANCED'} (${stats.expletive}/${stats.nonExpletive})`);
});
