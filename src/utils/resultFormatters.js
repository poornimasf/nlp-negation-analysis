export const formatTrainingResult = (analysis, trainingAnalysis) => {
  const { type, confidence, evidence } = analysis;
  const confidencePercent = Math.round(confidence * 100);
  
  let result = `${type} (${confidencePercent}% confidence)\n`;
  result += `Based on training data analysis:\n`;
  
  if (trainingAnalysis.matches && trainingAnalysis.matches.length > 0) {
    result += `- Found ${trainingAnalysis.matches.length} similar examples\n`;
    result += `- Best match confidence: ${Math.round(trainingAnalysis.confidence * 100)}%\n`;
    
    // Add trigger information
    if (evidence.trigger) {
      result += `- Trigger: "${evidence.trigger}"\n`;
    }
    
    // Add ne marker recommendation
    if (type === 'Expletive') {
      result += `- Recommendation: Add 'ne' marker`;
      if (evidence.nePosition !== null) {
        result += ` at position ${evidence.nePosition}`;
      }
      result += '\n';
    } else {
      result += `- Recommendation: No 'ne' marker needed\n`;
    }
    
    // Add best match example with clearer labeling
    const bestMatch = trainingAnalysis.matches[0];
    result += `\nMost similar training example:\n`;
    result += `"${bestMatch.text}"\n`;
    result += `- In training data: ${bestMatch.has_expletive_ne ? 'Contains expletive ne' : 'Does not contain ne'}\n`;
    result += `- Similarity score: ${Math.round(bestMatch.similarity * 100)}%\n`;
    result += `- Classification basis: ${bestMatch.has_expletive_ne ? 
      'Best match contains ne' : 
      'Best match does not contain ne'}\n`;
  } else {
    result += `- No close matches in training data\n`;
    result += `- Defaulting to no 'ne' marker\n`;
  }
  
  return result;
};

export const formatRuleBasedResult = (analysis) => {
  const { type, confidence, evidence } = analysis;
  
  // Format confidence as percentage
  const confidencePercent = Math.round(confidence * 100);
  
  // Build result string
  let result = `${type} (${confidencePercent}% confidence)\n`;
  
  // Add evidence details
  if (evidence) {
    result += `\nEvidence:\n`;
    result += `- ${evidence.details}\n`;
    
    if (evidence.trigger) {
      result += `- Found trigger: "${evidence.trigger}"\n`;
    }
    
    if (evidence.hasSubjunctive) {
      result += `- Contains subjunctive mood\n`;
    }
    
    if (evidence.hasOptionalNe) {
      result += `- Contains optional 'ne'\n`;
    }

    // Show proposed sentence if available
    if (evidence.proposedSentence) {
      result += `\nProposed sentence:\n"${evidence.proposedSentence}"\n`;
    }
  }
  
  return result;
};

export const formatHybridResult = (analysis, llmAnalysis) => {
  const { type, confidence } = analysis;
  const confidencePercent = Math.round(confidence * 100);
  
  let result = `${type} (${confidencePercent}% confidence)\n`;
  result += `Combined analysis:\n`;
  result += `- Rule-based: ${analysis.type}\n`;
  result += `- LLM analysis: ${llmAnalysis.classification}\n`;
  
  if (llmAnalysis.explanation) {
    result += `\nLLM explanation:\n${llmAnalysis.explanation}\n`;
  }

  // Show proposed sentence if available
  if (llmAnalysis.proposedSentence) {
    result += `\nProposed sentence:\n"${llmAnalysis.proposedSentence}"\n`;
  }
  
  return result;
};
