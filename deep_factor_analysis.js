const fs = require('fs');
const path = require('path');

/**
 * Deep Factor Analysis for French Expletive "Ne" Prediction
 * Analyzes discourse, syntactic, and semantic factors per trigger type
 */

// Enhanced pattern definitions for deep analysis
const DEEP_PATTERNS = {
  peur_que: {
    discourse: {
      speaker_certainty: {
        high: /\b(je\s+suis\s+certain|sans\s+aucun\s+doute|évidemment|clairement|sûrement)\b/gi,
        medium: /\b(je\s+pense|il\s+me\s+semble|probablement|sans\s+doute)\b/gi,
        low: /\b(peut-être|j'ai\s+l'impression|on\s+dirait|apparemment)\b/gi
      },
      emotional_intensity: {
        high: /\b(terreur|terrifié|épouvante|panique|angoisse|cauchemar|catastrophe)\b/gi,
        medium: /\b(peur|crainte|inquiétude|anxiété|souci|préoccupation)\b/gi,
        low: /\b(légère\s+crainte|petit\s+souci|un\s+peu\s+inquiet)\b/gi
      },
      pragmatic_context: {
        polite: /\b(j'ose\s+espérer|si\s+vous\s+permettez|avec\s+votre\s+permission)\b/gi,
        emphatic: /\b(vraiment|absolument|complètement|totalement|extrêmement)\b/gi,
        hedged: /\b(plutôt|assez|quelque\s+peu|relativement|en\s+quelque\s+sorte)\b/gi
      }
    },
    syntactic: {
      verb_tense: {
        present_subj: /\b(vienne|parte|soit|ait|fasse|puisse)\b/gi,
        past_subj: /\b(vînt|partît|fût|eût|fît|pût)\b/gi,
        future_context: /\b(va|aller|futur|demain|bientôt|prochainement)\b/gi
      },
      subject_complexity: {
        simple_pronoun: /qu['']il\s+|qu['']elle\s+|qu['']on\s+/gi,
        complex_noun: /qu[''](?:le|la|les)\s+\w+(?:\s+\w+)*\s+/gi,
        relative_clause: /qu[''](?:celui|celle|ceux|celles)\s+qui\s+/gi
      },
      negation_scope: {
        clause_negation: /\b(pas|jamais|plus|rien|personne)\b/gi,
        lexical_negation: /\b(refuse|interdit|empêche|évite|impossible)\b/gi,
        partial_negation: /\b(guère|point|nullement)\b/gi
      }
    },
    semantic: {
      fear_object: {
        personal_harm: /\b(blessé|malade|mort|accident|danger|risque)\b/gi,
        social_consequences: /\b(réputation|honte|embarras|critique|jugement)\b/gi,
        failure_outcomes: /\b(échec|raté|perdu|manqué|gâché)\b/gi
      },
      temporal_urgency: {
        immediate: /\b(maintenant|tout\s+de\s+suite|immédiatement|urgent)\b/gi,
        near_future: /\b(bientôt|prochainement|dans\s+peu|sous\s+peu)\b/gi,
        distant: /\b(un\s+jour|plus\s+tard|éventuellement|à\s+l'avenir)\b/gi
      },
      consequence_severity: {
        catastrophic: /\b(irréparable|catastrophe|désastre|tragédie|ruine)\b/gi,
        serious: /\b(grave|sérieux|important|significatif|majeur)\b/gi,
        mild: /\b(léger|mineur|petit|insignifiant|négligeable)\b/gi
      }
    }
  },

  avant_que: {
    discourse: {
      temporal_sequencing: {
        strict_sequence: /\b(d'abord|ensuite|puis|enfin|premièrement|deuxièmement)\b/gi,
        causal_sequence: /\b(parce\s+que|car|donc|ainsi|par\s+conséquent)\b/gi,
        conditional_sequence: /\b(si|condition|cas|supposer|à\s+condition)\b/gi
      },
      prevention_context: {
        explicit_prevention: /\b(empêcher|éviter|prévenir|interdire|bloquer)\b/gi,
        implicit_prevention: /\b(attention|prudence|précaution|vigilance)\b/gi,
        urgency_markers: /\b(vite|urgent|dépêche|rapidement|trop\s+tard)\b/gi
      }
    },
    syntactic: {
      subjunctive_type: {
        motion_verbs: /\b(vienne|parte|aille|arrive|sorte|entre)\b/gi,
        state_verbs: /\b(soit|devienne|reste|demeure)\b/gi,
        action_verbs: /\b(fasse|dise|prenne|mette|finisse)\b/gi
      },
      clause_embedding: {
        simple_embedding: /avant\s+qu[''][^,]{1,20}[.!?]/gi,
        complex_embedding: /avant\s+qu[''][^.!?]*,[^.!?]*[.!?]/gi,
        multiple_embedding: /avant\s+qu[''][^.!?]*\b(que|qui|dont)\b/gi
      },
      temporal_markers: {
        specific_time: /\b(\d+\s*h|\d+\s*heures?|midi|minuit|matin|soir)\b/gi,
        relative_time: /\b(tôt|tard|longtemps|moment|instant|délai)\b/gi,
        deadline_markers: /\b(limite|échéance|fin|terme|expiration)\b/gi
      }
    },
    semantic: {
      prevention_vs_sequence: {
        pure_prevention: /\b(pour\s+éviter|afin\s+d'empêcher|de\s+peur\s+que)\b/gi,
        pure_sequence: /\b(chronologie|ordre|succession|séquence)\b/gi,
        mixed_context: /\b(préparation|organisation|planification)\b/gi
      },
      completion_aspect: {
        completion_focus: /\b(finir|terminer|achever|compléter|accomplir)\b/gi,
        process_focus: /\b(commencer|débuter|entamer|entreprendre)\b/gi,
        state_change: /\b(devenir|transformer|changer|évoluer)\b/gi
      }
    }
  },

  sen_faut_que: {
    discourse: {
      literary_register: {
        classical: /\b(fallut|eût|fût|submergeât|contempla|irréparable)\b/gi,
        formal_academic: /\b(il\s+convient|par\s+conséquent|néanmoins|cependant)\b/gi,
        archaic_markers: /\b(naguère|jadis|désormais|toutefois|nonobstant)\b/gi
      },
      impersonal_construction: {
        pure_impersonal: /^[^je\s+tu\s+il\s+elle\s+nous\s+vous\s+ils\s+elles]*s['']en\s+faut/gi,
        personal_context: /\b(je|tu|nous|vous)\b.*s['']en\s+faut/gi,
        narrative_context: /\b(il|elle|ils|elles)\b.*s['']en\s+faut/gi
      }
    },
    syntactic: {
      quantifier_precision: {
        precise_quantity: /\b(peu|beaucoup|trop|assez|très)\s+s['']en\s+faut/gi,
        vague_quantity: /s['']en\s+faut\s+(?:que|qu[''])/gi,
        comparative: /\b(plus|moins|autant)\b.*s['']en\s+faut/gi
      }
    },
    semantic: {
      proximity_semantics: {
        near_miss: /\b(presque|quasi|sur\s+le\s+point|à\s+deux\s+doigts)\b/gi,
        threshold_crossing: /\b(limite|seuil|frontière|bord|lisière)\b/gi,
        completion_degree: /\b(achèvement|accomplissement|réalisation)\b/gi
      }
    }
  },

  avant_de: {
    discourse: {
      preparation_context: {
        explicit_prep: /\b(préparer|organiser|planifier|prévoir|arranger)\b/gi,
        implicit_prep: /\b(d'abord|premièrement|en\s+premier)\b/gi,
        routine_context: /\b(habitude|routine|coutume|tradition)\b/gi
      }
    },
    syntactic: {
      infinitive_type: {
        motion_infinitive: /avant\s+de\s+(partir|aller|venir|sortir|entrer)/gi,
        action_infinitive: /avant\s+de\s+(faire|dire|prendre|mettre|donner)/gi,
        state_infinitive: /avant\s+de\s+(être|devenir|rester|demeurer)/gi
      }
    },
    semantic: {
      temporal_relationship: {
        immediate_sequence: /\b(tout\s+de\s+suite|immédiatement|directement)\b/gi,
        planned_sequence: /\b(prévu|programmé|planifié|organisé)\b/gi,
        conditional_sequence: /\b(si|condition|cas|éventualité)\b/gi
      }
    }
  },

  moins_plus: {
    discourse: {
      comparison_context: {
        explicit_comparison: /\b(comparer|comparaison|par\s+rapport|relativement)\b/gi,
        evaluative: /\b(mieux|pire|supérieur|inférieur|égal)\b/gi,
        quantitative: /\b(nombre|quantité|mesure|degré|niveau)\b/gi
      }
    },
    syntactic: {
      comparison_structure: {
        simple_comparison: /(plus|moins)\s+\w+\s+que?\s+/gi,
        complex_comparison: /(plus|moins)\s+\w+(?:\s+\w+)*\s+que?\s+/gi,
        superlative: /\b(le\s+plus|la\s+plus|les\s+plus|le\s+moins)\b/gi
      }
    },
    semantic: {
      comparison_domain: {
        physical_properties: /\b(grand|petit|gros|mince|haut|bas|long|court)\b/gi,
        abstract_qualities: /\b(intelligent|beau|bon|mauvais|difficile|facile)\b/gi,
        temporal_aspects: /\b(rapide|lent|tôt|tard|ancien|récent)\b/gi
      }
    }
  }
};

function analyzeDeepFactors(examples, triggerType) {
  console.log(`\n=== DEEP FACTOR ANALYSIS: ${triggerType.toUpperCase()} ===`);
  
  const patterns = DEEP_PATTERNS[triggerType];
  if (!patterns) {
    console.log(`No deep patterns defined for ${triggerType}`);
    return;
  }

  const results = {
    total: examples.length,
    expletive: examples.filter(ex => ex.hasExpletive).length,
    nonExpletive: examples.filter(ex => !ex.hasExpletive).length,
    factors: {}
  };

  // Analyze each factor category
  for (const [category, subcategories] of Object.entries(patterns)) {
    console.log(`\n--- ${category.toUpperCase()} FACTORS ---`);
    results.factors[category] = {};

    for (const [factor, subpatterns] of Object.entries(subcategories)) {
      console.log(`\n${factor}:`);
      results.factors[category][factor] = {};

      for (const [level, pattern] of Object.entries(subpatterns)) {
        const matchingExamples = examples.filter(ex => pattern.test(ex.text));
        const expletiveMatches = matchingExamples.filter(ex => ex.hasExpletive);
        
        const total = matchingExamples.length;
        const expletiveCount = expletiveMatches.length;
        const expletiveRate = total > 0 ? (expletiveCount / total * 100).toFixed(1) : 0;

        console.log(`  ${level}: ${expletiveCount}/${total} (${expletiveRate}%)`);
        
        results.factors[category][factor][level] = {
          total,
          expletive: expletiveCount,
          rate: parseFloat(expletiveRate),
          examples: matchingExamples.slice(0, 2).map(ex => ex.text.substring(0, 80) + '...')
        };
      }
    }
  }

  return results;
}

async function runDeepAnalysis() {
  console.log('🔬 DEEP FACTOR ANALYSIS FOR FRENCH EXPLETIVE "NE"');
  console.log('='.repeat(60));

  const triggers = ['peur_que', 'avant_que', 'avant_de', 'sen_faut_que', 'moins_plus'];
  const allResults = {};

  for (const trigger of triggers) {
    try {
      // Load sentence mode data
      const sentenceData = JSON.parse(
        fs.readFileSync(`./negation-analyzer/public/training_data/${trigger}_sentence.json`, 'utf8')
      );
      
      // Load paragraph mode data
      const paragraphData = JSON.parse(
        fs.readFileSync(`./negation-analyzer/public/training_data/${trigger}_paragraph.json`, 'utf8')
      );

      // Combine all examples
      const allExamples = [
        ...sentenceData.examples,
        ...paragraphData.examples
      ];

      console.log(`\nProcessing ${trigger}: ${allExamples.length} total examples`);
      allResults[trigger] = analyzeDeepFactors(allExamples, trigger);

    } catch (error) {
      console.error(`Error processing ${trigger}:`, error.message);
    }
  }

  // Cross-trigger analysis
  console.log('\n\n=== CROSS-TRIGGER DEEP PATTERNS ===');
  
  // Find the strongest predictive factors across all triggers
  const strongPredictors = [];
  
  for (const [trigger, results] of Object.entries(allResults)) {
    for (const [category, factors] of Object.entries(results.factors)) {
      for (const [factor, levels] of Object.entries(factors)) {
        for (const [level, data] of Object.entries(levels)) {
          if (data.total >= 5 && (data.rate >= 70 || data.rate <= 30)) {
            strongPredictors.push({
              trigger,
              category,
              factor,
              level,
              rate: data.rate,
              total: data.total,
              strength: Math.abs(data.rate - 50)
            });
          }
        }
      }
    }
  }

  // Sort by predictive strength
  strongPredictors.sort((a, b) => b.strength - a.strength);

  console.log('\nSTRONGEST PREDICTIVE FACTORS (>70% or <30% expletive rate):');
  strongPredictors.slice(0, 10).forEach((pred, i) => {
    console.log(`${i + 1}. ${pred.trigger} - ${pred.category}.${pred.factor}.${pred.level}: ${pred.rate}% (n=${pred.total})`);
  });

  // Save results
  fs.writeFileSync('./deep_factor_results.json', JSON.stringify(allResults, null, 2));
  console.log('\n📊 Results saved to deep_factor_results.json');
}

if (require.main === module) {
  runDeepAnalysis().catch(console.error);
}

module.exports = { analyzeDeepFactors, DEEP_PATTERNS };
