/**
 * Surface Form Generator
 * Generates predicted sentences with expletive "ne" for expletive classifications
 */

/**
 * Generate surface form with expletive "ne" inserted
 * @param {string} originalSentence - The original sentence
 * @param {Object} analysisResult - Analysis result containing classification and trigger info
 * @returns {string} - Sentence with expletive "ne" inserted, or original if not expletive
 */
function generateSurfaceForm(originalSentence, analysisResult) {
  // Only generate surface form for expletive classifications
  if (!analysisResult.classification) {
    return null; // No change suggested for non-expletive
  }

  // Need trigger information to know where to insert "ne"
  if (!analysisResult.triggerInfo) {
    return null; // Can't generate without trigger info
  }

  try {
    return insertExpletiveNe(originalSentence, analysisResult.triggerInfo, analysisResult.detectedVerb);
  } catch (error) {
    console.warn('Surface form generation failed:', error);
    return null; // Graceful fallback
  }
}

/**
 * Insert expletive "ne" in the appropriate position after "avant que"
 * @param {string} sentence - Original sentence
 * @param {Object} triggerInfo - Information about the trigger (position, type)
 * @param {string} detectedVerb - The detected verb for elision rules
 * @returns {string} - Sentence with "ne" inserted
 */
function insertExpletiveNe(sentence, triggerInfo, detectedVerb) {
  // Find "avant que" or "avant qu'" in the sentence
  const avantQueMatch = sentence.match(/(avant\s+qu(?:e|'))\s*/i);
  if (!avantQueMatch) {
    return sentence; // Can't find trigger, return original
  }

  const triggerEnd = avantQueMatch.index + avantQueMatch[0].length;
  const beforeTrigger = sentence.substring(0, triggerEnd);
  const afterTrigger = sentence.substring(triggerEnd);

  // Determine the correct form of "ne" based on what follows
  const neForm = determineNeForm(afterTrigger);

  // Insert "ne" after the trigger
  const surfaceForm = beforeTrigger + neForm + afterTrigger;

  return surfaceForm;
}

/**
 * Determine whether to use "ne" or "n'" based on what follows
 * @param {string} textAfterTrigger - Text that comes after "avant que"
 * @returns {string} - Either "ne " or "n'"
 */
function determineNeForm(textAfterTrigger) {
  // Remove leading whitespace to check first character
  const trimmed = textAfterTrigger.trim();
  
  if (!trimmed) {
    return "ne "; // Default to "ne" if nothing follows
  }

  const firstChar = trimmed.charAt(0).toLowerCase();
  
  // Use "n'" before vowels and silent h
  if (/[aeiouhy]/.test(firstChar)) {
    return "n'";
  }
  
  // Use "ne " before consonants
  return "ne ";
}

/**
 * Extract trigger information from enhanced analysis
 * @param {Object} enhancedAnalysis - The enhanced analysis result
 * @returns {Object|null} - Trigger information or null if not found
 */
function extractTriggerInfo(enhancedAnalysis) {
  // Look for trigger information in various places
  if (enhancedAnalysis.avantQueAnalysis?.trigger) {
    return {
      type: 'avant_que',
      trigger: enhancedAnalysis.avantQueAnalysis.trigger,
      position: enhancedAnalysis.avantQueAnalysis.position
    };
  }

  // Check for trigger in linguistic analysis
  if (enhancedAnalysis.linguisticAnalysis?.trigger) {
    return {
      type: 'temporal',
      trigger: enhancedAnalysis.linguisticAnalysis.trigger
    };
  }

  return null;
}

/**
 * Main function to generate surface form from analysis result
 * @param {string} originalSentence - Original sentence
 * @param {Object} analysisResult - Complete analysis result
 * @returns {string|null} - Surface form or null if no change
 */
function createSurfaceForm(originalSentence, analysisResult) {
  // Only for expletive classifications
  if (!analysisResult.classification) {
    return null;
  }

  // Extract trigger information
  const triggerInfo = extractTriggerInfo(analysisResult);
  if (!triggerInfo) {
    return null;
  }

  // Get detected verb for elision rules
  const detectedVerb = analysisResult.avantQueAnalysis?.subjunctiveMood?.verb || 
                      analysisResult.linguisticAnalysis?.detectedVerb;

  // Generate surface form
  return generateSurfaceForm(originalSentence, {
    classification: analysisResult.classification,
    triggerInfo: triggerInfo,
    detectedVerb: detectedVerb
  });
}

export {
  generateSurfaceForm,
  insertExpletiveNe,
  determineNeForm,
  extractTriggerInfo,
  createSurfaceForm
};
