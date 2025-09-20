const fs = require('fs');
const path = require('path');
const FrenchExpletiveClassifier = require('./french_expletive_classifier');

class TrainingPipeline {
  constructor() {
    this.dataDir = './negation-analyzer/public/training_data/';
    this.triggers = ['avant_de', 'avant_que', 'moins_plus', 'peur_que', 'sen_faut_que'];
  }

  // Load training data for specified mode
  loadTrainingData(mode) {
    const suffix = mode === 'sentence' ? '_sentence.json' : '_paragraph.json';
    let allData = [];
    
    console.log(`Loading ${mode} training data...`);
    
    this.triggers.forEach(trigger => {
      const filePath = path.join(this.dataDir, `${trigger}${suffix}`);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: ${filePath} not found`);
        return;
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`  ${trigger}: ${data.examples.length} examples`);
      
      data.examples.forEach(example => {
        allData.push({
          text: example.text,
          paragraph: example.paragraph,
          hasExpletive: example.hasExpletive,
          trigger: trigger
        });
      });
    });
    
    console.log(`Total ${mode} examples loaded: ${allData.length}`);
    return allData;
  }

  // Split data into train/test sets
  splitData(data, testRatio = 0.2) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const testSize = Math.floor(data.length * testRatio);
    
    return {
      train: shuffled.slice(testSize),
      test: shuffled.slice(0, testSize)
    };
  }

  // Train single classifier
  trainClassifier(mode) {
    console.log(`\n=== Training ${mode.toUpperCase()} Mode Classifier ===`);
    
    // Load data
    const data = this.loadTrainingData(mode);
    const { train, test } = this.splitData(data);
    
    console.log(`Training set: ${train.length} examples`);
    console.log(`Test set: ${test.length} examples`);
    
    // Create and train classifier
    const classifier = new FrenchExpletiveClassifier(mode);
    classifier.train(train);
    
    // Evaluate on test set
    console.log('\nEvaluating on test set...');
    const results = classifier.evaluate(test);
    
    console.log(`\n${mode.toUpperCase()} MODE RESULTS:`);
    console.log(`Accuracy: ${(results.accuracy * 100).toFixed(2)}%`);
    console.log(`Precision: ${(results.precision * 100).toFixed(2)}%`);
    console.log(`Recall: ${(results.recall * 100).toFixed(2)}%`);
    console.log(`F1-Score: ${(results.f1 * 100).toFixed(2)}%`);
    
    console.log('\nConfusion Matrix:');
    console.log(`True Positives: ${results.confusionMatrix.tp}`);
    console.log(`False Positives: ${results.confusionMatrix.fp}`);
    console.log(`True Negatives: ${results.confusionMatrix.tn}`);
    console.log(`False Negatives: ${results.confusionMatrix.fn}`);
    
    console.log('\nSample Predictions:');
    results.predictions.forEach((pred, i) => {
      const status = pred.actual === pred.predicted ? '✓' : '✗';
      console.log(`${i + 1}. ${status} "${pred.text}"`);
      console.log(`   Actual: ${pred.actual ? 'EXPLETIVE' : 'NON-EXPLETIVE'}, Predicted: ${pred.predicted ? 'EXPLETIVE' : 'NON-EXPLETIVE'} (${(pred.confidence * 100).toFixed(1)}%)`);
      console.log(`   ${pred.reasoning}`);
      console.log();
    });
    
    // Save model
    classifier.saveModel(`./models/${mode}_classifier.json`);
    
    return { classifier, results, testData: test };
  }

  // Train both classifiers and compare
  trainDualMode() {
    console.log('=== DUAL-MODE TRAINING PIPELINE ===\n');
    
    // Create models directory
    if (!fs.existsSync('./models')) {
      fs.mkdirSync('./models');
    }
    
    // Train both modes
    const sentenceResults = this.trainClassifier('sentence');
    const paragraphResults = this.trainClassifier('paragraph');
    
    // Cross-evaluation: test paragraph classifier on sentence data
    console.log('\n=== CROSS-EVALUATION ===');
    console.log('Testing paragraph classifier on sentence data...');
    
    const crossResults = paragraphResults.classifier.evaluate(sentenceResults.testData);
    
    console.log(`Cross-evaluation accuracy: ${(crossResults.accuracy * 100).toFixed(2)}%`);
    
    // Comparative analysis
    console.log('\n=== COMPARATIVE ANALYSIS ===');
    console.log(`Sentence Mode Accuracy: ${(sentenceResults.results.accuracy * 100).toFixed(2)}%`);
    console.log(`Paragraph Mode Accuracy: ${(paragraphResults.results.accuracy * 100).toFixed(2)}%`);
    console.log(`Cross-Evaluation (Paragraph→Sentence): ${(crossResults.accuracy * 100).toFixed(2)}%`);
    
    const improvement = paragraphResults.results.accuracy - sentenceResults.results.accuracy;
    console.log(`Paragraph mode improvement: ${(improvement * 100).toFixed(2)} percentage points`);
    
    // Feature importance analysis
    this.analyzeFeatureImportance(sentenceResults.classifier, paragraphResults.classifier);
    
    return {
      sentenceResults,
      paragraphResults,
      crossResults
    };
  }

  // Analyze feature importance
  analyzeFeatureImportance(sentenceClassifier, paragraphClassifier) {
    console.log('\n=== FEATURE IMPORTANCE ANALYSIS ===');
    
    console.log('\nSentence Mode Features:');
    sentenceClassifier.featureNames.forEach((feature, i) => {
      const weight = sentenceClassifier.model.weights[i];
      if (Math.abs(weight) > 0.1) {
        const direction = weight > 0 ? 'EXPLETIVE' : 'NON-EXPLETIVE';
        console.log(`  ${feature}: ${weight.toFixed(3)} (${direction})`);
      }
    });
    
    console.log('\nParagraph Mode Features:');
    paragraphClassifier.featureNames.forEach((feature, i) => {
      const weight = paragraphClassifier.model.weights[i];
      if (Math.abs(weight) > 0.1) {
        const direction = weight > 0 ? 'EXPLETIVE' : 'NON-EXPLETIVE';
        console.log(`  ${feature}: ${weight.toFixed(3)} (${direction})`);
      }
    });
  }

  // Test individual examples
  testExamples() {
    console.log('\n=== TESTING INDIVIDUAL EXAMPLES ===');
    
    // Load trained models
    const sentenceClassifier = new FrenchExpletiveClassifier('sentence');
    const paragraphClassifier = new FrenchExpletiveClassifier('paragraph');
    
    try {
      sentenceClassifier.loadModel('./models/sentence_classifier.json');
      paragraphClassifier.loadModel('./models/paragraph_classifier.json');
    } catch (error) {
      console.log('Models not found. Run training first.');
      return;
    }
    
    // Test examples from corpus
    const testExamples = [
      {
        text: "j'ai peur qu'elle ne devienne à son tour une utopie désincarnée",
        expected: true,
        description: "Formal emotional context (peur_que)"
      },
      {
        text: "utiliser intval() avant de le stocker dans la base de données",
        expected: false,
        description: "Technical procedural context (avant_de)"
      },
      {
        text: "bien plus fanatiques qu'elle ne voulait l'admettre",
        expected: true,
        description: "Literary comparative context (moins_plus)"
      },
      {
        text: "ne s'arrêtera jamais avant que nous l'ayons atteint",
        expected: false,
        description: "Neutral temporal context (avant_que)"
      }
    ];
    
    testExamples.forEach((example, i) => {
      console.log(`\n${i + 1}. "${example.text}"`);
      console.log(`   Expected: ${example.expected ? 'EXPLETIVE' : 'NON-EXPLETIVE'} (${example.description})`);
      
      const sentencePred = sentenceClassifier.predict(example.text);
      const paragraphPred = paragraphClassifier.predict(example.text);
      
      console.log(`   Sentence Mode: ${sentencePred.hasExpletive ? 'EXPLETIVE' : 'NON-EXPLETIVE'} (${(sentencePred.confidence * 100).toFixed(1)}%)`);
      console.log(`   Paragraph Mode: ${paragraphPred.hasExpletive ? 'EXPLETIVE' : 'NON-EXPLETIVE'} (${(paragraphPred.confidence * 100).toFixed(1)}%)`);
      
      const sentenceCorrect = sentencePred.hasExpletive === example.expected;
      const paragraphCorrect = paragraphPred.hasExpletive === example.expected;
      
      console.log(`   Sentence Correct: ${sentenceCorrect ? '✓' : '✗'}`);
      console.log(`   Paragraph Correct: ${paragraphCorrect ? '✓' : '✗'}`);
    });
  }
}

// Main execution
if (require.main === module) {
  const pipeline = new TrainingPipeline();
  
  // Check if models exist
  if (fs.existsSync('./models/sentence_classifier.json') && 
      fs.existsSync('./models/paragraph_classifier.json')) {
    console.log('Models found. Testing examples...');
    pipeline.testExamples();
  } else {
    console.log('Training new models...');
    pipeline.trainDualMode();
    
    // Test examples after training
    pipeline.testExamples();
  }
}

module.exports = TrainingPipeline;
