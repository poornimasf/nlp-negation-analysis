# Analysis Modes Documentation (v2.6.4)

## Overview
The French Negation Type Prediction System offers multiple analysis modes, each designed for different use cases and data availability scenarios. This document provides comprehensive details about each mode's capabilities, particularly the enhanced training data analysis.

## Mode Selection Logic
- **Rule-Based**: Use when you want linguistic pattern-based analysis
- **Training Data**: Use when you have annotated examples and want sophisticated linguistic analysis
- **SVM**: Use for statistical machine learning approach
- **Hybrid**: Use for AI-enhanced analysis with CroissantLLM integration

## 1. Rule-Based Analysis

### Core Functionality
- Binary classification (expletive vs non-expletive)
- Pattern-based trigger detection
- Subjunctive mood analysis
- Confidence scoring based on linguistic evidence

### Supported Triggers
- **Fear expressions**: "peur que", "craindre que", "redouter que"
- **Temporal expressions**: "avant que" (with enhanced analysis)
- **Impersonal expressions**: "peu s'en faut que"

### Enhanced Avant Que Analysis
- Complement clause detection (finite vs infinitive)
- Subjunctive mood verification
- Combined assessment for high-confidence predictions

## 2. Training Data Analysis (Enhanced)

### Core Capabilities
The training data mode now provides research-quality linguistic analysis with comprehensive feature detection:

#### **Comprehensive Trigger Coverage**
- **Fear expressions**: "peur que", "de peur que", "dans la crainte que", "par crainte que", "craindre que", "redouter que"
- **Temporal expressions**: "avant que" with all subcategories (sequence, preventive, anticipatory)
- **Conditional expressions**: "à moins que", "pourvu que", "pour peu que"
- **Comparative constructions**: "plus...que", "moins...que", "mieux...que", "autre...que"
- **Impersonal expressions**: "peu s'en faut que", "il s'en faut de peu que"

#### **Ambiguity Avoidance Detection**
Identifies contexts where expletive "ne" serves to clarify meaning:

1. **Temporal Ambiguity** (+20% expletive likelihood)
   - Multiple temporal markers creating sequence confusion
   - Patterns: "quand...avant", "après...pendant", overlapping time references
   - Example: "Quand il arrive avant qu'elle parte" (temporal sequence ambiguity)

2. **Modal Ambiguity** (+15% expletive likelihood)
   - Uncertainty markers affecting negation interpretation
   - Patterns: "peut-être", "probablement", "il se peut que"
   - Example: "Il se peut qu'il ait peur qu'elle vienne" (modal uncertainty)

3. **Scope Ambiguity** (+25% expletive likelihood)
   - Multiple embedded clauses creating scope confusion
   - Patterns: Multiple "que" clauses, embedded speech/thought verbs
   - Example: "Je pense qu'il dit qu'il a peur qu'elle parte" (scope confusion)

4. **Negation Ambiguity** (+30% expletive likelihood)
   - Negative contexts where "ne" clarifies positive vs negative intent
   - Patterns: "sans...peur", "ni...craindre", double negative contexts
   - Example: "Sans avoir peur qu'il vienne" (negative context ambiguity)

#### **Multiple Negation Analysis**
Sophisticated distinction between expletive and logical negation:

1. **Double Negation Detection** (-50% expletive likelihood)
   - Standard French "ne...pas" patterns (95% confidence)
   - Discontinuous negation with "ne...que...pas"
   - Example: "Il n'a pas peur qu'elle vienne" (logical negation)

2. **Expletive Context Recognition** (+40% expletive likelihood)
   - Standalone "ne" in trigger contexts without negative words
   - Patterns: "peur que...ne" without "pas/jamais/rien"
   - Example: "J'ai peur qu'il ne vienne" (expletive context)

3. **Complex Negation Patterns** (Variable impact)
   - Multiple negative elements in single sentence
   - Triple negation with "sans...ne...pas"
   - Context-dependent analysis

4. **Negative Polarity Items** (Moderate influence)
   - "ne" with polarity-sensitive items ("que", "plus", "encore")
   - Context-dependent analysis
   - Example: "Il ne fait que partir avant qu'elle arrive"

#### **Enhanced Vowel Context Analysis**
Proper surface form selection for "ne" vs "n'":

1. **Elision Requirements** → "n'"
   - Vowel-initial words: "arrive", "entre", "ouvre"
   - Silent "h" words: "heure", "homme", "histoire", "hiver"
   - French vowel sounds including nasal vowels

2. **No Elision Cases** → "ne"
   - Aspirated "h" words: "héros", "honte", "haut", "huit"
   - Consonant-initial words: "parte", "vienne", "finisse"

3. **Surface Form Recommendations**
   - Context-aware "ne" vs "n'" selection
   - Following word analysis with detailed reasoning
   - Confidence scoring for elision decisions

#### **Register/Genre Detection**
Automatic detection of language register with weighted impact:

1. **Literary Register** (+30% expletive likelihood)
   - Complex relatives: "dont", "duquel", "auquel"
   - Literary subjunctive forms: "eût", "fût", "eussent"
   - Archaic negation: "point", "guère", "nullement"
   - Temporal markers: "jadis", "naguère", "autrefois"

2. **Formal Register** (+20% expletive likelihood)
   - Formal connectors: "cependant", "toutefois", "néanmoins"
   - Purpose clauses: "afin que", "de sorte que"
   - Concessive constructions: "quoique", "bien que"
   - Formal relatives: "lequel", "laquelle"

3. **Colloquial Register** (-20% expletive likelihood)
   - Informal forms: "ça", "c'est que", "y a"
   - Intensifiers: "super", "hyper", "trop"
   - Informal particles: "ouais", "nan", "bah"
   - Vague terms: "truc", "machin", "bidule"

#### **Enhanced Similarity Calculation**
Sophisticated linguistic feature matching with weighted bonuses:

- **Trigger Category Match**: +0.3 similarity bonus
- **Subjunctive Type Match**: +0.2 similarity bonus
- **Register Match**: +0.15 similarity bonus
- **Subcategory Match**: +0.1 similarity bonus
- **Avant Que Enhanced**: +0.1 similarity bonus

#### **Multi-Factor Confidence Scoring**
The system combines multiple factors for final classification:

1. **Base Similarity**: Lexical similarity from training examples
2. **Linguistic Feature Bonuses**: Weighted bonuses for feature matches
3. **Ambiguity Adjustments**: +10% to +30% based on ambiguity type
4. **Negation Adjustments**: -50% for logical negation, +40% for expletive context
5. **Register Adjustments**: Based on detected register type

### Training Data Format
```json
{
  "examples": [
    {
      "text": "French sentence",
      "has_expletive_ne": true/false,
      "classification": true/false,
      "trigger": "peur que"|"avant que"|"peu s'en faut"|null,
      "ne_position": number|null,
      "register": "literary"|"formal"|"neutral"|"colloquial",
      "discourse_context": "temporal"|"fear"|"negative"|"contrastive"
    }
  ]
}
```

### Analysis Output Example

```
Enhanced Linguistic Analysis:
- Trigger: "avant que" (TEMPORAL)
- Subcategory: SEQUENCE
- Subjunctive: "arrive" (ARRIVER, 85% confidence)
- Register: FORMAL (75% confidence)
- Register Features: formal: "cependant"

Ambiguity Analysis:
- Ambiguity Detected: Yes
- Ambiguity Score: 45%
- Clarification Needed: Yes
- Recommendation: Expletive ne recommended for disambiguation
- Ambiguity Types: TEMPORAL_AMBIGUITY, SCOPE_AMBIGUITY

Multiple Negation Analysis:
- Multiple Negation: No
- Negation Type: NONE
- Is Expletive Context: Yes
- Is Logical Negation: No
- Recommendation: Expletive ne detected - optional semantic marker

Vowel Context Analysis:
- Surface Form: n'
- Reason: Vowel sound in "arrive" - elision required
- Following Word: "arrive"

Enhanced Avant Que Analysis:
- Complement Clause: Present (95% confidence)
- Subjunctive Mood: Present (85% confidence)
- Both Conditions Met: Yes
- Reasoning: Both complement clause and subjunctive mood present - expletive negation highly likely

Combined Analysis Summary:
- Overall Recommendation: Expletive ne likely due to ambiguity/context factors
- Expletive Likelihood: 75%
- Contributing Factors:
  • High ambiguity context (+30%)
  • Expletive negation context (+40%)
  • Surface form: n' (Vowel sound in "arrive" - elision required)

Best Match:
- Example: "Il faut partir avant qu'elle arrive"
- Similarity: 92%
- Matching Features: trigger match, subjunctive match, register match

Enhanced Confidence Breakdown:
- Base Expletive: 65% (from similar examples)
- Base Non-expletive: 35% (from similar examples)
- Adjusted Expletive: 78% (includes ambiguity/negation factors)
- Adjusted Non-expletive: 22% (includes ambiguity/negation factors)
- Ambiguity/Negation Adjustment: +13%
- Total Weight: 3.45 (includes linguistic feature bonuses)
```

## 3. SVM Analysis

### Core Functionality
- Support Vector Machine classification
- Statistical analysis with confidence scoring
- Training data integration
- Feature extraction from text patterns

### Use Cases
- Large datasets requiring statistical analysis
- Comparative analysis with other methods
- Research applications requiring ML approaches

## 4. Hybrid Analysis

### Core Functionality
- CroissantLLM integration for context-aware analysis
- Combined rule-based and AI-powered analysis
- French-specific language model capabilities
- Graceful fallback to rule-based analysis

### Features
- Context-aware analysis of removed "ne" scenarios
- Syntax validation and confidence enhancement
- Advanced linguistic understanding
- Real-time AI analysis

## Mode Comparison

| Feature | Rule-Based | Training Data | SVM | Hybrid |
|---------|------------|---------------|-----|--------|
| Linguistic Analysis | ✅ Basic | ✅ Comprehensive | ❌ Limited | ✅ Advanced |
| Ambiguity Detection | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| Multiple Negation | ❌ No | ✅ Yes | ❌ No | ✅ Partial |
| Register Detection | ❌ No | ✅ Yes | ❌ No | ✅ Partial |
| Vowel Context | ❌ No | ✅ Yes | ❌ No | ❌ No |
| User Data Required | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| AI Integration | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Research Quality | ✅ Good | ✅ Excellent | ✅ Good | ✅ Very Good |

## Recommendations

### For Academic Research
- **Primary**: Training Data Analysis (comprehensive linguistic features)
- **Secondary**: Hybrid Analysis (AI-enhanced validation)

### For General Use
- **Primary**: Rule-Based Analysis (reliable, no data required)
- **Secondary**: Hybrid Analysis (enhanced accuracy)

### For Large-Scale Analysis
- **Primary**: Training Data Analysis (sophisticated batch processing)
- **Secondary**: SVM Analysis (statistical validation)

### For Comparative Studies
- **Use Multiple Modes**: Compare results across different approaches
- **Document Methodology**: Specify which features were used in analysis
