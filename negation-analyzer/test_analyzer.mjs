import NegationAnalyzer from './src/utils/NegationAnalyzer.js';
import { formatRuleBasedResult } from './src/utils/resultFormatters.js';
import { readFileSync } from 'fs';

async function testAnalyzer() {
  const analyzer = new NegationAnalyzer();
  const sentences = readFileSync('./test_sentences.txt', 'utf8').split('\n');

  console.log('Testing Negation Analyzer\n');
  console.log('='.repeat(50));

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;

    console.log('\nTesting sentence:', sentence);
    console.log('-'.repeat(50));

    try {
      const analysis = await analyzer.analyzeNegation(sentence);
      console.log('Analysis result:', JSON.stringify(analysis, null, 2));
      
      const formatted = formatRuleBasedResult(analysis);
      console.log('\nFormatted output:');
      console.log(formatted);
    } catch (error) {
      console.error('Error analyzing sentence:', error);
    }

    console.log('='.repeat(50));
  }
}

testAnalyzer().catch(console.error);
