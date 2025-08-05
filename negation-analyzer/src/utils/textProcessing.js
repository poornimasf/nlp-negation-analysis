import { TRIGGER_PATTERNS } from './patterns';

export const normalizeText = (text) => {
    return text.trim();
};

export const highlight = (text) => {
    // Find trigger in text
    for (const patterns of Object.values(TRIGGER_PATTERNS)) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const before = text.slice(0, match.index);
                const trigger = match[0];
                const after = text.slice(match.index + trigger.length);
                return `${before}<mark>${trigger}</mark>${after}`;
            }
        }
    }
    return text;
};

export const determineClassification = async (text, analysis) => {
    if (analysis.includes('Classification: Expletive')) {
        return 'Expletive';
    }
    if (analysis.includes('Classification: No Expletive')) {
        return 'No Expletive';
    }
    return 'Unknown';
};
