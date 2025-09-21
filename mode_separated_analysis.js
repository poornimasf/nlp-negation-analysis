const fs = require('fs');
const { analyzeDeepFactors, DEEP_PATTERNS } = require('./deep_factor_analysis.js');

/**
 * Mode-Separated Deep Factor Analysis
 * Analyzes sentence vs paragraph patterns separately for each trigger
 */

async function runModeSeparatedAnalysis() {
  console.log('🔬 MODE-SEPARATED DEEP FACTOR ANALYSIS');
  console.log('='.repeat(60));

  const triggers = ['peur_que', 'avant_que', 'avant_de', 'sen_faut_que', 'moins_plus'];
  const results = {
    sentence_mode: {},
    paragraph_mode: {},
    mode_differences: {}
  };

  for (const trigger of triggers) {
    try {
      console.log(`\n📊 ANALYZING ${trigger.toUpperCase()}`);
      console.log('='.repeat(40));

      // Load sentence mode data
      const sentenceData = JSON.parse(
        fs.readFileSync(`./negation-analyzer/public/training_data/${trigger}_sentence.json`, 'utf8')
      );
      
      // Load paragraph mode data  
      const paragraphData = JSON.parse(
        fs.readFileSync(`./negation-analyzer/public/training_data/${trigger}_paragraph.json`, 'utf8')
      );

      // Normalize data formats
      const sentenceExamples = sentenceData.examples.map(ex => ({
        text: ex.text || ex.triggerSentence,
        hasExpletive: ex.hasExpletive
      }));
      
      const paragraphExamples = paragraphData.examples.map(ex => ({
        text: ex.triggerSentence || ex.text, // Use triggerSentence for paragraph mode
        hasExpletive: ex.hasExpletive,
        fullParagraph: ex.paragraph // Keep full context for paragraph analysis
      }));

      console.log(`Sentence mode: ${sentenceExamples.length} examples`);
      console.log(`Paragraph mode: ${paragraphExamples.length} examples`);

      // Analyze each mode separately
      console.log('\n--- SENTENCE MODE ANALYSIS ---');
      results.sentence_mode[trigger] = analyzeDeepFactors(sentenceExamples, trigger);
      
      console.log('\n--- PARAGRAPH MODE ANALYSIS ---');
      results.paragraph_mode[trigger] = analyzeDeepFactors(paragraphExamples, trigger);

      // Compare modes
      console.log('\n--- MODE COMPARISON ---');
      results.mode_differences[trigger] = compareModes(
        results.sentence_mode[trigger], 
        results.paragraph_mode[trigger], 
        trigger
      );

    } catch (error) {
      console.error(`Error processing ${trigger}:`, error.message);
    }
  }

  // Cross-trigger mode analysis
  console.log('\n\n=== CROSS-TRIGGER MODE PATTERNS ===');
  analyzeCrossModeDifferences(results);

  // Save results
  fs.writeFileSync('./mode_separated_results.json', JSON.stringify(results, null, 2));
  console.log('\n📊 Results saved to mode_separated_results.json');
}

function compareModes(sentenceResults, paragraphResults, trigger) {
  console.log(`Comparing sentence vs paragraph mode for ${trigger}:`);
  
  const differences = {
    baseline_rates: {
      sentence: sentenceResults.expletive / sentenceResults.total,
      paragraph: paragraphResults.expletive / paragraphResults.total,
      difference: (paragraphResults.expletive / paragraphResults.total) - (sentenceResults.expletive / sentenceResults.total)
    },
    significant_differences: []
  };

  console.log(`Baseline expletive rates:`);
  console.log(`  Sentence: ${(differences.baseline_rates.sentence * 100).toFixed(1)}%`);
  console.log(`  Paragraph: ${(differences.baseline_rates.paragraph * 100).toFixed(1)}%`);
  console.log(`  Difference: ${(differences.baseline_rates.difference * 100).toFixed(1)}% ${differences.baseline_rates.difference > 0 ? '(paragraph higher)' : '(sentence higher)'}`);

  // Compare factor patterns between modes
  if (sentenceResults.factors && paragraphResults.factors) {
    for (const [category, factors] of Object.entries(sentenceResults.factors)) {
      if (paragraphResults.factors[category]) {
        for (const [factor, levels] of Object.entries(factors)) {
          if (paragraphResults.factors[category][factor]) {
            for (const [level, sentenceData] of Object.entries(levels)) {
              const paragraphData = paragraphResults.factors[category][factor][level];
              
              if (sentenceData.total >= 5 && paragraphData.total >= 5) {
                const rateDiff = paragraphData.rate - sentenceData.rate;
                
                if (Math.abs(rateDiff) >= 15) { // 15% difference threshold
                  differences.significant_differences.push({
                    factor: `${category}.${factor}.${level}`,
                    sentence_rate: sentenceData.rate,
                    paragraph_rate: paragraphData.rate,
                    difference: rateDiff,
                    sentence_n: sentenceData.total,
                    paragraph_n: paragraphData.total
                  });
                  
                  console.log(`  📈 ${category}.${factor}.${level}:`);
                  console.log(`     Sentence: ${sentenceData.rate}% (n=${sentenceData.total})`);
                  console.log(`     Paragraph: ${paragraphData.rate}% (n=${paragraphData.total})`);
                  console.log(`     Difference: ${rateDiff > 0 ? '+' : ''}${rateDiff.toFixed(1)}%`);
                }
              }
            }
          }
        }
      }
    }
  }

  return differences;
}

function analyzeCrossModeDifferences(results) {
  console.log('\nMODE-SPECIFIC PATTERNS ACROSS ALL TRIGGERS:');
  
  const sentencePatterns = [];
  const paragraphPatterns = [];
  
  // Collect strong patterns for each mode
  for (const [trigger, modeData] of Object.entries(results.mode_differences)) {
    modeData.significant_differences.forEach(diff => {
      if (diff.difference > 15) {
        paragraphPatterns.push({
          trigger,
          factor: diff.factor,
          advantage: diff.difference,
          paragraph_rate: diff.paragraph_rate
        });
      } else if (diff.difference < -15) {
        sentencePatterns.push({
          trigger,
          factor: diff.factor,
          advantage: Math.abs(diff.difference),
          sentence_rate: diff.sentence_rate
        });
      }
    });
  }

  console.log('\nFACTORS THAT FAVOR PARAGRAPH MODE (higher expletive rates):');
  paragraphPatterns
    .sort((a, b) => b.advantage - a.advantage)
    .slice(0, 5)
    .forEach((pattern, i) => {
      console.log(`${i + 1}. ${pattern.trigger} - ${pattern.factor}: +${pattern.advantage.toFixed(1)}% (${pattern.paragraph_rate.toFixed(1)}% in paragraphs)`);
    });

  console.log('\nFACTORS THAT FAVOR SENTENCE MODE (higher expletive rates):');
  sentencePatterns
    .sort((a, b) => b.advantage - a.advantage)
    .slice(0, 5)
    .forEach((pattern, i) => {
      console.log(`${i + 1}. ${pattern.trigger} - ${pattern.factor}: +${pattern.advantage.toFixed(1)}% (${pattern.sentence_rate.toFixed(1)}% in sentences)`);
    });

  // Overall mode effects
  console.log('\nOVERALL MODE EFFECTS:');
  const overallSentence = Object.values(results.sentence_mode).reduce((acc, curr) => {
    acc.total += curr.total;
    acc.expletive += curr.expletive;
    return acc;
  }, { total: 0, expletive: 0 });

  const overallParagraph = Object.values(results.paragraph_mode).reduce((acc, curr) => {
    acc.total += curr.total;
    acc.expletive += curr.expletive;
    return acc;
  }, { total: 0, expletive: 0 });

  const sentenceRate = (overallSentence.expletive / overallSentence.total * 100).toFixed(1);
  const paragraphRate = (overallParagraph.expletive / overallParagraph.total * 100).toFixed(1);
  const overallDiff = paragraphRate - sentenceRate;

  console.log(`Overall sentence mode: ${sentenceRate}% expletive rate (n=${overallSentence.total})`);
  console.log(`Overall paragraph mode: ${paragraphRate}% expletive rate (n=${overallParagraph.total})`);
  console.log(`Overall difference: ${overallDiff > 0 ? '+' : ''}${overallDiff}% ${overallDiff > 0 ? '(paragraph mode favors expletive)' : '(sentence mode favors expletive)'}`);
}

if (require.main === module) {
  runModeSeparatedAnalysis().catch(console.error);
}

module.exports = { runModeSeparatedAnalysis };
