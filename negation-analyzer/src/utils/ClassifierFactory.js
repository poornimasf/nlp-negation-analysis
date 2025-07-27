import { ANALYSIS_MODES } from './AnalysisModes';
import { isFeatureEnabled } from '../config/featureFlags';
import ImprovedFrenchNegationClassifier from './ImprovedFrenchNegationClassifier';
import BinaryClassifier from './BinaryClassifier';
import CamemBERTClassifier from './CamemBERTClassifier';

class ClassifierFactory {
    static async createClassifier(mode, trainingData = null) {
        switch (mode) {
            case ANALYSIS_MODES.RULE_BASED:
                const classifier = new ImprovedFrenchNegationClassifier();
                await classifier.initialize();
                return classifier;
                
            case ANALYSIS_MODES.TRAINING_DATA:
                const binaryClassifier = new BinaryClassifier();
                if (trainingData) {
                    await binaryClassifier.train(trainingData);
                }
                return binaryClassifier;
                
            case ANALYSIS_MODES.CAMEMBERT:
                if (!isFeatureEnabled('ENABLE_CAMEMBERT')) {
                    throw new Error('CamemBERT analysis mode is not enabled');
                }
                const camembert = new CamemBERTClassifier();
                await camembert.initialize();
                return camembert;
                
            default:
                throw new Error(\`Unknown analysis mode: \${mode}\`);
        }
    }
}

export default ClassifierFactory;
