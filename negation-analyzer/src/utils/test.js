// Test sentences for each category
const testSentences = {
  logical: [
    "Je veux pas qu'il parte",
    "Il fait jamais ses devoirs",
    "Elle comprend plus rien"
  ],
  expletive: [
    "J'ai peur qu'il vienne",
    "Avant qu'elle parte",
    "Peu s'en faut qu'il réussisse"
  ],
  ambiguous: [
    "J'ai peur qu'il vienne pas",
    "Avant qu'elle parte jamais"
  ],
  weak: [
    "Je crains qu'il parte",
    "Il doute qu'elle vienne"
  ],
  uncertain: [
    "Il dit que je pars",
    "Elle pense qu'il arrive"
  ]
};

// Test function for each mode
async function testAnalysis() {
  const analyzer = new NegationAnalyzer();
  
  console.log('=== Testing Rule-Based Mode ===');
  for (const [category, sentences] of Object.entries(testSentences)) {
    console.log(`\n${category.toUpperCase()} CASES:`);
    for (const sentence of sentences) {
      const analysis = await analyzer.analyzeNegation(sentence);
      console.log(`\nSentence: ${sentence}`);
      console.log('Analysis:', analysis);
    }
  }
  
  console.log('\n=== Testing Hybrid Mode ===');
  for (const sentence of [...testSentences.ambiguous, testSentences.expletive[0], testSentences.logical[0]]) {
    const analysis = await analyzer.analyzeNegation(sentence);
    const llmAnalysis = await classifyExpletive(sentence);
    console.log(`\nSentence: ${sentence}`);
    console.log('Pattern Analysis:', analysis);
    console.log('LLM Analysis:', llmAnalysis);
  }
  
  console.log('\n=== Testing Training Data Mode ===');
  // Add some sample training data
  const sampleTrainingData = [
    {
      text: "J'ai peur qu'il vienne",
      classification: "expletive",
      hasSubjunctive: true
    },
    {
      text: "Je veux pas qu'il parte",
      classification: "logical",
      hasSubjunctive: true
    }
  ];
  
  for (const sentence of [...testSentences.expletive, ...testSentences.logical]) {
    const analysis = await analyzer.analyzeNegation(sentence);
    const trainingAnalysis = classifyWithBinaryClassifier(sentence, sampleTrainingData);
    console.log(`\nSentence: ${sentence}`);
    console.log('Pattern Analysis:', analysis);
    console.log('Training Analysis:', trainingAnalysis);
  }
}

// Run tests
testAnalysis().catch(console.error);
