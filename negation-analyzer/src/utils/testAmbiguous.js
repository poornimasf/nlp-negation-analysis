const ambiguousCases = [
  // Peur que with logical negation
  "J'ai peur qu'il ne vienne pas",
  "J'ai peur qu'il ne fasse jamais rien",
  "Je n'ai pas peur qu'il vienne",
  
  // Avant que with logical negation
  "Avant qu'il ne parte pas",
  "Avant qu'il ne fasse plus rien",
  "Je ne partirai pas avant qu'il vienne",
  
  // Peu s'en faut with logical negation
  "Peu s'en faut qu'il ne réussisse pas",
  "Peu s'en faut qu'il n'ait jamais rien fait",
  
  // Pure expletive cases for comparison
  "J'ai peur qu'il vienne",
  "Avant qu'il parte",
  "Peu s'en faut qu'il réussisse",
  
  // Pure logical cases for comparison
  "Il ne vient pas",
  "Il ne fait jamais rien",
  "Je ne pars plus"
];

async function testAmbiguousCases() {
  const analyzer = new NegationAnalyzer();
  
  console.log('=== Testing Ambiguous Cases ===\n');
  
  for (const sentence of ambiguousCases) {
    console.log(`Sentence: ${sentence}`);
    const analysis = await analyzer.analyzeNegation(sentence);
    console.log('Analysis:', JSON.stringify(analysis, null, 2));
    console.log('---\n');
  }
}

// Run tests
console.log('To test ambiguous cases, run:');
console.log('await testAmbiguousCases()');
