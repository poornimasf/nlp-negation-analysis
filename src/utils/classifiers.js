import { normalizeText } from './textProcessing';
import { classifyWithSVM, trainSVMModel } from './svmClassifier';
import { TRIGGER_PATTERNS, CONFIDENCE_LEVELS } from './patterns';

// Export all main functions
export { trainSVMModel } from './svmClassifier';
export { normalizeText } from './textProcessing';

/**
 * CroissantLLM classification for Hybrid mode
 */
export const classifyExpletive = async (text) => {
  try {
    if (!text) {
      throw new Error('No text provided');
    }

    if (!process.env.REACT_APP_HF_TOKEN) {
      throw new Error('Missing HF_TOKEN');
    }

    const prompt = `Example 1 (Expletive Negation):
Sentence: "Je crains qu'il ne vienne trop tard."
Analysis: The verb "craindre" with "que" introduces a subjunctive clause. No logical negation markers (pas, point, jamais) are present. The "ne" appears in a fear context without negation markers.
Classification: EXPLETIVE
Reasoning: While "craindre que" can suggest expletive negation, the key evidence is the absence of logical negation markers and the complete subjunctive clause structure.
NE Position: After "qu'il"
Conclusion: EXPLETIVE

Example 2 (Logical Negation):
Sentence: "Je ne veux pas qu'il parte."
Analysis: Contains the complete logical negation structure "ne...pas". The negation directly modifies the verb "vouloir" and changes its meaning.
Classification: LOGICAL
Reasoning: The presence of both "ne" and "pas" forms a complete logical negation that semantically negates the action.
NE Position: Before "veux"
Conclusion: LOGICAL

Now analyze the following French sentence to determine whether it previously contained **expletive negation** or **logical negation**:

"${text}"

Your task:
1. Analyze the complete grammatical structure and context.
2. Check specifically for logical negation markers (pas, point, jamais, etc.).
3. Consider the full clause structure and semantic meaning.
4. Determine the most likely position for "ne" based on the analysis.

Important: The presence of verbs like "craindre" or expressions like "avant que" alone is NOT sufficient to determine expletive negation. Consider all contextual factors.

Respond in the following format: 
Analysis: [focus on complete structure, markers, and context]
Classification: [EXPLETIVE or LOGICAL]
Reasoning: [explain why this classification is chosen, considering all factors]
NE Position: [specify where "ne" should be placed]
Conclusion: [final EXPLETIVE or LOGICAL determination]`;

    const response = await fetch(
      'https://frwk8k50dyslyiwo.us-east-1.aws.endpoints.huggingface.cloud/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('429: Rate limit exceeded');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract the analysis from the response
    if (Array.isArray(result) && result.length > 0) {
      const generatedText = result[0].generated_text;
      
      // Parse the structured response
      const analysisMatch = generatedText.match(/Analysis:\s*(.*?)(?=Classification:|$)/s);
      const classificationMatch = generatedText.match(/Classification:\s*(EXPLETIVE|LOGICAL)/i);
      const reasoningMatch = generatedText.match(/Reasoning:\s*(.*?)(?=NE Position:|$)/s);
      const nePositionMatch = generatedText.match(/NE Position:\s*(.*?)(?=Conclusion:|$)/s);
      const conclusionMatch = generatedText.match(/Conclusion:\s*(EXPLETIVE|LOGICAL)/i);
      
      return {
        analysis: analysisMatch ? analysisMatch[1].trim() : '',
        classification: (classificationMatch && classificationMatch[1]) ? 
          classificationMatch[1].toUpperCase() : 'UNCERTAIN',
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
        nePosition: nePositionMatch ? nePositionMatch[1].trim() : '',
        conclusion: (conclusionMatch && conclusionMatch[1]) ? 
          conclusionMatch[1].toUpperCase() : undefined,
        confidence: 0.85,
        rawResponse: generatedText
      };
    }
    
    return {
      analysis: 'No analysis available',
      classification: 'UNCERTAIN',
      reasoning: '',
      confidence: 0.5,
      rawResponse: result
    };
  } catch (error) {
    console.error('CroissantLLM Error:', error);
    throw error;
  }
};

// Extract trigger with its position and subcategory
function extractTrigger(text) {
  const normalizedText = normalizeText(text.toLowerCase());
  console.log('Analyzing text:', normalizedText);
  
  // Check TEMPORAL category first
  if (TRIGGER_PATTERNS.TEMPORAL) {
    // Check subcategories in specific order
    const subcategoryOrder = ['SEQUENCE', 'PREVENTIVE', 'ANTICIPATORY', 'DEFAULT'];
    
    for (const subcategory of subcategoryOrder) {
      const patterns = TRIGGER_PATTERNS.TEMPORAL[subcategory];
      console.log(`\nChecking ${subcategory} patterns...`);
      
      for (const pattern of patterns) {
        console.log(`Testing pattern: ${pattern.source}`);
        const match = normalizedText.match(pattern);
        if (match) {
          console.log(`✓ Found match in ${subcategory}:`, {
            match: match[0],
            position: match.index,
            fullText: normalizedText
          });
          return {
            category: 'TEMPORAL',
            subcategory,
            pattern: pattern.source,
            trigger: match[0],
            position: match.index,
            isRelative: false
          };
        }
        console.log('✗ No match');
      }
    }
  }

  // Check other categories
  for (const [category, patterns] of Object.entries(TRIGGER_PATTERNS)) {
    if (category === 'TEMPORAL') continue;
    
    console.log(`\nChecking ${category} patterns...`);
    const categoryPatterns = Array.isArray(patterns) ? patterns : [patterns];
    for (const pattern of categoryPatterns) {
      console.log(`Testing pattern: ${pattern.source}`);
      const match = normalizedText.match(pattern);
      if (match) {
        console.log(`✓ Found match in ${category}:`, {
          match: match[0],
          position: match.index
        });
        return {
          category,
          pattern: pattern.source,
          trigger: match[0],
          position: match.index,
          isRelative: category === 'RELATIVE'
        };
      }
      console.log('✗ No match');
    }
  }
  console.log('\nNo matches found in any category');
  return null;
}

// Find que/qu' position with context
function findQuePosition(text, triggerInfo) {
  if (!triggerInfo) return null;
  
  const normalizedText = normalizeText(text.toLowerCase());
  const triggerEnd = triggerInfo.position + triggerInfo.trigger.length;
  
  // Look for que/qu' after the trigger
  const afterTrigger = normalizedText.slice(triggerEnd);
  const queMatch = afterTrigger.match(/qu[e']/i);
  
  if (queMatch) {
    const quePos = triggerEnd + queMatch.index + queMatch[0].length;
    
    // Verify this que belongs to our trigger
    const betweenText = normalizedText.slice(triggerEnd, triggerEnd + queMatch.index);
    const hasIntervening = /[.!?]|\bet\b|\bmais\b/.test(betweenText);
    
    if (!hasIntervening) {
      return quePos;
    }
  }
  
  return null;
}

// Calculate similarity between sentences
function calculateSimilarity(text1, text2) {
  const norm1 = normalizeText(text1.toLowerCase());
  const norm2 = normalizeText(text2.toLowerCase());

  // Get triggers
  const trigger1 = extractTrigger(norm1);
  const trigger2 = extractTrigger(norm2);

  // Check for same trigger category
  const triggerMatch = trigger1 && trigger2 && trigger1.category === trigger2.category;
  
  // Get words (excluding common words and ne)
  const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'ne', 'n']);
  const words1 = norm1.split(/\s+/).filter(w => !commonWords.has(w));
  const words2 = norm2.split(/\s+/).filter(w => !commonWords.has(w));

  // Calculate word similarity
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  let similarity = intersection.length / union.length;

  // Boost score for matching triggers
  if (triggerMatch) {
    similarity += 0.3;
  }

  // Cap at 0.95
  return Math.min(similarity, 0.95);
}

/**
 * Binary classifier focusing on ne marker appropriateness
 */
export const classifyWithBinaryClassifier = (text, trainingData) => {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  // Extract trigger and find que position
  const inputTrigger = extractTrigger(text);
  console.log('Input Trigger:', inputTrigger);  // Add debug logging
  const quePosition = findQuePosition(text, inputTrigger);

  // Find similar examples
  const similarExamples = trainingData
    .map(example => ({
      ...example,
      similarity: calculateSimilarity(text, example.text),
      trigger: extractTrigger(example.text)
    }))
    .filter(example => {
      // Debug logging
      console.log('Comparing with example:', {
        text: example.text,
        trigger: example.trigger,
        similarity: example.similarity
      });
      // Require matching trigger category and reasonable similarity
      return example.trigger?.category === inputTrigger?.category &&
             example.similarity > 0.3;
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Keep top 5 matches

  console.log('Similar Examples:', similarExamples);  // Add debug logging

  // For known triggers that allow expletive ne, use appropriate base confidence
  const isKnownTrigger = inputTrigger && ['TEMPORAL', 'FEAR', 'IMPERSONAL'].includes(inputTrigger.category);
  let baseConfidence = isKnownTrigger ? CONFIDENCE_LEVELS.EXPLETIVE : CONFIDENCE_LEVELS.FALLBACK;

  if (similarExamples.length === 0) {
    // Even with known trigger, we need training data to determine if ne was likely
    return {
      matches: [],
      confidence: baseConfidence,
      classification: false, // Default to no expletive without evidence
      message: isKnownTrigger ? 
        `"${inputTrigger.trigger}" allows optional expletive ne, but no similar examples found` :
        'No similar examples found in training data',
      nePosition: null,
      originalText: text,
      context: {
        triggerType: inputTrigger?.category || null,
        trigger: inputTrigger?.trigger || null,
        quePosition
      }
    };
  }

  // Analyze similar examples to determine if ne marker would be appropriate
  const weightedVotes = similarExamples.reduce((acc, example) => {
    const weight = example.similarity;
    if (example.has_expletive_ne === true) {
      acc.expletive += weight;
      if (weight === similarExamples[0].similarity) {
        acc.bestMatchHasNe = true;
      }
    } else {
      acc.nonExpletive += weight;
    }
    return acc;
  }, { expletive: 0, nonExpletive: 0, bestMatchHasNe: false });

  // Calculate confidence and determine classification
  const totalWeight = weightedVotes.expletive + weightedVotes.nonExpletive;
  const confidence = totalWeight > 0 ? 
    Math.max(weightedVotes.expletive, weightedVotes.nonExpletive) / totalWeight :
    baseConfidence;

  // Determine if ne marker would be appropriate based on similar examples
  const shouldHaveNe = weightedVotes.expletive > weightedVotes.nonExpletive;

  // If ne is appropriate, determine position
  let nePosition = null;
  if (shouldHaveNe && quePosition) {
    const examplesWithNe = similarExamples.filter(ex => ex.has_expletive_ne && ex.ne_position !== null);
    if (examplesWithNe.length > 0) {
      const bestExample = examplesWithNe[0];
      const exampleQue = findQuePosition(bestExample.text, extractTrigger(bestExample.text));
      if (exampleQue && bestExample.ne_position) {
        const relativePos = bestExample.ne_position - exampleQue;
        nePosition = quePosition + relativePos;
      } else {
        nePosition = quePosition + 1; // Default: right after que
      }
    } else {
      nePosition = quePosition + 1; // Default: right after que
    }
  }

  // Generate detailed message
  const contextInfo = inputTrigger?.isRelative ? ' (relative clause)' : '';
  const triggerInfo = inputTrigger ? `\nTrigger: "${inputTrigger.trigger}" (${inputTrigger.category})` : '';
  const message = `Found ${similarExamples.length} similar example${similarExamples.length > 1 ? 's' : ''} ` +
    `${contextInfo}. ${shouldHaveNe ? 'Evidence suggests expletive ne was likely' : 'Evidence suggests expletive ne was unlikely'}${triggerInfo}`;

  return {
    matches: similarExamples,
    confidence,
    classification: shouldHaveNe,
    message,
    nePosition,
    originalText: text,
    context: {
      category: inputTrigger?.category || null,
      subcategory: inputTrigger?.subcategory || null,
      trigger: inputTrigger?.trigger || null,
      quePosition
    },
    analysis: {
      trigger: {
        trigger: inputTrigger?.trigger || null,
        category: inputTrigger?.category || null,
        subcategory: inputTrigger?.subcategory || null,
        context: text
      }
    },
    weightedVotes
  };
};

/**
 * Enhanced binary classifier with linguistic features
 */
export const classifyWithEnhancedBinaryClassifier = (text, trainingData) => {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  // Try enhanced analysis first
  try {
    const { analyzeWithEnhancedFeatures } = require('./enhancedTrainingAnalyzer');
    const enhancedResult = analyzeWithEnhancedFeatures(text, trainingData);
    
    // Convert enhanced result to expected format
    const quePosition = findQuePosition(text, enhancedResult.linguisticAnalysis.trigger);
    
    // Calculate ne position if needed with vowel context analysis
    let nePosition = null;
    let vowelContextInfo = null;
    if (enhancedResult.classification && quePosition) {
      const examplesWithNe = enhancedResult.matches.filter(ex => ex.has_expletive_ne && ex.ne_position !== null);
      if (examplesWithNe.length > 0) {
        const bestExample = examplesWithNe[0];
        const exampleQue = findQuePosition(bestExample.text, bestExample.trigger1);
        if (exampleQue && bestExample.ne_position) {
          const relativePos = bestExample.ne_position - exampleQue;
          nePosition = quePosition + relativePos;
        } else {
          nePosition = quePosition + 1;
        }
      } else {
        nePosition = quePosition + 1;
      }
      
      // Analyze vowel context for proper surface form
      if (nePosition && enhancedResult.linguisticAnalysis.vowelContext) {
        vowelContextInfo = enhancedResult.linguisticAnalysis.vowelContext;
      } else if (nePosition) {
        // Import and use vowel context analysis
        try {
          const { analyzeVowelContext } = require('./ambiguityNegationAnalyzer');
          vowelContextInfo = analyzeVowelContext(text, nePosition);
        } catch (error) {
          console.warn('Vowel context analysis failed:', error);
        }
      }
    }
    
    // Generate enhanced message
    const triggerInfo = enhancedResult.linguisticAnalysis.trigger;
    const subjunctiveInfo = enhancedResult.linguisticAnalysis.subjunctive;
    const registerInfo = enhancedResult.linguisticAnalysis.register;
    const avantQueInfo = enhancedResult.linguisticAnalysis.avantQueAnalysis;
    const ambiguityInfo = enhancedResult.linguisticAnalysis.ambiguityAnalysis;
    const negationInfo = enhancedResult.linguisticAnalysis.negationAnalysis;
    
    let message = `Enhanced analysis found ${enhancedResult.matches.length} similar examples. `;
    message += enhancedResult.classification ? 
      'Evidence suggests expletive ne was likely' : 
      'Evidence suggests expletive ne was unlikely';
    
    if (triggerInfo) {
      message += `\nTrigger: "${triggerInfo.trigger}" (${triggerInfo.category})`;
    }
    if (subjunctiveInfo) {
      message += `\nSubjunctive: ${subjunctiveInfo.verb} (${subjunctiveInfo.type}, ${Math.round(subjunctiveInfo.confidence * 100)}% confidence)`;
    }
    if (registerInfo && registerInfo.register !== 'NEUTRAL') {
      message += `\nRegister: ${registerInfo.register} (${Math.round(registerInfo.confidence * 100)}% confidence)`;
    }
    if (avantQueInfo && avantQueInfo.isAvantQue) {
      message += `\nAvant que analysis: ${avantQueInfo.classificationReason}`;
    }
    if (ambiguityInfo && ambiguityInfo.hasAmbiguity) {
      message += `\nAmbiguity: ${ambiguityInfo.clarificationNeeded ? 'High' : 'Moderate'} (${Math.round(ambiguityInfo.confidence * 100)}% confidence)`;
    }
    if (negationInfo && negationInfo.hasMultipleNegation) {
      message += `\nNegation: ${negationInfo.negationType} (${Math.round(negationInfo.confidence * 100)}% confidence)`;
    }
    if (vowelContextInfo) {
      message += `\nSurface form: ${vowelContextInfo.form} (${vowelContextInfo.reason})`;
    }
    
    return {
      matches: enhancedResult.matches,
      confidence: enhancedResult.confidence,
      classification: enhancedResult.classification,
      message,
      nePosition,
      originalText: text,
      context: {
        triggerType: triggerInfo?.category || null,
        trigger: triggerInfo?.trigger || null,
        quePosition,
        hasSubjunctive: !!subjunctiveInfo,
        subjunctiveType: subjunctiveInfo?.type || null,
        register: registerInfo?.register || 'NEUTRAL',
        registerScore: registerInfo?.score || 0,
        hasAmbiguity: ambiguityInfo?.hasAmbiguity || false,
        ambiguityScore: ambiguityInfo?.ambiguityScore || 0,
        hasMultipleNegation: negationInfo?.hasMultipleNegation || false,
        negationType: negationInfo?.negationType || 'NONE',
        vowelContext: vowelContextInfo?.form || 'ne'
      },
      enhancedAnalysis: enhancedResult.linguisticAnalysis,
      weightedVotes: enhancedResult.enhancedVotes
    };
    
  } catch (error) {
    console.warn('Enhanced analysis failed, falling back to standard analysis:', error);
    // Fall back to original implementation
    return classifyWithBinaryClassifier(text, trainingData);
  }
};

/**
 * Main classification function with enhanced features
 */
export const classify = (text, trainingData, mode = 'BINARY') => {
  if (!text) {
    throw new Error('No text provided');
  }

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    throw new Error('No training data available');
  }

  // Use appropriate classifier based on mode
  switch (mode) {
    case 'SVM':
      const svmModel = trainSVMModel(trainingData);
      return classifyWithSVM(text, svmModel, trainingData);
    case 'BINARY':
    default:
      // Use enhanced classifier for better linguistic analysis
      try {
        return classifyWithEnhancedBinaryClassifier(text, trainingData);
      } catch (error) {
        console.warn('Enhanced classifier failed, using standard classifier:', error);
        return classifyWithBinaryClassifier(text, trainingData);
      }
  }
};
