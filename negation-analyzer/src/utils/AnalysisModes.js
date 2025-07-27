import { isFeatureEnabled } from '../config/featureFlags';

export const ANALYSIS_MODES = {
    RULE_BASED: 'RULE_BASED',
    TRAINING_DATA: 'TRAINING_DATA',
    CAMEMBERT: 'CAMEMBERT'
};

export const ANALYSIS_MODE_DESCRIPTIONS = {
    [ANALYSIS_MODES.RULE_BASED]: 'Pattern-based analysis using predefined French negation rules and CroissantLLM validation',
    [ANALYSIS_MODES.TRAINING_DATA]: 'Machine learning analysis based on user-provided training examples',
    [ANALYSIS_MODES.CAMEMBERT]: 'Deep learning analysis using CamemBERT model for French negation classification'
};

export const getAvailableAnalysisModes = () => {
    const modes = [
        {
            id: ANALYSIS_MODES.RULE_BASED,
            label: 'Rule-Based Analysis',
            description: ANALYSIS_MODE_DESCRIPTIONS[ANALYSIS_MODES.RULE_BASED]
        },
        {
            id: ANALYSIS_MODES.TRAINING_DATA,
            label: 'Training Data Analysis',
            description: ANALYSIS_MODE_DESCRIPTIONS[ANALYSIS_MODES.TRAINING_DATA]
        }
    ];

    // Add CamemBERT mode only if feature flag is enabled
    if (isFeatureEnabled('ENABLE_CAMEMBERT')) {
        modes.push({
            id: ANALYSIS_MODES.CAMEMBERT,
            label: 'CamemBERT Analysis',
            description: ANALYSIS_MODE_DESCRIPTIONS[ANALYSIS_MODES.CAMEMBERT]
        });
    }

    return modes;
};
