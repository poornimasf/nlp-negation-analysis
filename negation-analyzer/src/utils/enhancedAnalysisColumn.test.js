/**
 * Test cases for Enhanced Analysis Column with Semantic Context
 * Verify that semantic context information is properly displayed in analysis results
 */

import { formatTrainingResult } from './resultFormatters';

// Test cases for enhanced analysis column with semantic context
const enhancedAnalysisTestCases = [
  {
    description: "Semantic override case: prevention verb should show override details",
    analysis: {
      type: "No Expletive",
      classification: false
    },
    trainingAnalysis: {
      classification: false,
      confidence: 0.90,
      reasoning: 'Prevention verb detected: "emparent" typically takes logical "ne"',
      semanticOverride: true,
      semanticContext: {
        type: 'PREVENTION_VERB',
        verb: 'emparer',
        confidence: 0.90,
        reasoning: 'Prevention verb detected: "emparent" typically takes logical "ne"'
      },
      originalLinguisticAnalysis: {
        trigger: 'avant que',
        subjunctive: 'emparent',
        originalClassification: true,
        originalConfidence: 0.85
      },
      enhancedAnalysis: {
        trigger: { trigger: 'avant que', category: 'TEMPORAL' },
        subjunctive: { verb: 'emparent', type: 'REGULAR_ER', confidence: 0.75 }
      }
    },
    expectedIncludes: [
      'Semantic Context Analysis:',
      'Semantic Override: Applied',
      'Override Type: PREVENTION_VERB',
      'Override Confidence: 90%',
      'Prevention verb detected',
      'Original Classification: Expletive (overridden)',
      'Original Confidence: 85%'
    ]
  },
  {
    description: "Completion verb case: should show completion verb detection",
    analysis: {
      type: "No Expletive",
      classification: false
    },
    trainingAnalysis: {
      classification: false,
      confidence: 0.75,
      reasoning: 'Completion verb: "empire" in process context often takes logical "ne"',
      semanticOverride: true,
      semanticContext: {
        type: 'COMPLETION_VERB',
        verb: 'empire',
        confidence: 0.75,
        reasoning: 'Completion verb: "empire" in process context often takes logical "ne"'
      },
      originalLinguisticAnalysis: {
        trigger: 'avant que',
        subjunctive: 'empire',
        originalClassification: true,
        originalConfidence: 0.80
      },
      enhancedAnalysis: {
        trigger: { trigger: 'avant que', category: 'TEMPORAL' },
        subjunctive: { verb: 'empire', type: 'REGULAR_ER', confidence: 0.70 }
      }
    },
    expectedIncludes: [
      'Semantic Context Analysis:',
      'Semantic Override: Applied',
      'Override Type: COMPLETION_VERB',
      'Override Confidence: 75%',
      'Completion verb',
      'process context',
      'Original Classification: Expletive (overridden)'
    ]
  },
  {
    description: "No semantic context case: should show standard analysis",
    analysis: {
      type: "Expletive",
      classification: true
    },
    trainingAnalysis: {
      classification: true,
      confidence: 0.85,
      enhancedAnalysis: {
        trigger: { trigger: 'avant que', category: 'TEMPORAL' },
        subjunctive: { verb: 'vienne', type: 'VENIR', confidence: 0.85 },
        semanticContext: null
      }
    },
    expectedIncludes: [
      'Semantic Context Analysis:',
      'Semantic Context: No logical negation context detected',
      'Analysis Type: Standard linguistic analysis applied'
    ]
  },
  {
    description: "Semantic context detected but not overridden: should show context details",
    analysis: {
      type: "Expletive",
      classification: true
    },
    trainingAnalysis: {
      classification: true,
      confidence: 0.85,
      enhancedAnalysis: {
        trigger: { trigger: 'avant que', category: 'TEMPORAL' },
        subjunctive: { verb: 'capable', type: 'ADJECTIVE', confidence: 0.70 },
        semanticContext: {
          type: 'CAPABILITY_ADJECTIVE',
          adjective: 'capable',
          confidence: 0.70, // Below 0.75 threshold
          reasoning: 'Capability adjective: "capable" in readiness context often takes logical "ne"'
        }
      }
    },
    expectedIncludes: [
      'Semantic Context Analysis:',
      'Context Type: CAPABILITY_ADJECTIVE',
      'Context Confidence: 70%',
      'Context Reasoning: Capability adjective',
      'Override Applied: No (confidence below threshold)'
    ]
  }
];

// Manual testing function
function testEnhancedAnalysisColumn() {
  console.log('🧪 Testing Enhanced Analysis Column with Semantic Context...\n');
  
  enhancedAnalysisTestCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.description}`);
    
    // Format the result
    const formattedResult = formatTrainingResult(testCase.analysis, testCase.trainingAnalysis);
    
    console.log('Formatted Result:');
    console.log(formattedResult);
    console.log('\nExpected Includes:');
    
    // Check if all expected strings are included
    let allIncluded = true;
    testCase.expectedIncludes.forEach(expectedString => {
      const included = formattedResult.includes(expectedString);
      console.log(`  "${expectedString}" - ${included ? '✅' : '❌'}`);
      if (!included) allIncluded = false;
    });
    
    console.log(`\nOverall Result: ${allIncluded ? '✅ PASS' : '❌ FAIL'}\n`);
    console.log('---\n');
  });
  
  console.log(`📊 Total test cases: ${enhancedAnalysisTestCases.length}`);
}

// Test individual formatting functions
function testSemanticContextFormatting() {
  console.log('🧪 Testing Semantic Context Formatting...\n');
  
  const testCases = [
    {
      name: 'Prevention Verb Override',
      trainingAnalysis: {
        semanticOverride: true,
        semanticContext: {
          type: 'PREVENTION_VERB',
          confidence: 0.90,
          reasoning: 'Prevention verb detected'
        },
        confidence: 0.90
      }
    },
    {
      name: 'Capability Adjective (No Override)',
      trainingAnalysis: {
        enhancedAnalysis: {
          semanticContext: {
            type: 'CAPABILITY_ADJECTIVE',
            confidence: 0.70,
            reasoning: 'Capability adjective detected'
          }
        }
      }
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`Testing: ${testCase.name}`);
    const result = formatTrainingResult({ type: 'Test' }, testCase.trainingAnalysis);
    console.log('Result includes semantic context:', result.includes('Semantic Context Analysis:'));
    console.log('---');
  });
}

export { 
  enhancedAnalysisTestCases, 
  testEnhancedAnalysisColumn, 
  testSemanticContextFormatting 
};
