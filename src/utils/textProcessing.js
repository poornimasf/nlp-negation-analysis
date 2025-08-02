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
