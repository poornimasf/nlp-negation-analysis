# Format Guide for Corpus-Driven Framework

## Available Formats (Consistent Naming):

### **Core Formats:**
1. **LINGUISTIC_ANALYSIS_FRAMEWORK.pdf** - **✅ READY-TO-USE PDF (261KB)**
2. **LINGUISTIC_ANALYSIS_FRAMEWORK.html** - Professional HTML with embedded styling
3. **LINGUISTIC_ANALYSIS_FRAMEWORK.md** - Main source document

## ✅ PDF Ready for Immediate Use!

**The PDF has been generated and is ready for immediate use:**
- **File**: `LINGUISTIC_ANALYSIS_FRAMEWORK.pdf`
- **Size**: 261KB
- **Quality**: Professional LaTeX formatting
- **Features**: Table of contents, numbered sections, academic styling

## Document Content Highlights:

### **✅ Logical Document Flow:**
- **Section 3: Corpus Findings First** - What the data revealed before explaining approach
- **Section 4: Hierarchical Model Justification** - Why this approach based on corpus conflicts
- **Section 5+: Implementation Details** - How the corpus-driven insights were implemented

### **✅ Comprehensive Corpus Examples:**
- **Real sentences from 1000+ corpus** for each finding
- **Specific source attribution** (Literary, Journalistic, Academic, Conversational)
- **Quantified usage rates** with exact percentages
- **Regional variation examples** (Quebec, Paris, Belgium, Switzerland)

### **✅ Hierarchical Model Justification:**
- **Corpus conflict examples** showing why hierarchy was needed
- **Priority order explanation** based on corpus consistency rates
- **Validation examples** demonstrating model effectiveness
- **Alternative approaches considered** and why they were rejected

## Format Usage:

### **PDF Format (Primary) ⭐**
- **Professional LaTeX formatting** with academic styling
- **Table of contents** with numbered sections and page numbers
- **High-quality typography** optimized for printing and digital viewing
- **Immediate use** - no conversion needed
- **Best for**: Sharing, printing, presentations, academic submission

### **HTML Format (Web/Custom PDF)**
- **Professional styling** with Times New Roman typography
- **Print-optimized layout** with proper page breaks
- **Embedded CSS** for consistent formatting
- **Best for**: Web viewing, custom PDF generation via browser

### **Markdown Source (Main Document)**
- **Main source document** with all latest content
- **LaTeX-compatible** for PDF generation
- **Best for**: Editing, version control, regenerating formats

## Usage Recommendations:

### **For Most Users: Use the PDF ⭐**
- **File**: `LINGUISTIC_ANALYSIS_FRAMEWORK.pdf`
- **Ready to use** for all purposes
- **Professional quality** with academic formatting
- **No conversion needed**

### **For Web Viewing: Use HTML**
- **File**: `LINGUISTIC_ANALYSIS_FRAMEWORK.html`
- **Open in any web browser**
- **Professional styling** with embedded CSS
- **Can generate custom PDF** via browser print function

### **For Editing/Customization: Use Markdown Source**
- **File**: `LINGUISTIC_ANALYSIS_FRAMEWORK.md`
- **Main source document** with all content
- **Edit and regenerate** other formats as needed
- **Version control friendly**

## Format Generation:

### **Regenerate HTML from Source:**
```bash
pandoc LINGUISTIC_ANALYSIS_FRAMEWORK.md -o LINGUISTIC_ANALYSIS_FRAMEWORK.html --standalone --toc --number-sections --css=<(echo "
body {
    font-family: 'Times New Roman', serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    line-height: 1.6;
    color: #333;
    background: white;
}
h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
h2 { color: #34495e; border-bottom: 2px solid #bdc3c7; padding-bottom: 5px; }
code { background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
pre { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
")
```

### **Regenerate PDF from Source:**
```bash
# Clean Unicode characters first
sed 's/[❌✅🎯📊🔍🚨🔧⚖️🎭✓]/*/g' LINGUISTIC_ANALYSIS_FRAMEWORK.md | sed 's/[🤔💡📈🎉🚀🆕]/*/g' | sed 's/→/->/g' | sed 's/"/"/g' | sed 's/"/"/g' | sed "s/'/'/g" | sed "s/'/'/g" > temp_clean.md

# Generate PDF
export PATH="/usr/local/texlive/2025basic/bin/universal-darwin:$PATH"
pandoc temp_clean.md -o LINGUISTIC_ANALYSIS_FRAMEWORK.pdf --pdf-engine=pdflatex --toc --number-sections

# Clean up
rm temp_clean.md
```

## Key Content Highlights:

### **✅ Real Corpus Examples:**

#### **Grammar Error Contexts (95% avoidance):**
- "Avant que j'**ai** l'élévateur..." (Conversational - indicative error)
- "Il faut partir avant qu'elle **a** fini..." (Social media - verb form error)

#### **Duration Specification (92% avoidance):**
- "Il a fallu attendre jusqu'à la 11e minute avant que Julien Blouin inscrive le troisième but." (Sports journalism)
- "Cela a duré six mois avant que les premiers résultats apparaissent." (Academic source)

#### **Technical/Administrative (88% avoidance):**
- "Le système redémarre automatiquement avant que les mises à jour soient appliquées." (Technical documentation)
- "Il convient de valider le contrat avant que la signature soit apposée." (Legal document)

#### **Literary Register (75% expletive usage):**
- "Il fallait agir avant que l'irréparable **ne** se produise." (Contemporary novel)
- "Bien avant que les colons français **ne** débarquent..." (Historical narrative)

#### **Regional Variation:**
- Quebec: "Il faut partir avant que ça commence." (23% usage, -25% vs Metropolitan)
- Paris: "Il faut partir avant que la réunion **ne** commence." (48% baseline)

### **✅ Hierarchical Model Priority Justification:**

#### **Priority 0: Anti-Expletive Contexts (85-95% consistency)**
- Grammar errors: 95% consistency (strongest signal in corpus)
- Duration contexts: 92% consistency
- Technical language: 88% consistency
- Informal speech: 85% consistency

#### **Priority 1: Logical Override (90%+ consistency)**
- "ne...pas" constructions: 90%+ avoid additional expletive
- Semantic incompatibility with expletive interpretation

#### **Priority 2: Strong Expletive Contexts (70-78% consistency)**
- Fear/anxiety contexts: 78% expletive usage
- Temporal urgency: 74% expletive usage
- Emotional departure: 73% expletive usage

#### **Priority 3: Syntactic Licensing (35% consistency)**
- "avant que + subjunctive": Only 35% expletive usage
- Much weaker than traditional grammar claims

#### **Priority 4: Discourse Factors (15-25% effect)**
- Register effects: +0.15 to +0.20 bias
- Modulating rather than determining influence

### **✅ Conflict Resolution Examples:**
- **Grammar errors vs syntactic licensing** → Grammar wins (95% vs 35%)
- **Duration vs urgency contexts** → Duration wins (92% vs 74%)
- **Technical vs formal register** → Technical wins (88% vs 60%)

## Document Features:
- **Logical flow:** Corpus findings → Model justification → Implementation
- **Real corpus examples** from 1000+ sentence analysis
- **Hierarchical model justification** with corpus conflict resolution
- **10 comprehensive corpus findings** with quantified data
- **Priority system explanation** based on corpus consistency rates
- **Validation examples** demonstrating model effectiveness
- **Regional and temporal variation** analysis with specific examples
- **Sociolinguistic correlations** (age, education effects)
- **Co-occurrence pattern analysis** with linguistic feature correlations

## Consistent File Structure:
- **LINGUISTIC_ANALYSIS_FRAMEWORK.md** - Main source document
- **LINGUISTIC_ANALYSIS_FRAMEWORK.html** - Generated HTML format
- **LINGUISTIC_ANALYSIS_FRAMEWORK.pdf** - Generated PDF format
- **Clean naming convention** - Same base name, different extensions
- **Easy maintenance** - Clear relationship between formats
