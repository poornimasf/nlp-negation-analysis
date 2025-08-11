// Simple test for sentence boundary detection
const testSentence = "Pas trop épais sinon le poids va la faire tomber avant qu'elle s'accroche ! Je reviendrai avec d'autres questions n'en doutez pas!";

console.log('🧪 Testing Sentence Boundary Detection');
console.log('=====================================');
console.log('Input:', testSentence);
console.log('');

// Test sentence splitting logic
function splitIntoSentences(text) {
    // Split on sentence-ending punctuation, keeping the punctuation
    const sentences = text.split(/([.!?]+)/).filter(part => part.trim().length > 0);
    
    // Recombine sentences with their punctuation
    const result = [];
    for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i]?.trim();
        const punctuation = sentences[i + 1] || '';
        if (sentence) {
            result.push((sentence + punctuation).trim());
        }
    }
    
    return result.length > 0 ? result : [text]; // Fallback to original if no splits
}

// Test target sentence identification
function findTargetSentence(sentences, originalSentence) {
    // Look for expletive trigger patterns to identify the relevant sentence
    const triggerPatterns = [
        /\bavant\s+qu[e']?\b/i,
        /\bpeur\s+qu[e']?\b/i,
        /\bpeu\s+s'en\s+faut\b/i,
        /\bcrainte\s+qu[e']?\b/i,
        /\bde\s+peur\s+qu[e']?\b/i
    ];
    
    for (const sentence of sentences) {
        for (const pattern of triggerPatterns) {
            if (pattern.test(sentence)) {
                return sentence;
            }
        }
    }
    
    // If no trigger found, return the first sentence (fallback)
    return sentences[0] || originalSentence;
}

// Test the functions
const sentences = splitIntoSentences(testSentence);
console.log('📝 Sentences detected:', sentences.length);
sentences.forEach((sentence, i) => {
    console.log(`  ${i + 1}: "${sentence}"`);
});
console.log('');

const targetSentence = findTargetSentence(sentences, testSentence);
console.log('🎯 Target sentence (contains "avant que"):', `"${targetSentence}"`);
console.log('');

// Test logical negation detection on each sentence
console.log('🔍 Logical Negation Analysis:');
sentences.forEach((sentence, i) => {
    const hasLogical = /\b(?:pas|jamais|plus|guère|point|rien|personne|aucun|nulle?|ni)\b/i.test(sentence);
    console.log(`  Sentence ${i + 1}: ${hasLogical ? '✅ HAS logical negation' : '❌ No logical negation'}`);
    if (hasLogical) {
        const matches = sentence.match(/\b(?:pas|jamais|plus|guère|point|rien|personne|aucun|nulle?|ni)\b/gi);
        console.log(`    Indicators: ${matches.join(', ')}`);
    }
});
console.log('');

console.log('🎯 Expected Behavior:');
console.log('  - Only analyze logical negation in the target sentence');
console.log('  - Target sentence: "Pas trop épais..." (has "pas" but also "avant que")');
console.log('  - Other sentence: "Je reviendrai..." (has "n\'en...pas" but no expletive context)');
console.log('  - Result: Should focus on target sentence only');
