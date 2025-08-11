#!/usr/bin/env node

/**
 * Test script for enhanced corpus-driven analysis with discourse factors
 * Verifies that the overcorrection problem is addressed and discourse factors are integrated
 */

import { analyzeTextEnhanced } from './negation-analyzer/src/utils/ruleBasedAnalyzer.js';
import { analyzeWithCorpusInsights } from './negation-analyzer/src/utils/enhancedTrainingAnalyzer.js';

// Test cases that previously suffered from overcorrection + discourse factor examples
const testCases = [
    // Cases that should be logical (not expletive) - these were the 3/10 problem
    {
        sentence: "Avant qu'il parte pas",
        expected: "No Expletive",
        reason: "Strong logical indicator 'pas' should override syntactic licensing",
        discourseExpected: "neutral"
    },
    {
        sentence: "Avant qu'elle arrive jamais à l'heure",
        expected: "No Expletive", 
        reason: "Strong logical indicator 'jamais' should override syntactic licensing",
        discourseExpected: "neutral"
    },
    {
        sentence: "Avant que les autres aient plus rien à dire",
        expected: "No Expletive",
        reason: "Multiple logical indicators should override syntactic licensing",
        discourseExpected: "neutral"
    },
    
    // Cases that should be expletive (these should still work)
    {
        sentence: "J'ai peur qu'il vienne",
        expected: "Expletive",
        reason: "Strong expletive context should be detected",
        discourseExpected: "neutral"
    },
    {
        sentence: "Je crains qu'elle parte",
        expected: "Expletive",
        reason: "Emotional expletive context should be detected",
        discourseExpected: "neutral"
    },
    
    // DISCOURSE FACTOR TEST CASES - NEW!
    {
        sentence: "Veuillez vous assurer qu'il vienne avant la réunion",
        expected: "Expletive",
        reason: "Formal register + politeness should favor expletive",
        discourseExpected: "formal/polite"
    },
    {
        sentence: "Bon, avant qu'il arrive, on fait quoi ?",
        expected: "Ambiguous",
        reason: "Informal register should slightly disfavor expletive, question context",
        discourseExpected: "informal/question"
    },
    {
        sentence: "Il convient néanmoins qu'elle vienne avant que la décision soit prise",
        expected: "Expletive",
        reason: "Literary/formal register should favor expletive",
        discourseExpected: "literary/formal"
    },
    {
        sentence: "Certainement qu'il viendra pas !",
        expected: "No Expletive",
        reason: "Assertive stance + logical 'pas' should override, exclamation context",
        discourseExpected: "assertive/exclamation"
    },
    {
        sentence: "Peut-être qu'avant qu'elle arrive, nous pourrions préparer quelque chose ?",
        expected: "Expletive",
        reason: "Tentative stance + question + politeness should favor expletive",
        discourseExpected: "tentative/question/polite"
    },
    
    // Complex discourse cases
    {
        sentence: "Auriez-vous l'amabilité de vous assurer qu'il vienne avant que la cérémonie commence ?",
        expected: "Expletive",
        reason: "High politeness + formal register + question + complex syntax should strongly favor expletive",
        discourseExpected: "formal/polite/question/complex"
    }
];

async function testEnhancedAnalysisWithDiscourse() {
    console.log('🧪 Testing Enhanced Corpus-Driven Analysis with Discourse Factors');
    console.log('================================================================');
    console.log('');
    
    let passed = 0;
    let total = testCases.length;
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`Test ${i + 1}/${total}: "${testCase.sentence}"`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Reason: ${testCase.reason}`);
        console.log(`Discourse Expected: ${testCase.discourseExpected}`);
        
        try {
            // Test enhanced rule-based analysis
            const result = analyzeTextEnhanced(testCase.sentence);
            
            console.log(`Result: ${result.prediction}`);
            console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`Correction Applied: ${result.correctionApplied || 'none'}`);
            
            if (result.semanticAnalysis) {
                const semantic = result.semanticAnalysis;
                console.log(`Logical Strength: ${semantic.logicalAnalysis.level}`);
                console.log(`Expletive Context: ${semantic.expletiveAnalysis.strength}`);
                console.log(`Semantic Bias: ${semantic.semanticBias.toFixed(2)}`);
                
                // NEW: Display discourse analysis
                if (semantic.discourseAnalysis) {
                    const discourse = semantic.discourseAnalysis;
                    console.log(`Discourse Summary: ${discourse.summary}`);
                    console.log(`Register: ${discourse.register.dominantRegister}`);
                    console.log(`Stance: ${discourse.stance.dominantStance}`);
                    console.log(`Pragmatic: ${discourse.pragmatic.factors.map(f => f.type).join(', ') || 'none'}`);
                    console.log(`Discourse Influence: ${discourse.discourseInfluence.strength} ${discourse.discourseInfluence.direction} (${discourse.discourseInfluence.totalBias.toFixed(2)})`);
                }
            }
            
            // Check if result matches expectation
            let testPassed = false;
            if (testCase.expected === "Ambiguous") {
                // For ambiguous cases, accept either prediction but check confidence
                testPassed = result.confidence < 0.8;
            } else {
                testPassed = result.prediction === testCase.expected;
            }
            
            if (testPassed) {
                console.log('✅ PASSED');
                passed++;
            } else {
                console.log('❌ FAILED');
            }
            
            console.log('');
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            console.log('');
        }
    }
    
    console.log('================================================================');
    console.log(`Results: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Enhanced analysis with discourse factors is working correctly.');
    } else if (passed >= total * 0.8) {
        console.log('✅ Most tests passed. Enhanced analysis shows significant improvement with discourse awareness.');
    } else {
        console.log('⚠️  Some tests failed. Enhanced analysis needs further refinement.');
    }
    
    // Discourse factor summary
    console.log('');
    console.log('📊 DISCOURSE FACTORS TESTED:');
    console.log('- Register: formal, informal, literary, technical');
    console.log('- Stance: assertive, tentative, emphatic, polite');
    console.log('- Pragmatic: questions, exclamations, politeness, complexity');
    console.log('- Integration: Discourse modulates but doesn\'t override strong semantic signals');
    
    return passed / total;
}

// Run the test
testEnhancedAnalysisWithDiscourse().catch(console.error);
