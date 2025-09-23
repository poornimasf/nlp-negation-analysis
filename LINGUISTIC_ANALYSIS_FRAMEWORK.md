# Linguistic Analysis Framework for French Expletive "Ne" Detection

## Overview

This document outlines the empirical linguistic framework used to predict whether removed "ne" markers in French sentences were expletive or logical negation, based on comprehensive training data analysis.

## Training Data Analysis Results

### Dataset Composition
- **Total Examples**: 3,000 (1,500 expletive=true, 1,500 expletive=false)
- **Triggers**: avant_que (1,000), peur_que (1,000), sen_faut_que (1,000)
- **Mode**: Paragraph-level analysis for contextual accuracy

### Key Findings

#### 1. Expletive Presence is Largely Optional
**Critical Insight**: The training data reveals that expletive "ne" presence is **subtle and context-dependent**, not rule-based.

- **Both groups show high conversational markers** (88-92%)
- **Subjunctive presence is similar** across groups (58-68%)
- **Differences are marginal** (2-5% between groups)

#### 2. Subtle Pattern Differences

| Pattern | Expletive=True | Expletive=False | Difference |
|---------|----------------|-----------------|------------|
| **First Person Markers** | 44.6% | 49.7% | -5.1% (less expletive) |
| **Third Person Markers** | 80.7% | 78.3% | +2.4% (more expletive) |
| **Negation Markers** | 37.9% | 41.7% | -3.8% (less expletive) |
| **Completion Verbs** | 10.1% | 8.2% | +1.9% (more expletive) |

#### 3. Trigger-Specific Patterns

**Sen_faut_que** shows stronger differentiation:
- **Literary markers**: 56% vs 24% (+32% for expletive=true)
- **Formal markers**: 10.6% vs 5.4% (+5.2% for expletive=true)

**Avant_que and Peur_que** show minimal differentiation:
- Patterns are largely similar between expletive=true and expletive=false
- Context and register matter more than lexical patterns

## Implementation Strategy

### 1. Subtle Probability Adjustments

**Replaced aggressive overrides with gentle adjustments:**

```javascript
// OLD: Strong conversational override (40% cap)
if (hasStrongPersonalMarkers) {
  probability = Math.min(probability, 0.40); // Too aggressive
}

// NEW: Subtle conversational adjustment (47% cap)
if (hasStrongPersonalMarkers) {
  probability = Math.min(probability, 0.47); // More balanced
}
```

### 2. Training Data-Based Micro-Adjustments

**Applied marginal adjustments reflecting actual data patterns:**

```javascript
// First person: -5% (training shows 44.6% vs 49.7%)
if (hasFirstPersonMarkers && !hasThirdPersonMarkers) {
  probability *= 0.95;
}

// Third person: +5% (training shows 80.7% vs 78.3%)
if (hasThirdPersonMarkers && !hasFirstPersonMarkers) {
  probability *= 1.05;
}

// Negation markers: -7% (training shows 37.9% vs 41.7%)
if (hasNegationMarkers) {
  probability *= 0.93;
}

// Completion verbs: +8% (training shows 10.1% vs 8.2%)
if (hasCompletionVerbs) {
  probability *= 1.08;
}
```

### 3. Reduced Pro-Expletive Pattern Strength

**Balanced pattern weights to reflect training data reality:**

| Pattern | Old Weight | New Weight | Rationale |
|---------|------------|------------|-----------|
| **Prevention Context** | 85% | 70% | Reduced aggressive override |
| **Medical Context** | 80% | 65% | More balanced with conversational |
| **Literary Context** | 85% | 70% | Except sen_faut_que (stronger signal) |
| **Temporal Anticipation** | 75% | 62% | Subtle adjustment |
| **Completion Context** | 70% | 60% | Gentle pro-expletive signal |

## Linguistic Principles

### 1. Register Detection Hierarchy

**Priority Order:**
1. **Conversational markers** (personal narratives, informal language)
2. **Literary markers** (classical French, archaic constructions)
3. **Formal markers** (administrative, legal, institutional)
4. **Academic markers** (research, historical contexts)

### 2. Person and Perspective Effects

**First Person (je, j', mon, ma, mes, moi):**
- **Associated with personal narratives**
- **Slightly less expletive** (-5% adjustment)
- **More conversational register**

**Third Person (il, elle, ils, elles, son, sa, ses, leur):**
- **Associated with formal descriptions**
- **Slightly more expletive** (+5% adjustment)
- **More objective/institutional tone**

### 3. Semantic Domain Effects

**Completion/Event Verbs** (finisse, termine, achève, arrive, survienne):
- **Slightly more expletive** (+8% adjustment)
- **Associated with temporal anticipation**
- **Common in expletive constructions**

**Negation Markers** (pas, plus, jamais, rien, personne):
- **Slightly less expletive** (-7% adjustment)
- **Indicates logical negation context**
- **Reduces expletive likelihood**

## Validation and Performance

### Expected Improvements

**Target Performance:**
- **Expletive Detection**: Improve from 54.8% to 65-70%
- **No Expletive Detection**: Maintain 77.6% accuracy
- **Overall Accuracy**: Improve from 66.8% to 70-75%

### Balanced Approach Benefits

1. **Preserves conversational protection** (47% cap vs 40%)
2. **Allows legitimate expletive cases** to be classified correctly
3. **Reflects training data reality** (subtle differences, not dramatic)
4. **Maintains linguistic accuracy** for personal narratives

## Technical Implementation

### Pattern Detection Methods

```javascript
// Subtle conversational adjustment
const hasStrongPersonalMarkers = /\b(?:je\s+suis\s+plongée|aujourd'hui\s+j'|...)\b/i.test(text);

// Person marker detection
const hasFirstPersonMarkers = /\b(?:je\s|j'|mon\s|ma\s|mes\s|moi\b)/i.test(text);
const hasThirdPersonMarkers = /\b(?:il\s|elle\s|ils\s|elles\s|son\s|sa\s|ses\s|leur\s)/i.test(text);

// Semantic pattern detection
const hasNegationMarkers = /\b(?:pas|plus|jamais|rien|personne|aucun)\b/i.test(text);
const hasCompletionVerbs = /\b(?:finisse|termine|achève|complète|arrive|survienne|se\s+produise|devienne|tombe|frappe)\b/i.test(text);
```

### Probability Calculation Flow

1. **Start with baseline** (50% for avant_que, trigger-specific for others)
2. **Apply register effects** (literary, formal, academic)
3. **Apply conversational adjustment** (47% cap for personal narratives)
4. **Apply subtle micro-adjustments** (person, negation, completion)
5. **Apply pattern-specific boosts** (reduced strength: 60-70% range)
6. **Apply truly formal overrides** (80% for institutional contexts)

## Conclusion

This framework reflects the empirical reality that **expletive "ne" presence is largely optional and context-dependent**. Rather than forcing binary decisions through aggressive overrides, the system now uses **subtle probability adjustments** that mirror the **marginal differences found in training data**.

The approach prioritizes **linguistic accuracy** while acknowledging the **inherent optionality** of expletive "ne" in modern French, leading to more balanced and realistic classifications.
