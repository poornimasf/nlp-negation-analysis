// Test cases for each category
const testCases = [
  {
    category: 'LOGICAL NEGATION',
    sentences: [
      "Je veux pas qu'il parte",
      "Il fait jamais ses devoirs",
      "Elle comprend plus rien"
    ]
  },
  {
    category: 'EXPLETIVE NEGATION',
    sentences: [
      "J'ai peur qu'il vienne",
      "Avant qu'elle parte",
      "Peu s'en faut qu'il réussisse"
    ]
  },
  {
    category: 'AMBIGUOUS CASES',
    sentences: [
      "J'ai peur qu'il vienne pas",
      "Avant qu'elle parte jamais"
    ]
  },
  {
    category: 'WEAK EXPLETIVE',
    sentences: [
      "Je crains qu'il parte",
      "Il doute qu'elle vienne"
    ]
  },
  {
    category: 'UNCERTAIN',
    sentences: [
      "Il dit que je pars",
      "Elle pense qu'il arrive"
    ]
  }
];

// Test each mode
async function testMode(mode) {
  console.log(`\n=== Testing ${mode} Mode ===\n`);
  
  // Set the mode in the UI
  document.querySelector('select').value = mode;
  document.querySelector('select').dispatchEvent(new Event('change'));
  
  for (const category of testCases) {
    console.log(`\n${category.category}:`);
    for (const sentence of category.sentences) {
      // Set the input
      document.querySelector('textarea').value = sentence;
      
      // Click analyze button
      const analyzeButton = document.querySelector('button');
      analyzeButton.click();
      
      // Wait for analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get results
      const results = document.querySelector('.result-section');
      if (results) {
        console.log(`\nSentence: ${sentence}`);
        console.log('Analysis:', results.textContent);
      }
    }
  }
}

// Run tests for each mode
async function runAllTests() {
  const modes = ['RULE_BASED', 'HYBRID', 'TRAINING_DATA'];
  for (const mode of modes) {
    await testMode(mode);
    // Wait between modes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Instructions for running in browser console
console.log(`
To test the negation analyzer:

1. Copy all test cases to clipboard:
   const testText = ${JSON.stringify(testCases.map(c => c.sentences).flat().join('\\n'), null, 2)};
   navigator.clipboard.writeText(testText);

2. Paste into the textarea

3. Test specific modes:
   - Rule-based:   await testMode('RULE_BASED')
   - Hybrid:       await testMode('HYBRID')
   - Training:     await testMode('TRAINING_DATA')

4. Or run all tests:
   await runAllTests()
`);
