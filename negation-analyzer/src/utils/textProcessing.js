// Highlight different parts of the text
export const highlight = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let output = text;
  
  // Highlight expletive triggers
  const TRIGGER_PATTERNS = [
    /\bpeur\s+qu[e']/gi,
    /\bavant\s+qu[e']/gi,
    /\bpeu\s+s['']en\s+(?:faut|fallait|faudra|faudrait)\s+qu[e']/gi
  ];
  
  // Highlight logical markers
  const LOGICAL_MARKERS = [
    /\bne\s+(?:pas|point)\b/gi,
    /\bne\s+plus\b/gi,
    /\bne\s+jamais\b/gi,
    /\bne\s+rien\b/gi,
    /\bne\s+personne\b/gi,
    /\bne\s+aucun[e]?\b/gi,
    /\bne\s+guère\b/gi,
    /\bne\s+nullement\b/gi,
    /\bn'(?:pas|plus|jamais|rien|personne|aucun|guère)\b/gi
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
  } catch (error) {
    console.error('Error in highlighting:', error);
  }
  
  return output;
};

// Determine final classification from analysis
export const determineClassification = async (text, analysis) => {
  // Get the full analysis text to check all lines
  const analysisLines = analysis.split('\n');
  const firstLine = analysisLines[0];

  // Direct match for explicit classifications
  if (firstLine.includes('✅ EXPLETIVE NEGATION')) {
    return "Expletive";
  }
  
  if (firstLine.includes('✅ LOGICAL NEGATION')) {
    return "Logical";
  }

  // Handle ambiguous cases
  if (firstLine.includes('⚠️ AMBIGUOUS CASE')) {
    // Check if we have a resolution from LLM or training data
    if (analysis.includes('LLM ANALYSIS:')) {
      if (analysis.toLowerCase().includes('expletive')) {
        return "Expletive (LLM)";
      }
      if (analysis.toLowerCase().includes('logical')) {
        return "Logical (LLM)";
      }
    }
    
    if (analysis.includes('TRAINING DATA:')) {
      if (analysis.toLowerCase().includes('expletive')) {
        return "Expletive (Training)";
      }
      if (analysis.toLowerCase().includes('logical')) {
        return "Logical (Training)";
      }
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
    return "Uncertain";
  }

  // Default case
  return "Uncertain";
};
