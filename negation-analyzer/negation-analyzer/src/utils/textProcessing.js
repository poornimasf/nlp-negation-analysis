import { TRIGGER_PATTERNS } from './patterns';

export const normalizeText = (text) => {
    return text.trim();
};

export const highlight = (text) => {
    // Handle TEMPORAL category with subcategories
    if (TRIGGER_PATTERNS.TEMPORAL) {
        for (const [subcategory, patterns] of Object.entries(TRIGGER_PATTERNS.TEMPORAL)) {
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
    }

    // Handle other categories
    for (const [category, patterns] of Object.entries(TRIGGER_PATTERNS)) {
        if (category === 'TEMPORAL') continue; // Skip TEMPORAL as it's handled above
        
        const categoryPatterns = Array.isArray(patterns) ? patterns : [patterns];
        for (const pattern of categoryPatterns) {
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
