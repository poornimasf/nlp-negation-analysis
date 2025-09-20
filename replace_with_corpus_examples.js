const fs = require('fs');
const path = require('path');

// Load all corpus examples organized by trigger and type
function loadCorpusExamples() {
    const trainingDataDir = './negation-analyzer/public/training_data/';
    const corpusExamples = {
        expletive: {},
        nonExpletive: {}
    };
    
    // Load sentence files
    const sentenceFiles = fs.readdirSync(trainingDataDir)
        .filter(file => file.endsWith('_sentence.json'));
    
    sentenceFiles.forEach(filename => {
        const trigger = filename.replace('_sentence.json', '');
        const filePath = path.join(trainingDataDir, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        corpusExamples.expletive[trigger] = data.examples
            .filter(ex => ex.hasExpletive === true)
            .slice(0, 20); // Get first 20 for variety
            
        corpusExamples.nonExpletive[trigger] = data.examples
            .filter(ex => ex.hasExpletive === false)
            .slice(0, 20);
    });
    
    return corpusExamples;
}

// Find good examples for different contexts
function findExamplesByContext(corpusExamples) {
    const examples = {
        expletive: {
            emotional: [],
            temporal: [],
            literary: [],
            formal: [],
            simple: []
        },
        nonExpletive: {
            neutral: [],
            technical: [],
            conversational: [],
            simple: []
        }
    };
    
    // Categorize expletive examples
    for (const [trigger, triggerExamples] of Object.entries(corpusExamples.expletive)) {
        triggerExamples.forEach(ex => {
            const text = ex.text.toLowerCase();
            
            // Emotional contexts (peur_que, etc.)
            if (text.includes('peur') || text.includes('crainte') || text.includes('redoute')) {
                examples.expletive.emotional.push({...ex, trigger});
            }
            // Temporal contexts (avant_que, etc.)
            else if (text.includes('avant') || text.includes('temps') || text.includes('tard')) {
                examples.expletive.temporal.push({...ex, trigger});
            }
            // Literary style (complex vocabulary, classical forms)
            else if (text.includes('fallut') || text.includes('submergeât') || text.includes('eût') || text.length > 150) {
                examples.expletive.literary.push({...ex, trigger});
            }
            // Formal contexts
            else if (text.includes('convient') || text.includes('conséquent') || text.includes('néanmoins')) {
                examples.expletive.formal.push({...ex, trigger});
            }
            // Simple examples
            else if (text.length < 100) {
                examples.expletive.simple.push({...ex, trigger});
            }
        });
    }
    
    // Categorize non-expletive examples
    for (const [trigger, triggerExamples] of Object.entries(corpusExamples.nonExpletive)) {
        triggerExamples.forEach(ex => {
            const text = ex.text.toLowerCase();
            
            // Technical contexts
            if (text.includes('système') || text.includes('données') || text.includes('processus') || text.includes('installation')) {
                examples.nonExpletive.technical.push({...ex, trigger});
            }
            // Conversational contexts
            else if (text.includes('bon') || text.includes('allez') || text.includes('ça') || text.includes('faut qu\'on')) {
                examples.nonExpletive.conversational.push({...ex, trigger});
            }
            // Neutral contexts
            else if (text.length < 120) {
                examples.nonExpletive.neutral.push({...ex, trigger});
            }
            // Simple examples
            else {
                examples.nonExpletive.simple.push({...ex, trigger});
            }
        });
    }
    
    return examples;
}

// Generate replacement examples with multiple triggers when possible
function generateReplacements() {
    const corpusExamples = loadCorpusExamples();
    const categorizedExamples = findExamplesByContext(corpusExamples);
    
    console.log('=== CORPUS EXAMPLE REPLACEMENTS ===\n');
    
    // Print available examples by category
    console.log('Available examples by category:');
    for (const [type, categories] of Object.entries(categorizedExamples)) {
        console.log(`\n${type.toUpperCase()}:`);
        for (const [category, examples] of Object.entries(categories)) {
            console.log(`  ${category}: ${examples.length} examples`);
            if (examples.length > 0) {
                // Show triggers represented
                const triggers = [...new Set(examples.map(ex => ex.trigger))];
                console.log(`    Triggers: ${triggers.join(', ')}`);
            }
        }
    }
    
    console.log('\n=== REPLACEMENT EXAMPLES ===\n');
    
    // Generate specific replacements for document sections
    
    console.log('**Expletive "Ne" Examples (hasExpletive: true):**\n');
    
    // Emotional contexts
    if (categorizedExamples.expletive.emotional.length > 0) {
        console.log('*Emotional/Fear Contexts:*');
        categorizedExamples.expletive.emotional.slice(0, 2).forEach(ex => {
            console.log(`- "${ex.text}" (${ex.trigger})`);
        });
        console.log();
    }
    
    // Temporal contexts
    if (categorizedExamples.expletive.temporal.length > 0) {
        console.log('*Temporal Contexts:*');
        categorizedExamples.expletive.temporal.slice(0, 2).forEach(ex => {
            console.log(`- "${ex.text}" (${ex.trigger})`);
        });
        console.log();
    }
    
    // Literary contexts
    if (categorizedExamples.expletive.literary.length > 0) {
        console.log('*Literary/Formal Contexts:*');
        categorizedExamples.expletive.literary.slice(0, 2).forEach(ex => {
            console.log(`- "${ex.text}" (${ex.trigger})`);
        });
        console.log();
    }
    
    console.log('**Non-Expletive Examples (hasExpletive: false):**\n');
    
    // Technical contexts
    if (categorizedExamples.nonExpletive.technical.length > 0) {
        console.log('*Technical/Procedural:*');
        categorizedExamples.nonExpletive.technical.slice(0, 2).forEach(ex => {
            console.log(`- "${ex.text}" (${ex.trigger})`);
        });
        console.log();
    }
    
    // Neutral contexts
    if (categorizedExamples.nonExpletive.neutral.length > 0) {
        console.log('*Neutral/Factual:*');
        categorizedExamples.nonExpletive.neutral.slice(0, 2).forEach(ex => {
            console.log(`- "${ex.text}" (${ex.trigger})`);
        });
        console.log();
    }
    
    // Conversational contexts
    if (categorizedExamples.nonExpletive.conversational.length > 0) {
        console.log('*Conversational/Informal:*');
        categorizedExamples.nonExpletive.conversational.slice(0, 2).forEach(ex => {
            console.log(`- "${ex.text}" (${ex.trigger})`);
        });
        console.log();
    }
    
    // Cross-trigger examples for discourse analysis
    console.log('=== CROSS-TRIGGER DISCOURSE EXAMPLES ===\n');
    
    // Find examples that demonstrate register differences across triggers
    const registerExamples = {
        literary: [],
        formal: [],
        conversational: [],
        technical: []
    };
    
    // Collect examples by register across all triggers
    for (const [trigger, examples] of Object.entries(corpusExamples.expletive)) {
        examples.forEach(ex => {
            const text = ex.text.toLowerCase();
            if (text.includes('fallut') || text.includes('submergeât') || text.length > 150) {
                registerExamples.literary.push({...ex, trigger, hasExpletive: true});
            } else if (text.includes('convient') || text.includes('conséquent')) {
                registerExamples.formal.push({...ex, trigger, hasExpletive: true});
            }
        });
    }
    
    for (const [trigger, examples] of Object.entries(corpusExamples.nonExpletive)) {
        examples.forEach(ex => {
            const text = ex.text.toLowerCase();
            if (text.includes('système') || text.includes('données')) {
                registerExamples.technical.push({...ex, trigger, hasExpletive: false});
            } else if (text.includes('bon') || text.includes('ça')) {
                registerExamples.conversational.push({...ex, trigger, hasExpletive: false});
            }
        });
    }
    
    console.log('**Register-based examples across triggers:**\n');
    
    for (const [register, examples] of Object.entries(registerExamples)) {
        if (examples.length > 0) {
            console.log(`*${register.charAt(0).toUpperCase() + register.slice(1)} register:*`);
            const triggers = [...new Set(examples.map(ex => ex.trigger))];
            console.log(`Available triggers: ${triggers.join(', ')}`);
            examples.slice(0, 2).forEach(ex => {
                const expStatus = ex.hasExpletive ? 'EXPLETIVE' : 'NON-EXPLETIVE';
                console.log(`> "${ex.text}" (${ex.trigger}, ${expStatus})`);
            });
            console.log();
        }
    }
    
    return {
        categorizedExamples,
        registerExamples
    };
}

// Run the analysis
generateReplacements();
