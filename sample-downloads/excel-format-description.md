# Excel Download Format - Rich Formatted Analysis Results

## 📊 Excel File Structure

The Excel download creates a comprehensive, professionally formatted workbook with multiple sheets:

### Sheet 1: "Analysis Results" 
**Main data with rich formatting and color coding**

| Column | Content | Formatting |
|--------|---------|------------|
| Sentence # | Sequential numbering | Standard |
| Text | Original French sentences | Word wrap enabled |
| Analysis Result | Full analysis output | Word wrap enabled |
| Classification | Parsed classification type | **Bold text with color coding** |
| Confidence | Extracted confidence percentage | Standard |
| Triggers | Identified trigger patterns | Standard |
| Analysis Mode | Current analysis mode | Word wrap enabled |

#### Color Coding by Classification:
- **🟢 Expletive Negation**: Light green background (#D4EDDA) with dark green text (#155724)
- **🔵 Training Enhanced**: Light blue background (#E3F2FD) with dark blue text (#0C5460)  
- **🟣 Pure Training**: Light purple background (#F3E5F5) with purple text (#6A1B9A)
- **🟡 Logical Negation**: Light yellow background (#FFF3CD) with dark yellow text (#856404)
- **⚪ No Negation**: White background with standard text

#### Professional Styling:
- **Header row**: Blue background (#4472C4) with white bold text
- **Data rows**: Alternating colors based on classification
- **Borders**: Thin borders around all cells
- **Column widths**: Auto-sized for optimal readability
- **Text wrapping**: Enabled for long content

### Sheet 2: "Summary Statistics"
**Comprehensive analysis overview**

#### Metadata Section:
- Generation timestamp
- Analysis mode used
- Total sentence count

#### Classification Breakdown:
- Count of each classification type
- Percentage distribution
- Visual formatting with merged cells

#### Confidence Analysis:
- High confidence count (≥80%)
- Medium confidence count (60-79%)
- Low confidence count (<60%)

#### Trigger Analysis:
- Sentences with triggers count
- Most common trigger pattern
- Trigger frequency distribution

### Sheet 3: "Training Data" (if available)
**Training data analysis and examples**

#### Training Overview:
- Total training examples
- Training data statistics
- Classification distribution

#### Sample Training Examples:
- First 10 training examples
- Text and classification pairs
- Formatted for easy review

## 🎨 Visual Features

### Professional Formatting:
- **Corporate color scheme** with blue headers
- **Consistent styling** across all sheets
- **Proper spacing** and alignment
- **Readable fonts** and sizing

### Data Visualization:
- **Color-coded classifications** for instant recognition
- **Bold highlighting** for important data
- **Merged cells** for section headers
- **Conditional formatting** based on content

### Research-Friendly Features:
- **Multiple sheets** for different data views
- **Complete metadata** for reproducibility
- **Statistical summaries** for analysis
- **Training data integration** when available

## 📈 Research Benefits

### Academic Use:
- **Citation-ready** with complete metadata
- **Statistical analysis** support with summary sheet
- **Visual presentation** suitable for papers
- **Professional formatting** for reports

### Data Analysis:
- **Structured data** in main results sheet
- **Summary statistics** for quick insights
- **Training data** integration for ML research
- **Color coding** for pattern recognition

### Collaboration:
- **Excel compatibility** for universal access
- **Multiple views** of the same data
- **Professional appearance** for sharing
- **Complete documentation** in single file

## 🔧 Technical Implementation

### File Generation:
- Uses SheetJS (xlsx) library for Excel generation
- Client-side processing (no server required)
- Automatic filename with timestamp
- Proper Excel formatting and styling

### Performance:
- Efficient data processing
- Minimal memory usage
- Fast download generation
- Compatible with all Excel versions

### Compatibility:
- Works with Microsoft Excel
- Compatible with Google Sheets
- Opens in LibreOffice Calc
- Supports Excel Online

This Excel format provides the most comprehensive and visually appealing way to export your French expletive negation analysis results, perfect for academic research, presentations, and detailed data analysis.
