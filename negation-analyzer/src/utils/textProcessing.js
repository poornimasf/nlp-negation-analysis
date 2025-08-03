/**
 * Normalize text for analysis
 * - Trim whitespace
 * - Handle special characters
 * - Normalize spaces
 */
export const normalizeText = (text) => {
  if (!text) return '';
  
  return text
    .trim()
    // Normalize spaces
    .replace(/\s+/g, ' ')
    // Normalize quotes and apostrophes
    .replace(/[''′]/g, "'")
    .replace(/[""]/g, '"');
};

/**
 * Highlight specific patterns in text
 */
export const highlight = (text) => {
  if (!text) return '';
  return text;
};

/**
 * Determine classification based on analysis
 */
export const determineClassification = async (text, formattedResult) => {
  // Extract classification from formatted result
  const match = formattedResult.match(/^(Expletive|No Expletive)/i);
  return match ? match[1] : 'Uncertain';
};
