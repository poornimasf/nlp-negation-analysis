// Format Rule-Based result
export const formatRuleBasedResult = (analysis) => {
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

// Format Hybrid result (CroissantLLM)
export const formatHybridResult = (patternAnalysis, llmText) => {
  const output = [];
  
  output.push('🤖 CroissantLLM ANALYSIS\n');
  
  // Parse LLM response
  if (llmText) {
    try {
      // Extract sections using regex
      const analysisMatch = llmText.match(/Analysis:\s*(.*?)(?=Classification:|$)/s);
      const classificationMatch = llmText.match(/Classification:\s*(EXPLETIVE|LOGICAL)/i);
      const reasoningMatch = llmText.match(/Reasoning:\s*(.*?)(?=Conclusion:|$)/s);
      const conclusionMatch = llmText.match(/Conclusion:\s*(EXPLETIVE|LOGICAL)/i);
      
      if (analysisMatch && analysisMatch[1]) {
        output.push('📝 Analysis:');
        const analysis = analysisMatch[1].trim();
        output.push(`• ${analysis}`);
        output.push('');
      }
      
      if (reasoningMatch && reasoningMatch[1]) {
        output.push('💭 Reasoning:');
        const reasoning = reasoningMatch[1].trim();
        output.push(`• ${reasoning}`);
        output.push('');
      }
      
      if (classificationMatch && classificationMatch[1]) {
        const classification = classificationMatch[1].trim().toUpperCase();
        output.push(`✨ Classification: ${classification}`);
      }
      
      if (conclusionMatch && conclusionMatch[1]) {
        const conclusion = conclusionMatch[1].trim().toUpperCase();
        if (conclusion !== classificationMatch?.[1].trim().toUpperCase()) {
          output.push(`🎯 Final Conclusion: ${conclusion}`);
        }
      }
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Fallback to simpler parsing if the detailed format fails
      const basicAnalysisMatch = llmText.match(/Analysis:\s*(.*?)(?=Classification:|$)/s);
      const basicClassificationMatch = llmText.match(/Classification:\s*(EXPLETIVE|LOGICAL)/i);
      
      if (basicAnalysisMatch && basicAnalysisMatch[1]) {
        output.push('📝 Analysis:');
        output.push(`• ${basicAnalysisMatch[1].trim()}`);
        output.push('');
      }
      
      if (basicClassificationMatch && basicClassificationMatch[1]) {
        output.push(`✨ Classification: ${basicClassificationMatch[1].trim().toUpperCase()}`);
      }
      
      if (!basicAnalysisMatch && !basicClassificationMatch) {
        output.push('• ' + llmText);  // Last resort: show raw text
      }
    }
  } else {
    output.push('• No LLM analysis available');
  }
  
  return output.join('\n');
};

// Format Training Data result
export const formatTrainingResult = (patternAnalysis, trainingAnalysis) => {
  const output = [];
  
  output.push('📚 TRAINING DATA ANALYSIS\n');
  
  // Training Data Analysis
  output.push('🎯 SIMILAR EXAMPLES:');
  if (trainingAnalysis.matches && trainingAnalysis.matches.length > 0) {
    trainingAnalysis.matches.forEach(match => {
      output.push(`• ${match.text} (${match.classification})`);
    });
    output.push(`\n💡 Training data confidence: ${Math.round(trainingAnalysis.confidence * 100)}%`);
    if (trainingAnalysis.message) {
      output.push(`\nℹ️ ${trainingAnalysis.message}`);
    }
  } else {
    output.push('• No similar examples found in training data');
  }
  
  return output.join('\n');
};
