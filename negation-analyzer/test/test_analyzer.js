const sentences = [
  {
    text: "J'ai peur qu'il vienne",
    description: "Strong expletive trigger with subjunctive"
  },
  {
    text: "Je ne veux pas qu'il parte",
    description: "Logical negation"
  },
  {
    text: "Avant qu'il parte",
    description: "Medium trigger (temporal)"
  },
  {
    text: "Il doute qu'elle réussisse",
    description: "Weak trigger with subjunctive"
  },
  {
    text: "Je crains qu'il ne soit malade",
    description: "Strong trigger with expletive ne"
  },
  {
    text: "Je crains qu'il parte",
    description: "Strong trigger with subjunctive"
  },
  {
    text: "Il ne doute pas qu'elle réussisse",
    description: "Logical negation with weak trigger"
  },
  {
    text: "Peu s'en faut qu'il ne tombe",
    description: "Medium trigger with expletive ne"
  },
  {
    text: "Je redoute qu'il ne soit trop tard",
    description: "Weak trigger with expletive ne"
  },
  {
    text: "Il évite qu'on ne le voie",
    description: "Weak trigger with expletive ne and subjunctive"
  }
];

// Text normalization
const normalizeText = (text) => {
  if (!text) return '';
  
  const accentsMap = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c'
  };

  const accentPattern = new RegExp('[' + Object.keys(accentsMap).join('') + ']', 'g');
  return text.toLowerCase().replace(accentPattern, char => accentsMap[char] || char);
};

class NegationAnalyzer {
  constructor() {
    // Logical negation markers
    this.LOGICAL_MARKERS = [
      /\b(?:pas|point|plus|jamais|rien|personne|aucun[e]?|gu[eèé]re|nullement)\b/i
    ];

    // Potentially ambiguous triggers
    this.AMBIGUOUS_TRIGGERS = {
      STRONG: [
        /\b(?:j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont)\s+(?:(?:tr[eèé]s\s+)?grand[e]?\s+)?peur\s+qu[e']/i,
        /\b(?:juste|bien|peu|longtemps)\s+avant\s+qu[e']/i,
        /\bil\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+(?:de\s+)?peu\s+qu[e']/i,
        /\b(?:je|tu|il|elle|on)\s+crains?\s+qu[e']/i
      ],
      MEDIUM: [
        /\bpeur\s+qu[e']/i,
        /\bavant\s+qu[e']/i,
        /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+qu[e']/i,
        /\b(?:craindre|craignons|craignez|craignent)\s+qu[e']/i
      ],
      WEAK: [
        /\b(?:doute[rz]?|dout(?:ons|ez|ent))\s+qu[e']/i,
        /\b(?:redouter|redoute[zsnt]?)\s+qu[e']/i,
        /\b(?:[eéè]viter|[eéè]vite[zsnt]?)\s+qu[e']/i,
        /\b(?:emp[eêè]cher|emp[eêè]che[zsnt]?)\s+qu[e']/i
      ]
    };

    // Subjunctive patterns
    this.SUBJUNCTIVE_PATTERNS = [
      /\b(?:sois|soit|soyons|soyez|soient)\b/i,
      /\b(?:aie|aies|ait|ayons|ayez|aient)\b/i,
      /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/i,
      /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/i,
      /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/i,
      /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/i,
      /\b(?:tienne|tiennes|tienne|tenions|teniez|tiennent)\b/i,
      /\b(?:r[eéè]ussisse|r[eéè]ussisses|r[eéè]ussissions|r[eéè]ussissiez|r[eéè]ussissent)\b/i,
      /\b(?:parte|partes|parte|partions|partiez|partent)\b/i,
      /\b(?:voie|voies|voie|voyions|voyiez|voient)\b/i,
      /\b(?:tombe|tombes|tombe|tombions|tombiez|tombent)\b/i
    ];

    // Expletive ne pattern
    this.EXPLETIVE_NE = /\b(?:n['e])\s+(?!pas|point|plus|jamais|rien|personne|aucun|guère|nullement)\b/i;
  }

  async analyzeNegation(text) {
    const logicalMarkers = this.findLogicalMarkers(text);
    const triggers = this.findAmbiguousTriggers(text);
    const hasSubjunctive = this.hasSubjunctive(text);
    const hasExpletiveNe = this.hasExpletiveNe(text);

    if (logicalMarkers.length > 0) {
      return {
        type: 'LOGICAL',
        confidence: 0.9,
        evidence: {
          markers: logicalMarkers.length,
          details: 'Contains logical negation markers',
          hasSubjunctive,
          hasExpletiveNe,
          triggers: {
            strong: triggers.strong.length,
            medium: triggers.medium.length,
            weak: triggers.weak.length
          }
        }
      };
    }

    if (triggers.strong.length > 0) {
      return {
        type: 'LIKELY_EXPLETIVE',
        confidence: hasSubjunctive || hasExpletiveNe ? 0.85 : 0.75,
        evidence: {
          triggers: {
            strong: triggers.strong.length,
            medium: triggers.medium.length,
            weak: triggers.weak.length
          },
          hasSubjunctive,
          hasExpletiveNe,
          details: hasSubjunctive ? 
            'Contains strong expletive triggers with subjunctive' :
            'Contains strong expletive triggers'
        }
      };
    }

    if (triggers.medium.length > 0) {
      const isLikelyExpletive = hasSubjunctive || hasExpletiveNe;
      
      return {
        type: isLikelyExpletive ? 'LIKELY_EXPLETIVE' : 'AMBIGUOUS',
        confidence: isLikelyExpletive ? 0.7 : 0.5,
        evidence: {
          triggers: {
            strong: triggers.strong.length,
            medium: triggers.medium.length,
            weak: triggers.weak.length
          },
          hasSubjunctive,
          hasExpletiveNe,
          details: isLikelyExpletive ? 
            'Contains medium expletive triggers with supporting context' :
            'Contains ambiguous triggers without clear indicators'
        }
      };
    }

    if (triggers.weak.length > 0) {
      const isLikelyExpletive = hasSubjunctive || hasExpletiveNe;
      
      return {
        type: isLikelyExpletive ? 'LIKELY_EXPLETIVE' : 'UNCERTAIN',
        confidence: isLikelyExpletive ? 0.65 : 0.5,
        evidence: {
          triggers: {
            weak: triggers.weak.length
          },
          hasSubjunctive,
          hasExpletiveNe,
          details: isLikelyExpletive ?
            'Contains weak expletive triggers with supporting context' :
            'Contains only weak potential triggers'
        }
      };
    }

    return {
      type: 'UNCERTAIN',
      confidence: 0.5,
      evidence: {
        details: 'Insufficient patterns for classification',
        hasSubjunctive,
        hasExpletiveNe
      }
    };
  }

  findLogicalMarkers(text) {
    const normalizedText = normalizeText(text);
    return this.LOGICAL_MARKERS.filter(pattern => pattern.test(normalizedText));
  }

  findAmbiguousTriggers(text) {
    const normalizedText = normalizeText(text);
    return {
      strong: this.AMBIGUOUS_TRIGGERS.STRONG.filter(pattern => pattern.test(normalizedText)),
      medium: this.AMBIGUOUS_TRIGGERS.MEDIUM.filter(pattern => pattern.test(normalizedText)),
      weak: this.AMBIGUOUS_TRIGGERS.WEAK.filter(pattern => pattern.test(normalizedText))
    };
  }

  hasSubjunctive(text) {
    const normalizedText = normalizeText(text);
    return this.SUBJUNCTIVE_PATTERNS.some(pattern => pattern.test(normalizedText));
  }

  hasExpletiveNe(text) {
    return this.EXPLETIVE_NE.test(text);
  }
}

const formatRuleBasedResult = (analysis) => {
  const output = [];
  
  switch (analysis.type) {
    case 'LOGICAL':
      output.push(`✅ LOGICAL NEGATION (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      output.push(`• Found ${analysis.evidence.markers} logical marker(s)`);
      output.push('• No expletive triggers detected');
      if (analysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      if (analysis.evidence.hasExpletiveNe) {
        output.push('• Contains expletive ne');
      }
      break;

    case 'LIKELY_EXPLETIVE':
      output.push(`ℹ️ LIKELY EXPLETIVE (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      if (analysis.evidence.triggers?.strong > 0) {
        output.push('• Found strong expletive trigger(s)');
      }
      if (analysis.evidence.triggers?.medium > 0) {
        output.push('• Found medium expletive trigger(s)');
      }
      if (analysis.evidence.triggers?.weak > 0) {
        output.push('• Found weak expletive trigger(s)');
      }
      if (analysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      if (analysis.evidence.hasExpletiveNe) {
        output.push('• Contains expletive ne');
      }
      output.push('• No logical markers detected');
      break;

    case 'AMBIGUOUS':
      output.push(`⚠️ AMBIGUOUS CASE (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      if (analysis.evidence.triggers?.strong > 0) {
        output.push('• Found strong expletive trigger(s)');
      }
      if (analysis.evidence.triggers?.medium > 0) {
        output.push('• Found medium expletive trigger(s)');
      }
      if (analysis.evidence.triggers?.weak > 0) {
        output.push('• Found weak expletive trigger(s)');
      }
      if (analysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      if (analysis.evidence.hasExpletiveNe) {
        output.push('• Contains expletive ne');
      }
      if (analysis.evidence.details) {
        output.push(`• ${analysis.evidence.details}`);
      }
      break;

    case 'UNCERTAIN':
      output.push(`❓ UNCERTAIN (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      if (analysis.evidence.triggers?.weak > 0) {
        output.push('• Found weak potential trigger(s)');
      }
      if (analysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      if (analysis.evidence.hasExpletiveNe) {
        output.push('• Contains expletive ne');
      }
      if (analysis.evidence.details) {
        output.push(`• ${analysis.evidence.details}`);
      }
      break;

    default:
      output.push(`❓ UNCERTAIN (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      output.push('• Insufficient patterns for classification');
      break;
  }

  return output.join('\n');
};

async function runTests() {
  const analyzer = new NegationAnalyzer();
  
  console.log('Testing Negation Analyzer\n');
  console.log('='.repeat(80));

  for (const { text, description } of sentences) {
    console.log(`\nTesting: ${description}`);
    console.log(`Sentence: ${text}`);
    console.log('-'.repeat(80));

    try {
      const analysis = await analyzer.analyzeNegation(text);
      console.log('Analysis result:', JSON.stringify(analysis, null, 2));
      
      const formatted = formatRuleBasedResult(analysis);
      console.log('\nFormatted output:');
      console.log(formatted);
    } catch (error) {
      console.error('Error analyzing sentence:', error);
    }

    console.log('='.repeat(80));
  }
}

runTests().catch(console.error);
