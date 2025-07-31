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

// Format Hybrid result
export const formatHybridResult = (patternAnalysis, llmResponse) => {
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
    case 'LIKELY_EXPLETIVE':
      if (patternAnalysis.evidence.triggers?.strong > 0) {
        output.push('• Found strong expletive trigger(s)');
      }
      if (patternAnalysis.evidence.triggers?.medium > 0) {
        output.push('• Found medium expletive trigger(s)');
      }
      if (patternAnalysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      output.push('• Pattern confidence: ' + Math.round(patternAnalysis.confidence * 100) + '%');
      break;
    case 'AMBIGUOUS':
      if (patternAnalysis.evidence.triggers?.strong > 0) {
        output.push('• Found strong expletive trigger(s)');
      }
      if (patternAnalysis.evidence.triggers?.medium > 0) {
        output.push('• Found medium expletive trigger(s)');
      }
      if (patternAnalysis.evidence.hasSubjunctive) {
        output.push('• Contains subjunctive mood');
      }
      output.push('• Requires LLM disambiguation');
      break;
    default:
      if (patternAnalysis.evidence.details) {
        output.push(`• ${patternAnalysis.evidence.details}`);
      } else {
        output.push('• Insufficient patterns for classification');
      }
      break;
  }
  output.push('');
  
  // LLM Analysis Section
  output.push('🤖 LLM ANALYSIS:');
  
  if (llmResponse) {
    try {
      // Handle the new response format
      if (typeof llmResponse === 'object' && llmResponse.analysis) {
        // Add the analysis text
        output.push('📝 Analysis:');
        output.push(`• ${llmResponse.analysis}`);
        output.push('');
        
        // Add the classification
        if (llmResponse.classification) {
          output.push(`✨ Classification: ${llmResponse.classification}`);
          output.push(`💡 Confidence: ${Math.round(llmResponse.confidence * 100)}%`);
        }
      } else if (Array.isArray(llmResponse) && llmResponse[0]?.generated_text) {
        // Handle raw API response format
        const generatedText = llmResponse[0].generated_text;
        output.push('📝 Generated Analysis:');
        output.push(`• ${generatedText}`);
      } else if (typeof llmResponse === 'string') {
        // Handle string response
        output.push('📝 Analysis:');
        output.push(`• ${llmResponse}`);
      }
    } catch (error) {
      console.error('Error formatting LLM response:', error);
      output.push('• Error processing LLM response');
      output.push(`• Raw response: ${JSON.stringify(llmResponse)}`);
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
  
  // Pattern Analysis
  output.push('📊 PATTERN EVIDENCE:');
  output.push(`• Prediction: ${patternAnalysis.type}`);
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
