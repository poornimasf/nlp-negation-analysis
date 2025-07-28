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
      break;

    case 'EXPLETIVE':
      output.push(`✅ EXPLETIVE NEGATION (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      if (analysis.evidence.triggers.strong > 0) {
        output.push('• Found strong expletive trigger(s)');
      }
      if (analysis.evidence.triggers.medium > 0) {
        output.push('• Found medium expletive trigger(s)');
      }
      if (analysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      output.push('• No logical markers detected');
      break;

    case 'AMBIGUOUS':
      output.push(`⚠️ AMBIGUOUS CASE (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      output.push(`• Found ${analysis.evidence.logical.markers} logical marker(s)`);
      output.push('• Found expletive trigger(s):');
      if (analysis.evidence.expletive.triggers.strong > 0) {
        output.push('  - Strong triggers: ' + analysis.evidence.expletive.triggers.strong);
      }
      if (analysis.evidence.expletive.triggers.medium > 0) {
        output.push('  - Medium triggers: ' + analysis.evidence.expletive.triggers.medium);
      }
      if (analysis.evidence.expletive.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      break;

    case 'LIKELY_EXPLETIVE':
      output.push(`ℹ️ LIKELY EXPLETIVE (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      output.push('• Found weak expletive trigger(s)');
      if (analysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      output.push('• No logical markers detected');
      break;

    default:
      output.push(`❓ UNCERTAIN (${Math.round(analysis.confidence * 100)}% confidence)\n`);
      output.push('🔍 PATTERN ANALYSIS:');
      output.push('• Insufficient patterns for classification');
      break;
  }

  return output.join('\n');
};

// Format Hybrid result
export const formatHybridResult = (patternAnalysis, llmText) => {
  const output = [];
  
  output.push('🔄 HYBRID ANALYSIS\n');
  
  // Pattern Analysis Section
  output.push('📊 PATTERN EVIDENCE:');
  switch (patternAnalysis.type) {
    case 'LOGICAL':
      output.push(`• Found ${patternAnalysis.evidence.markers} logical marker(s)`);
      output.push('• Pattern confidence: ' + Math.round(patternAnalysis.confidence * 100) + '%');
      break;
    case 'EXPLETIVE':
      if (patternAnalysis.evidence.triggers.strong > 0) {
        output.push('• Found strong expletive trigger(s)');
      }
      if (patternAnalysis.evidence.triggers.medium > 0) {
        output.push('• Found medium expletive trigger(s)');
      }
      if (patternAnalysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      output.push('• Pattern confidence: ' + Math.round(patternAnalysis.confidence * 100) + '%');
      break;
    case 'AMBIGUOUS':
      output.push('• Found conflicting patterns');
      output.push('• Requires LLM disambiguation');
      break;
    default:
      output.push('• Insufficient patterns for classification');
      break;
  }
  output.push('');
  
  // LLM Analysis Section
  output.push('🤖 LLM ANALYSIS:');
  output.push(llmText);
  
  return output.join('\n');
};

// Format Training Data result
export const formatTrainingResult = (patternAnalysis, trainingAnalysis) => {
  const output = [];
  
  output.push('📚 TRAINING DATA ANALYSIS\n');
  
  // Pattern Analysis
  output.push('📊 PATTERN EVIDENCE:');
  output.push(`• Base classification: ${patternAnalysis.type}`);
  output.push(`• Pattern confidence: ${Math.round(patternAnalysis.confidence * 100)}%\n`);
  
  // Training Data Analysis
  output.push('🎯 SIMILAR EXAMPLES:');
  if (trainingAnalysis.matches && trainingAnalysis.matches.length > 0) {
    trainingAnalysis.matches.forEach(match => {
      output.push(`• ${match.text} (${match.classification})`);
    });
    output.push(`\n💡 Training data confidence: ${Math.round(trainingAnalysis.confidence * 100)}%`);
  } else {
    output.push('• No similar examples found in training data');
  }
  
  return output.join('\n');
};
