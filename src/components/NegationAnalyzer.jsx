import React, { useState } from 'react';
import './NegationAnalyzer.css';

export default function NegationAnalyzer() {
  // State definitions
  const [inputText, setInputText] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [language, setLanguage] = useState("french");
  const [result, setResult] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [trainingStats, setTrainingStats] = useState({
    totalExamples: 0,
    withoutNe: 0,
    withNe: 0,
    lastUpdated: null
  });
  const [uploadError, setUploadError] = useState(null);
  const [learnedPatterns, setLearnedPatterns] = useState({
    french: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
    english: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
    mandarin: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } }
  });

  // Constants
  const TRIGGERS = {
    french: {
      en: ["craindre", "avoir peur que", "peur que", "redouter", "avant que", "regretter"],
      nonEn: ["commencer", "arrêter", "cesser", "décider", "oublier"],
    },
    english: {
      en: ["afraid", "fear", "regret", "prevent", "before"],
      nonEn: ["start", "stop", "decide", "quit"],
    },
    mandarin: {
      en: ["怕", "抱歉", "避免", "前"],
      nonEn: ["开始", "停止", "决定"],
    },
  };

  // Basic analysis functions
  const hasNegation = (text, lang) => {
    const patterns = {
      french: /\bne\b([^a-zA-Z]|\s|$)/i,
      english: /\bnot\b|\bnever\b|\bno\b|\bnobody\b/i,
      mandarin: /不|没|别/,
    };
    return patterns[lang].test(text);
  };

  const extractComplement = (text, trigger) => {
    const idx = text.indexOf(trigger);
    if (idx === -1) return "";
    const after = text.slice(idx + trigger.length);
    return after.split(/[.?!]/)[0];
  };

  const highlight = (text, lang) => {
    let output = text;
    const triggerList = [...TRIGGERS[lang].en, ...TRIGGERS[lang].nonEn];
    for (const trig of triggerList) {
      const re = new RegExp(`(${trig})`, "gi");
      output = output.replace(re, '<span class="highlight-yellow">$1</span>');
    }
    if (lang === "french") {
      output = output.replace(/\b(ne)\b/gi, '<span class="highlight-green">$1</span>');
    }
    return output;
  };

  const classifyNegation = (text, lang) => {
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
  };

  // Pattern extraction and analysis
  const extractPeurQuePatterns = (text) => {
    const patterns = {
      peurQue: [],
      expletiveNe: [],
      context: [],
      subjects: [],
      verbs: []
    };
    
    const peurQueRegex = /\b(?:\w+\s+){0,3}(?:avoir\s+)?peur\s+que\b[^.!?]*[.!?]/gi;
    const neRegex = /\bne\b(?!\s+(pas|plus|jamais|rien|personne|aucun|guère))[^.!?]*?(?=\b(soit|ait|fasse|vienne|parte|tombe|mange|dise|prenne|mette)\b)/gi;
    const subjectRegex = /\b(je|tu|il|elle|nous|vous|ils|elles)\b/gi;
    const verbRegex = /\b(soit|ait|fasse|vienne|parte|tombe|mange|dise|prenne|mette)\b/gi;

    let match;
    while ((match = peurQueRegex.exec(text)) !== null) {
      patterns.peurQue.push({
        full: match[0],
        context: text.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30)
      });
    }
    
    while ((match = neRegex.exec(text)) !== null) {
      patterns.expletiveNe.push({
        pattern: match[0],
        context: text.slice(Math.max(0, match.index - 20), match.index + match[0].length + 20)
      });
    }
    
    patterns.subjects = text.match(subjectRegex) || [];
    patterns.verbs = text.match(verbRegex) || [];
    
    return patterns;
  };

  const calculatePatternScore = (testPatterns, learnedPatterns) => {
    if (!learnedPatterns || learnedPatterns.length === 0) return 0;
    
    let score = 0;
    const weights = {
      subject: 0.3,
      verb: 0.3,
      construction: 0.4
    };

    const subjectMatch = testPatterns.subjects.some(subject =>
      learnedPatterns.some(p => p.subjects.includes(subject))
    );
    if (subjectMatch) score += weights.subject;

    const verbMatch = testPatterns.verbs.some(verb =>
      learnedPatterns.some(p => p.verbs.includes(verb))
    );
    if (verbMatch) score += weights.verb;

    const constructionMatch = testPatterns.peurQue.some(({ full }) =>
      learnedPatterns.some(p => 
        p.peurQue.some(learned => learned.full.includes(full))
      )
    );
    if (constructionMatch) score += weights.construction;

    return score;
  };

  // Enhanced classification with learning
  const enhancedClassifyNegation = (text, lang) => {
    const basicClassification = classifyNegation(text, lang);
    
    if (lang === 'french' && learnedPatterns.french) {
      const patterns = extractPeurQuePatterns(text);
      const stats = learnedPatterns.french;
      
      const withNeScore = calculatePatternScore(patterns, stats.withNe?.patterns || []);
      const withoutNeScore = calculatePatternScore(patterns, stats.withoutNe?.patterns || []);
      
      if (withNeScore > withoutNeScore && withNeScore > 0.6) {
        return "Expletive negation (high confidence from training data)";
      } else if (withoutNeScore > withNeScore && withoutNeScore > 0.6) {
        return "Logical negation (high confidence from training data)";
      } else if (patterns.expletiveNe.length > 0) {
        const hasLearnedPattern = patterns.subjects.some(subj => 
          patterns.verbs.some(verb => 
            stats.withNe?.statistics?.commonConstructions?.[`${subj} ${verb}`]
          )
        );
        
        if (hasLearnedPattern) {
          return "Likely expletive negation (based on learned patterns)";
        }
      }
    }

    return basicClassification;
  };

  // Event handlers
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const workbook = await import('xlsx').then(XLSX => XLSX.read(data, { type: 'array' }));
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = await import('xlsx').then(XLSX => XLSX.utils.sheet_to_json(worksheet));

      if (!validateTrainingData(jsonData)) {
        setUploadError("Invalid file format. Please ensure the file has at least two columns.");
        return;
      }

      processTrainingData(jsonData);
    } catch (error) {
      setUploadError(`Error processing file: ${error.message}`);
    }
  };

  // Training data processing
  const validateTrainingData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return Object.keys(data[0]).length >= 2;
  };

  const processTrainingData = (data) => {
    const newPatterns = {
      french: {
        withoutNe: { patterns: [], statistics: {} },
        withNe: { patterns: [], statistics: {} }
      }
    };

    const stats = {
      totalExamples: data.length,
      withoutNe: 0,
      withNe: 0,
      patterns: {
        subjectFrequency: {},
        verbFrequency: {},
        commonConstructions: {}
      },
      lastUpdated: new Date().toISOString()
    };

    const columns = Object.keys(data[0]);
    const firstColumn = columns[0];
    const secondColumn = columns[1];

    data.forEach(row => {
      const withoutNe = row[firstColumn];
      const withNe = row[secondColumn];

      if (withoutNe) {
        const patterns = extractPeurQuePatterns(withoutNe);
        newPatterns.french.withoutNe.patterns.push(patterns);
        updateStatistics(stats, patterns, 'withoutNe');
        stats.withoutNe++;
      }

      if (withNe) {
        const patterns = extractPeurQuePatterns(withNe);
        newPatterns.french.withNe.patterns.push(patterns);
        updateStatistics(stats, patterns, 'withNe');
        stats.withNe++;
      }
    });

    setLearnedPatterns(prevPatterns => ({
      ...prevPatterns,
      french: {
        withoutNe: {
          patterns: [...(prevPatterns.french.withoutNe?.patterns || []), ...newPatterns.french.withoutNe.patterns],
          statistics: mergeStatistics(prevPatterns.french.withoutNe?.statistics, stats.patterns)
        },
        withNe: {
          patterns: [...(prevPatterns.french.withNe?.patterns || []), ...newPatterns.french.withNe.patterns],
          statistics: mergeStatistics(prevPatterns.french.withNe?.statistics, stats.patterns)
        }
      }
    }));

    setTrainingStats(stats);
    setTrainingData(prevData => [...prevData, ...data]);
  };

  const updateStatistics = (stats, patterns, type) => {
    patterns.subjects.forEach(subject => {
      stats.patterns.subjectFrequency[subject] = (stats.patterns.subjectFrequency[subject] || 0) + 1;
    });

    patterns.verbs.forEach(verb => {
      stats.patterns.verbFrequency[verb] = (stats.patterns.verbFrequency[verb] || 0) + 1;
    });

    patterns.peurQue.forEach(({ full }) => {
      stats.patterns.commonConstructions[full] = (stats.patterns.commonConstructions[full] || 0) + 1;
    });
  };

  const mergeStatistics = (oldStats = {}, newStats = {}) => {
    const merged = { ...oldStats };
    Object.keys(newStats).forEach(key => {
      if (typeof newStats[key] === 'object') {
        merged[key] = { ...merged[key], ...newStats[key] };
      } else {
        merged[key] = (merged[key] || 0) + newStats[key];
      }
    });
    return merged;
  };

  // Render UI
  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Multilingual Expletive Negation Analyzer</h2>

        <div className="form-group">
          <label htmlFor="language-select">Select Language</label>
          <select 
            id="language-select"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="select"
          >
            <option value="french">🇫🇷 French</option>
            <option value="english">🇺🇸 English</option>
            <option value="mandarin">🇨🇳 Mandarin</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sentence-input">Enter Sentence:</label>
          <div className="input-group">
            <input
              id="sentence-input"
              type="text"
              placeholder="Type a sentence with a negation..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input"
            />
            <button onClick={handleAnalyze} className="button">
              Evaluate
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section">
            <h3>Classification Result:</h3>
            <p>{result}</p>
            <h3>Highlighted Sentence:</h3>
            <p dangerouslySetInnerHTML={{ __html: highlightedText }}></p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="title">Batch Evaluation</h3>
        <div className="form-group">
          <label htmlFor="batch-input">Enter Sentences (one per line)</label>
          <textarea
            id="batch-input"
            rows={6}
            placeholder="One sentence per line..."
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            className="textarea"
          />
          <button onClick={handleBatchAnalyze} className="button">
            Evaluate Batch
          </button>
        </div>

        {batchResults.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sentence</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {batchResults.map(({ id, text, label }) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{text}</td>
                  <td>{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 className="title">Training Data Management</h3>
        <div className="form-group">
          <label htmlFor="file-upload">Upload Training Data (Excel)</label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="input"
          />
          {uploadError && (
            <p className="error-message">{uploadError}</p>
          )}
        </div>

        {trainingStats.totalExamples > 0 && (
          <div className="stats-section">
            <h4>Training Data Statistics</h4>
            <ul>
              <li>Total examples: {trainingStats.totalExamples}</li>
              <li>Examples without &apos;ne&apos;: {trainingStats.withoutNe}</li>
              <li>Examples with &apos;ne&apos;: {trainingStats.withNe}</li>
              <li>Last updated: {new Date(trainingStats.lastUpdated).toLocaleString()}</li>
            </ul>
          </div>
        )}

        {learnedPatterns.french && (
          <div className="stats-section">
            <h4>Learned Patterns - French</h4>
            <div>
              <p>Patterns without &apos;ne&apos;: {learnedPatterns.french.withoutNe?.patterns?.length || 0}</p>
              <p>Patterns with &apos;ne&apos;: {learnedPatterns.french.withNe?.patterns?.length || 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
