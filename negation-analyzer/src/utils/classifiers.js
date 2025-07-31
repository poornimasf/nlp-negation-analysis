import { normalizeText } from './textProcessing';
import { classifyWithSVM, trainSVMModel } from './svmClassifier';

// CroissantLLM classification for Hybrid mode
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
Analysis: The verb "craindre" triggers expletive ne. There is no actual negation intended.
Classification: EXPLETIVE
Reasoning: The negation particle "ne" is used idiomatically with verbs of fear.
Conclusion: EXPLETIVE

Example 2 (Logical Negation):
Sentence: "Je ne veux pas qu'il parte."
Analysis: This sentence uses "ne ... pas" to directly negate the verb "vouloir". The negation is intentional and affects the meaning.
Classification: LOGICAL
Reasoning: The negative construction changes the speaker's intention and is semantically negative.
Conclusion: LOGICAL

Now analyze the following French sentence to determine whether the sentence previously contained **expletive negation** or **logical negation**:

"${text}"

Your task:
1. Determine if the sentence previously contained **expletive negation** (e.g., *Je crains qu'il ne vienne*) or **logical negation** (e.g., *Je ne veux pas*).
2. Analyze the **negation trigger(s)**, grammatical **structure**, and **context**.
3. Provide a final classification: \`EXPLETIVE\` or \`LOGICAL\`.

Respond in the following format: 
Analysis: [your detailed reasoning]
Classification: [EXPLETIVE or LOGICAL]
Reasoning: [explanation of the classification]
Conclusion: [EXPLETIVE or LOGICAL]`;

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
      const reasoningMatch = generatedText.match(/Reasoning:\s*(.*?)(?=Conclusion:|$)/s);
      const conclusionMatch = generatedText.match(/Conclusion:\s*(EXPLETIVE|LOGICAL)/i);
      
      return {
        analysis: analysisMatch ? analysisMatch[1].trim() : '',
        classification: (classificationMatch && classificationMatch[1]) ? 
          classificationMatch[1].toUpperCase() : 'UNCERTAIN',
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
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

// Rest of the file remains unchanged
[... rest of the existing code ...]
