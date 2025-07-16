import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as XLSX from 'xlsx';

export default function NegationAnalyzer() {
  const [inputText, setInputText] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [language, setLanguage] = useState("french");
  const [result, setResult] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  
  // New state for training data
  const [trainingData, setTrainingData] = useState([]);
  const [trainingStats, setTrainingStats] = useState({
    totalExamples: 0,
    byLanguage: {},
    lastUpdated: null
  });
  const [uploadError, setUploadError] = useState(null);

  // Custom patterns learned from training data
  const [learnedPatterns, setLearnedPatterns] = useState({
    french: { logical: [], expletive: [] },
    english: { logical: [], expletive: [] },
    mandarin: { logical: [], expletive: [] }
  });

  // Add after the TRIGGERS constant
  
  // Function to handle Excel file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate data structure
        if (!validateTrainingData(jsonData)) {
          setUploadError("Invalid file format. Please ensure the file has 'language', 'logical negation', and 'expletive negation' columns.");
          return;
        }

        processTrainingData(jsonData);
      } catch (error) {
        setUploadError(`Error processing file: ${error.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  // Validate training data structure
  const validateTrainingData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    const requiredColumns = ['language', 'logical negation', 'expletive negation'];
    const firstRow = data[0];
    
    return requiredColumns.every(col => 
      Object.keys(firstRow).some(key => key.toLowerCase().includes(col.toLowerCase()))
    );
  };

  // Process and learn from training data
  const processTrainingData = useCallback((data) => {
    const newPatterns = {
      french: { logical: [], expletive: [] },
      english: { logical: [], expletive: [] },
      mandarin: { logical: [], expletive: [] }
    };

    const stats = {
      totalExamples: data.length,
      byLanguage: {},
      lastUpdated: new Date().toISOString()
    };

    // Process each training example
    data.forEach(row => {
      const lang = row.language.toLowerCase();
      const logical = row['logical negation'];
      const expletive = row['expletive negation'];

      // Update statistics
      stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;

      // Extract patterns
      if (logical && typeof logical === 'string') {
        const patterns = extractNegationPatterns(logical);
        newPatterns[lang].logical.push(...patterns);
      }

      if (expletive && typeof expletive === 'string') {
        const patterns = extractNegationPatterns(expletive);
        newPatterns[lang].expletive.push(...patterns);
      }
    });

    // Remove duplicates and update state
    Object.keys(newPatterns).forEach(lang => {
      newPatterns[lang].logical = [...new Set(newPatterns[lang].logical)];
      newPatterns[lang].expletive = [...new Set(newPatterns[lang].expletive)];
    });

    setLearnedPatterns(prevPatterns => ({
      french: {
        logical: [...new Set([...prevPatterns.french.logical, ...newPatterns.french.logical])],
        expletive: [...new Set([...prevPatterns.french.expletive, ...newPatterns.french.expletive])]
      },
      english: {
        logical: [...new Set([...prevPatterns.english.logical, ...newPatterns.english.logical])],
        expletive: [...new Set([...prevPatterns.english.expletive, ...newPatterns.english.expletive])]
      },
      mandarin: {
        logical: [...new Set([...prevPatterns.mandarin.logical, ...newPatterns.mandarin.logical])],
        expletive: [...new Set([...prevPatterns.mandarin.expletive, ...newPatterns.mandarin.expletive])]
      }
    }));

    setTrainingStats(stats);
    setTrainingData(prevData => [...prevData, ...data]);
  }, []);

  // Extract negation patterns from text
  const extractNegationPatterns = (text) => {
    const patterns = [];
    
    // Extract common negation patterns using regex
    const negationRegex = {
      french: /\b(ne\s+\w+|ne\s+\w+\s+pas|ne\s+pas\s+\w+)\b/gi,
      english: /\b(not|never|no|none|nothing|nowhere|nobody|neither|nor)\b/gi,
      mandarin: /(不|没|别)/g
    };

    Object.keys(negationRegex).forEach(lang => {
      let match;
      while ((match = negationRegex[lang].exec(text)) !== null) {
        patterns.push(match[0]);
      }
    });

    return patterns;
  };

  // Enhanced classification using learned patterns
  const enhancedClassifyNegation = (text, lang) => {
    const basicClassification = classifyNegation(text, lang);
    
    // If we have learned patterns, enhance the classification
    if (learnedPatterns[lang]) {
      const textLower = text.toLowerCase();
      
      // Check against learned patterns
      const matchesLogical = learnedPatterns[lang].logical.some(pattern => 
        textLower.includes(pattern.toLowerCase())
      );
      
      const matchesExpletive = learnedPatterns[lang].expletive.some(pattern => 
        textLower.includes(pattern.toLowerCase())
      );

      if (matchesExpletive && basicClassification.includes("logically consistent")) {
        return "Potential expletive negation (based on training data)";
      }
      
      if (matchesLogical && basicClassification.includes("expletive")) {
        return "Likely logical negation (based on training data)";
      }
    }

    return basicClassification;
  };

  function hasNegation(text, lang) {
    const patterns = {
      french: /\bne\b([^a-zA-Z]|\s|$)/i,
      english: /\bnot\b|\bnever\b|\bno\b|\bnobody\b/i,
      mandarin: /不|没|别/,
    };
    return patterns[lang].test(text);
  }

  function extractComplement(text, trigger) {
    const idx = text.indexOf(trigger);
    if (idx === -1) return "";
    const after = text.slice(idx + trigger.length);
    return after.split(/[.?!]/)[0];
  }

  function highlight(text, lang) {
    let output = text;
    const triggerList = [...TRIGGERS[lang].en, ...TRIGGERS[lang].nonEn];
    for (const trig of triggerList) {
      const re = new RegExp(`(${trig})`, "gi");
      output = output.replace(re, '<mark class="bg-yellow-100 text-yellow-900">$1</mark>');
    }
    if (lang === "french") {
      output = output.replace(/\b(ne)\b/gi, '<mark class="bg-green-100 text-green-900">$1</mark>');
    }
    return output;
  }

  function classifyNegation(text, lang) {
    const lowerText = text.toLowerCase();
    const enTrigger = TRIGGERS[lang].en.find(trigger => lowerText.includes(trigger));
    const nonEnTrigger = TRIGGERS[lang].nonEn.find(trigger => lowerText.includes(trigger));
    const negation = hasNegation(lowerText, lang);
    if (!negation) return "No negation detected.";

    const matchedTrigger = enTrigger || nonEnTrigger || "";
    const relevantClause = extractComplement(lowerText, matchedTrigger);
    const clauseHasNeg = hasNegation(relevantClause, lang);

    const isFullNegation = /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i.test(relevantClause);
    if (isFullNegation) return "Logically consistent negation. Not expletive.";

    if (!clauseHasNeg) return "Negation found, but not in the complement clause. No expletive negation.";

    if (/\bpeur que\b[^.?!]*\b(il|elle|je|tu|nous|vous|ils|elles)\b[^.?!]{0,10}\b(s'agisse|soit|ait|aille|vienne|tombe|manque)\b/i.test(lowerText) && !/\bne\b/i.test(relevantClause)) {
      return "EN-trigger + logically consistent negation";
    }

    if (enTrigger) {
      if (/\b(peur|craindre|redouter|regretter) que\b[^.?!]*\bne\b(?!\s+(pas|rien|jamais|plus|aucun))/i.test(lowerText)) {
        return "EN-trigger + expletive negation";
      }
      return "EN-trigger + logically consistent negation";
    } else if (nonEnTrigger) {
      return "Non-EN-trigger + logically inconsistent negation";
    } else {
      return "Trigger not clearly identified.";
    }
  }

  const handleAnalyze = () => {
    const classification = enhancedClassifyNegation(inputText, language);
    setResult(classification);
    setHighlightedText(highlight(inputText, language));
  };

  const handleBatchAnalyze = () => {
    const sentences = batchInput.split("\n").filter(Boolean);
    const results = sentences.map((sentence, index) => ({
      id: index + 1,
      text: sentence,
      label: enhancedClassifyNegation(sentence, language),
    }));
    setBatchResults(results);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 space-y-10">
      <Card className="bg-card shadow-xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Multilingual Expletive Negation Analyzer</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Select Language</label>
            <Select onValueChange={(val) => setLanguage(val)} defaultValue="french">
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="french">🇫🇷 French</SelectItem>
                <SelectItem value="english">🇺🇸 English</SelectItem>
                <SelectItem value="mandarin">🇨🇳 Mandarin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Enter Sentence:</label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a sentence with a negation..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAnalyze} className="bg-blue-600 hover:bg-blue-700 text-white">
                Evaluate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-muted shadow">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="font-semibold text-lg">Classification Result:</p>
              <p>{result}</p>
            </div>
            <div>
              <p className="font-semibold text-lg">Highlighted Sentence:</p>
              <p dangerouslySetInnerHTML={{ __html: highlightedText }}></p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-blue-800">Training Data Management</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Training Data (Excel)</label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full"
              />
              {uploadError && (
                <p className="text-red-500 text-sm mt-1">{uploadError}</p>
              )}
            </div>

            {trainingStats.totalExamples > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Training Data Statistics</h4>
                <ul className="space-y-1 text-sm">
                  <li>Total examples: {trainingStats.totalExamples}</li>
                  {Object.entries(trainingStats.byLanguage).map(([lang, count]) => (
                    <li key={lang}>{lang}: {count} examples</li>
                  ))}
                  <li>Last updated: {new Date(trainingStats.lastUpdated).toLocaleString()}</li>
                </ul>
              </div>
            )}

            {Object.keys(learnedPatterns).map(lang => (
              learnedPatterns[lang].logical.length > 0 || learnedPatterns[lang].expletive.length > 0 ? (
                <div key={lang} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Learned Patterns - {lang}</h4>
                  <div className="space-y-2 text-sm">
                    <p>Logical negation patterns: {learnedPatterns[lang].logical.length}</p>
                    <p>Expletive negation patterns: {learnedPatterns[lang].expletive.length}</p>
                  </div>
                </div>
              ) : null
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-blue-800">Batch Evaluation</h3>
          <label className="block text-sm font-medium mb-1">Enter Sentences (one per line)</label>
          <Textarea
            rows={6}
            placeholder="One sentence per line..."
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleBatchAnalyze}>Evaluate Batch</Button>
          {batchResults.length > 0 && (
            <table className="w-full mt-4 table-auto border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">#</th>
                  <th className="border px-3 py-2 text-left">Sentence</th>
                  <th className="border px-3 py-2 text-left">Classification</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map(({ id, text, label }) => (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{id}</td>
                    <td className="border px-3 py-2">{text}</td>
                    <td className="border px-3 py-2 italic text-gray-600">{label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
