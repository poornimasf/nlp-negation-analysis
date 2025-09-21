const fs = require('fs');
const { DEEP_PATTERNS } = require('./deep_factor_analysis.js');

/**
 * Paragraph Context Analysis
 * Analyzes full paragraph context vs isolated trigger sentences
 */

// Enhanced patterns for paragraph-level discourse analysis
const PARAGRAPH_DISCOURSE_PATTERNS = {
  coherence_markers: {
    high_coherence: /\b(cependant|néanmoins|toutefois|par\s+conséquent|ainsi|donc|en\s+effet|d'ailleurs|de\s+plus|en\s+outre|premièrement|deuxièmement|enfin)\b/gi,
    temporal_coherence: /\b(d'abord|ensuite|puis|enfin|finalement|avant|après|pendant|lors|durant)\b/gi,
    causal_coherence: /\b(parce\s+que|car|puisque|étant\s+donné|du\s+fait\s+que|en\s+raison\s+de|grâce\s+à|à\s+cause\s+de)\b/gi
  },
  register_consistency: {
    formal_throughout: /\b(il\s+convient|par\s+conséquent|néanmoins|cependant|monsieur|madame|veuillez)\b/gi,
    literary_throughout: /\b(fallut|eût|fût|submergeât|irréparable|contempla|naguère|jadis|désormais)\b/gi,
    academic_throughout: /\b(analyse|étude|recherche|théorie|concept|méthode|processus|système)\b/gi
  },
  discourse_complexity: {
    multiple_clauses: /[,;:]{3,}/g,
    embedded_structures: /\b(que|qui|dont|où)\b.*\b(que|qui|dont|où)\b/gi,
    parenthetical: /\([^)]{10,}\)|—[^—]{10,}—/g
  },
  contextual_buildup: {
    emotional_buildup: /\b(inquiétude|anxiété|stress|tension|préoccupation|souci)\b.*\b(peur|crainte)\b/gi,
    temporal_buildup: /\b(d'abord|premièrement|ensuite|puis|avant|finalement)\b.*\b(avant\s+que|avant\s+de)\b/gi,
    argumentative_buildup: /\b(cependant|néanmoins|mais|pourtant|toutefois)\b.*\b(peur\s+que|avant\s+que)\b/gi
  }
};

function analyzeParagraphContext(examples, triggerType) {
  console.log(`\n=== PARAGRAPH CONTEXT ANALYSIS: ${triggerType.toUpperCase()} ===`);
  
  const results = {
    total: examples.length,
    expletive: examples.filter(ex => ex.hasExpletive).length,
    nonExpletive: examples.filter(ex => !ex.hasExpletive).length,
    paragraph_factors: {},
    sentence_vs_paragraph: {}
  };

  // Analyze paragraph-level discourse factors
  for (const [category, patterns] of Object.entries(PARAGRAPH_DISCOURSE_PATTERNS)) {
    console.log(`\n--- ${category.toUpperCase()} ---`);
    results.paragraph_factors[category] = {};

    for (const [factor, pattern] of Object.entries(patterns)) {
      const matchingExamples = examples.filter(ex => 
        ex.fullParagraph && pattern.test(ex.fullParagraph)
      );
      const expletiveMatches = matchingExamples.filter(ex => ex.hasExpletive);
      
      const total = matchingExamples.length;
      const expletiveCount = expletiveMatches.length;
      const expletiveRate = total > 0 ? (expletiveCount / total * 100).toFixed(1) : 0;

      console.log(`  ${factor}: ${expletiveCount}/${total} (${expletiveRate}%)`);
      
      results.paragraph_factors[category][factor] = {
        total,
        expletive: expletiveCount,
        rate: parseFloat(expletiveRate),
        examples: matchingExamples.slice(0, 2).map(ex => ({
          trigger: ex.text.substring(0, 80) + '...',
          context: ex.fullParagraph.substring(0, 150) + '...'
        }))
      };
    }
  }

  // Compare sentence-only vs paragraph context analysis
  console.log('\n--- SENTENCE VS PARAGRAPH CONTEXT COMPARISON ---');
  
  // Analyze trigger sentences in isolation
  const triggerPatterns = DEEP_PATTERNS[triggerType];
  if (triggerPatterns) {
    for (const [category, subcategories] of Object.entries(triggerPatterns)) {
      for (const [factor, subpatterns] of Object.entries(subcategories)) {
        for (const [level, pattern] of Object.entries(subpatterns)) {
          // Sentence-only analysis
          const sentenceMatches = examples.filter(ex => pattern.test(ex.text));
          const sentenceExpletive = sentenceMatches.filter(ex => ex.hasExpletive);
          const sentenceRate = sentenceMatches.length > 0 ? 
            (sentenceExpletive.length / sentenceMatches.length * 100) : 0;

          // Paragraph context analysis
          const paragraphMatches = examples.filter(ex => 
            ex.fullParagraph && pattern.test(ex.fullParagraph)
          );
          const paragraphExpletive = paragraphMatches.filter(ex => ex.hasExpletive);
          const paragraphRate = paragraphMatches.length > 0 ? 
            (paragraphExpletive.length / paragraphMatches.length * 100) : 0;

          if (sentenceMatches.length >= 5 && paragraphMatches.length >= 5) {
            const rateDiff = paragraphRate - sentenceRate;
            
            if (Math.abs(rateDiff) >= 10) {
              console.log(`  📊 ${category}.${factor}.${level}:`);
              console.log(`     Sentence only: ${sentenceRate.toFixed(1)}% (n=${sentenceMatches.length})`);
              console.log(`     Paragraph context: ${paragraphRate.toFixed(1)}% (n=${paragraphMatches.length})`);
              console.log(`     Context effect: ${rateDiff > 0 ? '+' : ''}${rateDiff.toFixed(1)}%`);
              
              if (!results.sentence_vs_paragraph[category]) {
                results.sentence_vs_paragraph[category] = {};
              }
              if (!results.sentence_vs_paragraph[category][factor]) {
                results.sentence_vs_paragraph[category][factor] = {};
              }
              
              results.sentence_vs_paragraph[category][factor][level] = {
                sentence_rate: sentenceRate,
                paragraph_rate: paragraphRate,
                context_effect: rateDiff,
                sentence_n: sentenceMatches.length,
                paragraph_n: paragraphMatches.length
              };
            }
          }
        }
      }
    }
  }

  return results;
}

async function runParagraphContextAnalysis() {
  console.log('🔬 PARAGRAPH CONTEXT ANALYSIS');
  console.log('='.repeat(60));

  const triggers = ['peur_que', 'avant_que', 'avant_de', 'sen_faut_que', 'moins_plus'];
  const results = {};

  for (const trigger of triggers) {
    try {
      console.log(`\n📊 ANALYZING ${trigger.toUpperCase()} PARAGRAPH CONTEXT`);
      console.log('='.repeat(50));

      // Load paragraph mode data
      const paragraphData = JSON.parse(
        fs.readFileSync(`./negation-analyzer/public/training_data/${trigger}_paragraph.json`, 'utf8')
      );

      // Normalize data format
      const paragraphExamples = paragraphData.examples.map(ex => ({
        text: ex.triggerSentence || ex.text,
        hasExpletive: ex.hasExpletive,
        fullParagraph: ex.paragraph
      }));

      console.log(`Processing ${paragraphExamples.length} paragraph examples`);
      results[trigger] = analyzeParagraphContext(paragraphExamples, trigger);

    } catch (error) {
      console.error(`Error processing ${trigger}:`, error.message);
    }
  }

  // Cross-trigger paragraph effects
  console.log('\n\n=== CROSS-TRIGGER PARAGRAPH EFFECTS ===');
  
  const strongContextEffects = [];
  
  for (const [trigger, data] of Object.entries(results)) {
    // Collect strong paragraph-level factors
    for (const [category, factors] of Object.entries(data.paragraph_factors)) {
      for (const [factor, factorData] of Object.entries(factors)) {
        if (factorData.total >= 10 && (factorData.rate >= 65 || factorData.rate <= 35)) {
          strongContextEffects.push({
            trigger,
            factor: `${category}.${factor}`,
            rate: factorData.rate,
            total: factorData.total,
            strength: Math.abs(factorData.rate - 50)
          });
        }
      }
    }
  }

  strongContextEffects.sort((a, b) => b.strength - a.strength);

  console.log('\nSTRONGEST PARAGRAPH-LEVEL PREDICTORS:');
  strongContextEffects.slice(0, 10).forEach((effect, i) => {
    console.log(`${i + 1}. ${effect.trigger} - ${effect.factor}: ${effect.rate}% (n=${effect.total})`);
  });

  // Save results
  fs.writeFileSync('./paragraph_context_results.json', JSON.stringify(results, null, 2));
  console.log('\n📊 Results saved to paragraph_context_results.json');
}

if (require.main === module) {
  runParagraphContextAnalysis().catch(console.error);
}

module.exports = { analyzeParagraphContext };
