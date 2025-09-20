const fs = require('fs');
const path = require('path');

// Extract all quoted examples from the document
function extractExamplesFromDoc() {
    const docContent = fs.readFileSync('./LINGUISTIC_ANALYSIS_SEPT_2025.md', 'utf8');
    
    // Find all quoted examples (text in quotes or > blockquotes)
    const quotedExamples = [];
    
    // Pattern 1: Text in quotes like "example text"
    const quotePattern = /"([^"]+)"/g;
    let match;
    while ((match = quotePattern.exec(docContent)) !== null) {
        const text = match[1].trim();
        if (text.length > 20 && text.includes('qu')) { // Likely French examples
            quotedExamples.push({
                text: text,
                type: 'quoted',
                context: docContent.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
            });
        }
    }
    
    // Pattern 2: Blockquote examples like > "example text"
    const blockquotePattern = />\s*"([^"]+)"/g;
    while ((match = blockquotePattern.exec(docContent)) !== null) {
        const text = match[1].trim();
        if (text.length > 10) {
            quotedExamples.push({
                text: text,
                type: 'blockquote',
                context: docContent.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
            });
        }
    }
    
    // Pattern 3: Examples after colons or in bullet points
    const examplePattern = /:\s*"([^"]+)"/g;
    while ((match = examplePattern.exec(docContent)) !== null) {
        const text = match[1].trim();
        if (text.length > 10 && text.includes('qu')) {
            quotedExamples.push({
                text: text,
                type: 'example',
                context: docContent.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
            });
        }
    }
    
    return quotedExamples;
}

// Load all corpus data
function loadCorpusData() {
    const trainingDataDir = './negation-analyzer/public/training_data/';
    const allCorpusTexts = new Set();
    
    // Load sentence files
    const sentenceFiles = fs.readdirSync(trainingDataDir)
        .filter(file => file.endsWith('_sentence.json'));
    
    sentenceFiles.forEach(filename => {
        const filePath = path.join(trainingDataDir, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        data.examples.forEach(example => {
            if (example.text) {
                allCorpusTexts.add(example.text.toLowerCase().trim());
            }
        });
    });
    
    // Load paragraph files
    const paragraphFiles = fs.readdirSync(trainingDataDir)
        .filter(file => file.endsWith('_paragraph.json'));
    
    paragraphFiles.forEach(filename => {
        const filePath = path.join(trainingDataDir, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        data.examples.forEach(example => {
            if (example.paragraph) {
                allCorpusTexts.add(example.paragraph.toLowerCase().trim());
            }
            if (example.triggerSentence) {
                allCorpusTexts.add(example.triggerSentence.toLowerCase().trim());
            }
            if (example.text) {
                allCorpusTexts.add(example.text.toLowerCase().trim());
            }
        });
    });
    
    console.log(`Loaded ${allCorpusTexts.size} unique texts from corpus`);
    return allCorpusTexts;
}

// Check if example exists in corpus
function findInCorpus(exampleText, corpusTexts) {
    const cleanExample = exampleText.toLowerCase().trim();
    
    // Exact match
    if (corpusTexts.has(cleanExample)) {
        return { found: true, matchType: 'exact' };
    }
    
    // Partial match (example is substring of corpus text)
    for (const corpusText of corpusTexts) {
        if (corpusText.includes(cleanExample) && cleanExample.length > 20) {
            return { found: true, matchType: 'partial', corpusText: corpusText.substring(0, 100) + '...' };
        }
    }
    
    // Reverse partial match (corpus text is substring of example)
    for (const corpusText of corpusTexts) {
        if (cleanExample.includes(corpusText) && corpusText.length > 20) {
            return { found: true, matchType: 'reverse_partial', corpusText: corpusText };
        }
    }
    
    return { found: false, matchType: 'none' };
}

// Main verification
function verifyCorpusExamples() {
    console.log('=== CORPUS EXAMPLE VERIFICATION ===\n');
    
    const docExamples = extractExamplesFromDoc();
    const corpusTexts = loadCorpusData();
    
    console.log(`Found ${docExamples.length} examples in document to verify\n`);
    
    let verified = 0;
    let notFound = 0;
    const notFoundExamples = [];
    
    docExamples.forEach((example, index) => {
        const result = findInCorpus(example.text, corpusTexts);
        
        if (result.found) {
            verified++;
            console.log(`✅ VERIFIED [${result.matchType}]: "${example.text.substring(0, 60)}..."`);
        } else {
            notFound++;
            notFoundExamples.push(example);
            console.log(`❌ NOT FOUND: "${example.text.substring(0, 60)}..."`);
            console.log(`   Context: ${example.context.substring(0, 80)}...`);
        }
    });
    
    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log(`Total examples checked: ${docExamples.length}`);
    console.log(`✅ Verified from corpus: ${verified} (${(verified/docExamples.length*100).toFixed(1)}%)`);
    console.log(`❌ Not found in corpus: ${notFound} (${(notFound/docExamples.length*100).toFixed(1)}%)`);
    
    if (notFoundExamples.length > 0) {
        console.log('\n=== EXAMPLES NOT FOUND IN CORPUS ===');
        notFoundExamples.forEach((example, index) => {
            console.log(`\n${index + 1}. "${example.text}"`);
            console.log(`   Type: ${example.type}`);
            console.log(`   Context: ${example.context}`);
        });
        
        console.log('\n⚠️  WARNING: Some examples in the document may not be from the actual corpus!');
        console.log('These could be:');
        console.log('- Theoretical examples');
        console.log('- Examples from other sources');
        console.log('- Modified/edited corpus examples');
        console.log('- Examples from analysis scripts vs actual training data');
    } else {
        console.log('\n✅ ALL EXAMPLES VERIFIED: All quoted examples in the document come from the actual corpus!');
    }
}

// Run verification
verifyCorpusExamples();
