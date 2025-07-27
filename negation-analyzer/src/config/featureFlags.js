export const FEATURE_FLAGS = {
    ENABLE_CAMEMBERT: process.env.REACT_APP_ENABLE_CAMEMBERT === 'true',
};

export const isFeatureEnabled = (flag) => {
    return FEATURE_FLAGS[flag] || false;
};
