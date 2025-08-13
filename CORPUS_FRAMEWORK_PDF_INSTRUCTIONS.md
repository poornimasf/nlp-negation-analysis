# PDF Generation Instructions for Corpus-Driven Framework

## Generated Files Available:

1. **LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS.html** - Professional HTML with embedded styling
2. **LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS.rtf** - Rich Text Format for word processors
3. **LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS_CLEAN.md** - LaTeX-compatible markdown

## To Generate PDF:

### Option 1: Using Browser (Recommended)
1. Open `LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS.html` in any web browser
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows/Linux)
3. Select "Save as PDF" as the destination
4. Choose settings:
   - Paper size: A4 or Letter
   - Margins: Normal
   - Include headers/footers: Optional
5. Save as `LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS.pdf`

### Option 2: Using Command Line (if LaTeX available)
```bash
# With proper LaTeX installation:
export PATH="/usr/local/texlive/2025basic/bin/universal-darwin:$PATH"
pandoc LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS_CLEAN.md -o LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS.pdf --pdf-engine=pdflatex --toc --number-sections
```

### Option 3: Using Word Processor
1. Open `LINGUISTIC_ANALYSIS_FRAMEWORK_CORPUS.rtf` in Microsoft Word or LibreOffice
2. Export/Save As PDF

## Document Content:
The corpus-focused framework document includes:
- Corpus methodology and 1000+ sentence analysis
- Anti-expletive context discovery (major finding)
- Quantified register effects from corpus data
- Pattern weights derived from corpus frequency
- Error analysis and iterative refinement
- Performance validation tied to corpus consistency
- Theoretical implications of corpus findings

## Styling Features:
- Professional academic formatting
- Syntax-highlighted code blocks
- Structured table of contents with numbering
- Print-optimized layout
- Corpus data tables and quantified results
