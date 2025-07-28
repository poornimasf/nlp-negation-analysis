// Highlight different parts of the text
export const highlight = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let output = text;
  
  // Comprehensive expletive triggers
  const TRIGGER_PATTERNS = [
    // Fear expressions
    /\b(?:j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont)\s+(?:(?:très\s+)?grand[e]?\s+)?peur\s+qu[e']/gi,
    /\bpeur\s+qu[e']/gi,
    
    // Temporal expressions
    /\b(?:juste|bien|peu|longtemps)\s+avant\s+qu[e']/gi,
    /\bavant\s+qu[e']/gi,
    
    // Peu s'en faut expressions
    /\bil\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+(?:de\s+)?peu\s+qu[e']/gi,
    /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+qu[e']/gi,
    
    // Other expletive triggers
    /\b(?:craindre|redouter|douter|éviter|empêcher)\s+qu[e']/gi,
    /\b(?:je\s+crains|tu\s+crains|il\s+craint)\s+qu[e']/gi
  ];
  
  // Comprehensive logical markers
  const LOGICAL_MARKERS = [
    // Standard negation
    /\bne\s+(?:pas|point)\b/gi,
    /\bn[']\s*(?:pas|point)\b/gi,
    
    // Time-based negation
    /\bne\s+(?:jamais|plus)\b/gi,
    /\bn[']\s*(?:jamais|plus)\b/gi,
    
    // Quantity negation
    /\bne\s+(?:rien|personne|aucun[e]?|nul[le]?)\b/gi,
    /\bn[']\s*(?:rien|personne|aucun[e]?|nul[le]?)\b/gi,
    
    // Other negation
    /\bne\s+(?:guère|nullement)\b/gi,
    /\bn[']\s*(?:guère|nullement)\b/gi,
    
    // Standalone negation words
    /\b(?:jamais|rien|personne|aucun[e]?|nul[le]?|point)\b/gi
  ];
  
  // Subjunctive patterns
  const SUBJUNCTIVE_PATTERNS = [
    // être
    /\b(?:sois|soit|soyons|soyez|soient)\b/gi,
    
    // avoir
    /\b(?:aie|aies|ait|ayons|ayez|aient)\b/gi,
    
    // faire
    /\b(?:fasse|fasses|fasse|fassions|fassiez|fassent)\b/gi,
    
    // pouvoir
    /\b(?:puisse|puisses|puisse|puissions|puissiez|puissent)\b/gi,
    
    // Common irregular verbs
    /\b(?:vienne|viennes|vienne|venions|veniez|viennent)\b/gi,
    /\b(?:prenne|prennes|prenne|prenions|preniez|prennent)\b/gi,
    /\b(?:tienne|tiennes|tienne|tenions|teniez|tiennent)\b/gi
  ];
  
  // Apply highlights
  try {
    // Highlight triggers in yellow
    TRIGGER_PATTERNS.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const escapedMatch = match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const triggerRegex = new RegExp(`(${escapedMatch})`, 'gi');
        output = output.replace(triggerRegex, '<span class="highlight-yellow">$1</span>');
      });
    });
    
    // Highlight "ne" and "n'" in green
    output = output.replace(/\b(ne|n')\b/gi, '<span class="highlight-green">$1</span>');
    
    // Highlight logical markers in red
    LOGICAL_MARKERS.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const escapedMatch = match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const markerRegex = new RegExp(`(${escapedMatch})`, 'gi');
        output = output.replace(markerRegex, '<span class="highlight-red">$1</span>');
      });
    });
    
    // Highlight subjunctive in blue
    SUBJUNCTIVE_PATTERNS.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const escapedMatch = match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const subjRegex = new RegExp(`(${escapedMatch})`, 'gi');
        output = output.replace(subjRegex, '<span class="highlight-blue">$1</span>');
      });
    });
  } catch (error) {
    console.error('Error in highlighting:', error);
  }
  
  return output;
};

// Determine final classification from analysis
export const determineClassification = (text, analysis) => {
  if (!analysis) return "Uncertain";

  // Get the full analysis text to check all lines
  const analysisLines = analysis.split('\n');
  const firstLine = analysisLines[0];
  const fullText = analysisLines.join(' ');

  // Direct match for explicit classifications
  if (firstLine.includes('✅ EXPLETIVE NEGATION')) {
    return "Expletive";
  }
  
  if (firstLine.includes('✅ LOGICAL NEGATION')) {
    return "Logical";
  }

  // Handle ambiguous cases
  if (firstLine.includes('⚠️ AMBIGUOUS CASE')) {
    // Check for LLM resolution
    if (fullText.includes('LLM ANALYSIS:')) {
      // Look for specific LLM indicators
      const llmSection = fullText.substring(fullText.indexOf('LLM ANALYSIS:'));
      if (llmSection.toLowerCase().includes('expletive marker') || 
          llmSection.toLowerCase().includes('expletive negation')) {
        return "Expletive (LLM)";
      }
      if (llmSection.toLowerCase().includes('logical marker') || 
          llmSection.toLowerCase().includes('logical negation')) {
        return "Logical (LLM)";
      }
    }
    
    // Check for training data resolution
    if (fullText.includes('TRAINING DATA:')) {
      // Look for similar examples
      if (fullText.toLowerCase().includes('similar expletive examples') || 
          fullText.toLowerCase().includes('expletive pattern')) {
        return "Expletive (Training)";
      }
      if (fullText.toLowerCase().includes('similar logical examples') || 
          fullText.toLowerCase().includes('logical pattern')) {
        return "Logical (Training)";
      }
    }
    
    // Check evidence strength
    const hasStrongExpletive = fullText.toLowerCase().includes('strong expletive trigger');
    const hasLogicalMarkers = fullText.toLowerCase().includes('logical marker');
    const hasSubjunctive = fullText.toLowerCase().includes('subjunctive mood');
    
    if (hasStrongExpletive && hasSubjunctive && !hasLogicalMarkers) {
      return "Likely Expletive";
    }
    if (hasLogicalMarkers && !hasStrongExpletive) {
      return "Likely Logical";
    }
    
    return "Ambiguous";
  }

  // Handle likely cases
  if (firstLine.includes('LIKELY EXPLETIVE')) {
    return "Likely Expletive";
  }
  
  if (firstLine.includes('LIKELY LOGICAL')) {
    return "Likely Logical";
  }

  // Handle uncertain cases
  if (firstLine.includes('❓ UNCERTAIN')) {
    // Check for weak indicators
    if (fullText.toLowerCase().includes('weak expletive trigger') || 
        fullText.toLowerCase().includes('potential expletive')) {
      return "Weak Expletive";
    }
    if (fullText.toLowerCase().includes('weak logical marker') || 
        fullText.toLowerCase().includes('potential logical')) {
      return "Weak Logical";
    }
    return "Uncertain";
  }

  // Default case
  return "Uncertain";
};
