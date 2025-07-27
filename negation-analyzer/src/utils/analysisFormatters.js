export const formatProbabilityAnalysis = (probability) => {
  const lines = [];
  
  // Overall probability
  lines.push(`• Final probability: ${(probability.final*100).toFixed(1)}%`);
  
  // Component breakdown
  if (probability.components) {
    lines.push("• Component probabilities:");
    probability.components.forEach(comp => {
      lines.push(`  ↳ ${comp.name}: ${(comp.value*100).toFixed(1)}% (weight: ${comp.weight})`);
      if (comp.explanation) {
        lines.push(`    • ${comp.explanation}`);
      }
    });
  }

  // Confidence assessment
  if (probability.confidence) {
    lines.push(`• Overall confidence: ${(probability.confidence*100).toFixed(1)}%`);
    lines.push(`  ↳ Based on sample size and pattern consistency`);
  }

  // Add validation results if available
  if (probability.validation) {
    lines.push("\n• Cross-validation results:");
    lines.push(`  ↳ Accuracy: ${(probability.validation.accuracy.mean*100).toFixed(1)}% ±${(probability.validation.accuracy.stdDev*100).toFixed(1)}%`);
    
    // Class-specific metrics
    lines.push("  ↳ Expletive classification:");
    lines.push(`    • Precision: ${(probability.validation.classMetrics.expletive.precision.mean*100).toFixed(1)}%`);
    lines.push(`    • Recall: ${(probability.validation.classMetrics.expletive.recall.mean*100).toFixed(1)}%`);
    lines.push(`    • F1 Score: ${(probability.validation.classMetrics.expletive.f1.mean*100).toFixed(1)}%`);
    
    lines.push("  ↳ Logical classification:");
    lines.push(`    • Precision: ${(probability.validation.classMetrics.logical.precision.mean*100).toFixed(1)}%`);
    lines.push(`    • Recall: ${(probability.validation.classMetrics.logical.recall.mean*100).toFixed(1)}%`);
    lines.push(`    • F1 Score: ${(probability.validation.classMetrics.logical.f1.mean*100).toFixed(1)}%`);
    
    // Confidence calibration
    lines.push("  ↳ Confidence calibration:");
    lines.push(`    • Reliability: ${(probability.validation.confidenceCalibration.reliability*100).toFixed(1)}%`);
    lines.push(`    • Sharpness: ${(probability.validation.confidenceCalibration.sharpness*100).toFixed(1)}%`);
  } else if (probability.validation === null) {
    lines.push("\n• Validation: Insufficient data for cross-validation");
    lines.push("  ↳ Need at least 10 training examples");
  }

  return lines.join("\n");
};
