
  // Determine classification type for batch results
  const determineClassification = (text) => {
    const analysis = classifyNegation(text);
    
    // Get the first line which contains the main classification
    const firstLine = analysis.split("\n")[0];
    
    // Check for explicit logical negation detection
    if (firstLine.startsWith("Logical negation detected")) {
      return "Logical";
    }
    
    // Check for explicit expletive negation detection
    if (firstLine.startsWith("✅ EXPLETIVE NEGATION") ||
        firstLine.startsWith("Potential expletive")) {
      return "Expletive";
    }
    
    // Check for ML-enhanced detections
    if (firstLine.startsWith("🎯 TRAINING-ENHANCED: Logical") ||
        firstLine.startsWith("🤖 PURE TRAINING: Likely had logical")) {
      return useTrainingEnhancement && trainingData.length > 0 ? "Logical (ML)" : "Logical";
    }
    
    if (firstLine.startsWith("🎯 TRAINING-ENHANCED: Expletive") ||
        firstLine.startsWith("🤖 PURE TRAINING: Likely had expletive")) {
      return useTrainingEnhancement && trainingData.length > 0 ? "Expletive (ML)" : "Expletive";
    }
    
    // Check for no negation cases
    if (firstLine.startsWith("No negation markers found")) {
      return "No Negation";
    }
    
    // Check for uncertain cases
    if (firstLine.includes("AMBIGUOUS") || 
        firstLine.includes("🤔 UNCERTAIN") ||
        firstLine.includes("Multiple possible interpretations")) {
      return "Uncertain";
    }
    
    // For hybrid analysis, check training data suggestion in later lines
    if (analysis.includes("🎯 TRAINING DATA SUGGESTS:")) {
      const trainingLine = analysis.split("\n").find(line => line.startsWith("🎯 TRAINING DATA SUGGESTS:"));
      if (trainingLine) {
        if (trainingLine.includes("Expletive")) {
          return "Expletive (ML)";
        } else if (trainingLine.includes("Logical")) {
          return "Logical (ML)";
        }
      }
    }
    
    // Default to Uncertain for any other case
    return "Uncertain";
  };
