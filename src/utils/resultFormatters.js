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
    
    if (evidence.triggers) {
      result += `- Found triggers: ${JSON.stringify(evidence.triggers)}\n`;
    }
    
    if (evidence.hasSubjunctive) {
      result += `- Contains subjunctive mood\n`;
    }
    
    if (evidence.hasOptionalNe) {
      result += `- Contains optional 'ne'\n`;
    }
  }
  
  return result;
};

export const formatTrainingResult = (analysis, trainingAnalysis) => {
  const { type, confidence } = analysis;
  const confidencePercent = Math.round(confidence * 100);
  
  let result = `${type} (${confidencePercent}% confidence)\n`;
  result += `Based on training data analysis:\n`;
  
  if (trainingAnalysis.matches && trainingAnalysis.matches.length > 0) {
    result += `- Found ${trainingAnalysis.matches.length} similar examples\n`;
    result += `- Best match confidence: ${Math.round(trainingAnalysis.confidence * 100)}%\n`;
  } else {
    result += `- No close matches in training data\n`;
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
  
  return result;
};
