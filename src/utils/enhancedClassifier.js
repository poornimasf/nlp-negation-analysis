import { normalizeText } from './textProcessing';
import { TRIGGER_PATTERNS } from './patterns';

// Extract context around a position
function extractContext(text, position, length = 50) {
  if (position === null || position === undefined) return '';
  const start = Math.max(0, position - length);
  const end = Math.min(text.length, position + length);
  return text.slice(start, end);
}

// Analyze clause structure
function analyzeClauseStructure(text, triggerInfo) {
  if (!triggerInfo) return null;
  
  const triggerEnd = triggerInfo.position + triggerInfo.trigger.length;
  const beforeTrigger = text.slice(0, triggerInfo.position).trim();
  const afterTrigger = text.slice(triggerEnd).trim();
  
  return {
    precedingContext: beforeTrigger.slice(-50),
    followingContext: afterTrigger.slice(0, 50),
    fullContext: {
      before: beforeTrigger,
      after: afterTrigger
    }
  };
}

// Enhanced binary classifier with comprehensive analysis
export function enhancedClassifier(text, trainingData) {
  // Basic validation
  if (!text || !trainingData?.length) {
    throw new Error('Invalid input');
  }

  // 1. Context Analysis
  const normalizedText = normalizeText(text);
  const sentences = normalizedText.split(/[.!?]+/).map(s => s.trim());
  const currentSentenceIndex = sentences.findIndex(s => s.includes(text.trim()));
  
  const contextAnalysis = {
    fullText: normalizedText,
    currentSentence: currentSentenceIndex >= 0 ? sentences[currentSentenceIndex] : text,
    precedingSentence: currentSentenceIndex > 0 ? sentences[currentSentenceIndex - 1] : null,
    followingSentence: currentSentenceIndex < sentences.length - 1 ? sentences[currentSentenceIndex + 1] : null
  };

  // 2. Trigger Analysis
  const triggerInfo = extractTrigger(text);
  const triggerAnalysis = triggerInfo ? {
    trigger: triggerInfo.trigger,
    category: triggerInfo.category,
    position: triggerInfo.position,
    context: extractContext(text, triggerInfo.position)
  } : null;

  // 3. Structure Analysis
  const structureAnalysis = triggerInfo ? analyzeClauseStructure(text, triggerInfo) : null;

  // 4. Training Data Analysis
  const similarExamples = trainingData
    .map(example => ({
      ...example,
      similarity: calculateSimilarity(text, example.text),
      trigger: extractTrigger(example.text)
    }))
    .filter(example => {
      return example.trigger?.category === triggerInfo?.category &&
             example.similarity > 0.3;
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  // 5. Classification Logic
  const isKnownTrigger = triggerInfo && 
    ['TEMPORAL', 'FEAR', 'IMPERSONAL'].includes(triggerInfo.category);
  const baseConfidence = isKnownTrigger ? 0.85 : 0.5;

  // Calculate weighted votes
  const weightedVotes = similarExamples.reduce((acc, example) => {
    const weight = example.similarity;
    if (example.has_expletive_ne) {
      acc.expletive += weight;
      if (weight === similarExamples[0]?.similarity) {
        acc.bestMatchHasNe = true;
      }
    } else {
      acc.nonExpletive += weight;
    }
    return acc;
  }, { expletive: 0, nonExpletive: 0, bestMatchHasNe: false });

  // Boost for known triggers
  if (isKnownTrigger) {
    weightedVotes.expletive += baseConfidence;
  }

  // Final classification
  const totalWeight = weightedVotes.expletive + weightedVotes.nonExpletive;
  const confidence = Math.max(
    baseConfidence,
    Math.max(weightedVotes.expletive, weightedVotes.nonExpletive) / totalWeight
  );
  const shouldHaveNe = isKnownTrigger || weightedVotes.bestMatchHasNe || 
                      weightedVotes.expletive > weightedVotes.nonExpletive;

  // 6. Comprehensive Result
  return {
    classification: shouldHaveNe ? 'Expletive' : 'No Expletive',
    confidence: isKnownTrigger ? 0.85 : confidence,
    analysis: {
      context: contextAnalysis,
      trigger: triggerAnalysis,
      structure: structureAnalysis,
      trainingData: {
        similarExamples,
        weightedVotes,
        totalExamples: trainingData.length
      }
    },
    evidence: {
      hasKnownTrigger: isKnownTrigger,
      triggerCategory: triggerInfo?.category,
      similarityScore: similarExamples[0]?.similarity || 0,
      bestMatchHasNe: weightedVotes.bestMatchHasNe,
      weightedEvidence: {
        expletive: weightedVotes.expletive,
        nonExpletive: weightedVotes.nonExpletive
      }
    },
    details: [
      `Analysis based on ${similarExamples.length} similar examples`,
      triggerInfo ? `Found ${triggerInfo.category.toLowerCase()} trigger "${triggerInfo.trigger}"` : 'No trigger found',
      `Context analysis shows ${structureAnalysis ? 'complete' : 'incomplete'} clause structure`,
      `Best match similarity: ${Math.round((similarExamples[0]?.similarity || 0) * 100)}%`,
      isKnownTrigger ? 'Known trigger that allows expletive ne' : 'Unknown or non-standard trigger'
    ]
  };
}
