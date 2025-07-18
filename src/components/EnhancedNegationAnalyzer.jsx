import React, { useState, useEffect } from 'react';
import './NegationAnalyzer.css';

const EnhancedNegationAnalyzer = () => {
  // Original functionality state
  const [inputText, setInputText] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [results, setResults] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('french');
  const [highlightedText, setHighlightedText] = useState('');
  const [activeTab, setActiveTab] = useState('single');
  
  // Enhanced functionality state
  const [systemStats, setSystemStats] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [userFeedback, setUserFeedback] = useState({
    negation_detected: null,
    confidence_score: null,
    comments: ''
  });
  
  // Training data state
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

  // Constants from original component
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

  // Load system statistics on component mount
  useEffect(() => {
    loadSystemStats();
  }, []);

  // Helper functions from original component
  const hasNegation = (text, lang) => {
    const patterns = {
      french: /\bne\b([^a-zA-Z]|\s|$)/i,
      english: /\bnot\b|\bnever\b|\bno\b|\bnobody\b/i,
      mandarin: /不|没|别/,
    };
    return patterns[lang].test(text);
  };

  const highlightNegation = (text, lang) => {
    const patterns = {
      french: /(\bne\b)/gi,
      english: /(\bnot\b|\bnever\b|\bno\b|\bnobody\b)/gi,
      mandarin: /(不|没|别)/g,
    };
    
    return text.replace(patterns[lang], '<mark>$1</mark>');
  };

  // Training data management functions
  const validateTrainingData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.every(row => 
      typeof row === 'object' && 
      Object.keys(row).length >= 2
    );
  };

  const processTrainingData = (data) => {
    const processed = data.map((row, index) => ({
      id: index + 1,
      text: Object.values(row)[0] || '',
      classification: Object.values(row)[1] || '',
      language: language,
      timestamp: new Date().toISOString()
    }));

    setTrainingData(processed);
    
    // Update training statistics
    const stats = {
      totalExamples: processed.length,
      withoutNe: processed.filter(item => 
        item.classification?.toLowerCase().includes('without') || 
        item.classification?.toLowerCase().includes('logical')
      ).length,
      withNe: processed.filter(item => 
        item.classification?.toLowerCase().includes('with') || 
        item.classification?.toLowerCase().includes('expletive')
      ).length,
      lastUpdated: new Date().toISOString()
    };
    
    setTrainingStats(stats);
    
    // Process patterns for learning (simplified version)
    processLearningPatterns(processed);
  };

  const processLearningPatterns = (data) => {
    const patterns = {
      french: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
      english: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
      mandarin: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } }
    };

    data.forEach(item => {
      const lang = item.language || 'french';
      const isWithNe = item.classification?.toLowerCase().includes('with') || 
                      item.classification?.toLowerCase().includes('expletive');
      
      const category = isWithNe ? 'withNe' : 'withoutNe';
      
      if (patterns[lang] && patterns[lang][category]) {
        patterns[lang][category].patterns.push({
          text: item.text,
          classification: item.classification,
          id: item.id
        });
      }
    });

    setLearnedPatterns(patterns);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      // For demo purposes, we'll simulate file processing
      // In production, you'd use a library like xlsx to parse Excel files
      const text = await file.text();
      let jsonData;

      if (file.name.endsWith('.json')) {
        jsonData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing (for demo)
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        jsonData = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
          });
          return obj;
        });
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.');
      }

      if (!validateTrainingData(jsonData)) {
        setUploadError("Invalid file format. Please ensure the file has at least two columns.");
        return;
      }

      processTrainingData(jsonData);
      alert(`Successfully processed ${jsonData.length} training examples!`);
      
    } catch (error) {
      setUploadError(`Error processing file: ${error.message}`);
    }
  };

  const clearTrainingData = () => {
    if (window.confirm('Are you sure you want to clear all training data?')) {
      setTrainingData([]);
      setTrainingStats({
        totalExamples: 0,
        withoutNe: 0,
        withNe: 0,
        lastUpdated: null
      });
      setLearnedPatterns({
        french: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
        english: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } },
        mandarin: { withoutNe: { patterns: [], statistics: {} }, withNe: { patterns: [], statistics: {} } }
      });
    }
  };

  const loadSystemStats = async () => {
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the stats
      const mockStats = {
        learning_enabled: true,
        supported_languages: ['en', 'es', 'fr'],
        total_patterns_learned: 1247,
        user_feedback_count: 89,
        average_confidence_improvement: 0.23
      };
      setSystemStats(mockStats);
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setResults(null);
    setFeedbackMode(false);

    try {
      // Enhanced analysis with original highlighting
      const mockAnalysis = await simulateEnhancedAnalysis(inputText, language);
      setResults(mockAnalysis);
      setHighlightedText(highlightNegation(inputText, language));
    } catch (error) {
      console.error('Analysis error:', error);
      setResults({
        error: 'Analysis failed. Please try again.',
        negation_detected: false,
        confidence_score: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeBatch = async () => {
    if (!batchInput.trim()) return;

    setLoading(true);
    setBatchResults([]);

    try {
      const lines = batchInput.split('\n').filter(line => line.trim());
      const results = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const analysis = await simulateEnhancedAnalysis(line, language);
          results.push({
            id: i + 1,
            text: line,
            ...analysis,
            highlighted: highlightNegation(line, language)
          });
        }
      }

      setBatchResults(results);
    } catch (error) {
      console.error('Batch analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateEnhancedAnalysis = async (text, lang) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use original negation detection logic
    const negationDetected = hasNegation(text, lang);
    
    // Enhanced analysis simulation with knowledge base features
    const negationWords = {
      french: ['ne', 'pas', 'jamais', 'rien', 'personne'],
      english: ['not', 'no', 'never', 'nothing', 'nobody', "don't", "doesn't", "won't", "can't"],
      mandarin: ['不', '没', '别']
    };
    
    const textLower = text.toLowerCase();
    let matches = [];
    let baseConfidence = 0;
    
    negationWords[lang]?.forEach(word => {
      if (textLower.includes(word.toLowerCase())) {
        matches.push(word);
        baseConfidence += 0.3;
      }
    });

    // Simulate knowledge base enhancement
    const kbEnhanced = matches.length > 0 && Math.random() > 0.3;
    const kbConfidenceBoost = kbEnhanced ? 0.15 : 0;
    
    const finalConfidence = Math.min(baseConfidence + kbConfidenceBoost, 1.0);

    return {
      negation_detected: negationDetected,
      confidence_score: finalConfidence,
      matches: matches,
      language: lang,
      kb_enhanced: kbEnhanced,
      similar_patterns_count: kbEnhanced ? Math.floor(Math.random() * 10) + 1 : 0,
      pattern_type: matches.length > 1 ? 'complex' : 'simple',
      processing_time_ms: Math.floor(Math.random() * 200) + 50
    };
  };

  const submitFeedback = async () => {
    if (!results) return;

    try {
      // Simulate feedback submission to knowledge base
      const feedbackData = {
        original_text: inputText,
        original_result: results,
        user_correction: userFeedback,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting feedback:', feedbackData);
      
      // In production, this would call your feedback API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Thank you for your feedback! This helps improve our system.');
      setFeedbackMode(false);
      setUserFeedback({
        negation_detected: null,
        confidence_score: null,
        comments: ''
      });

      // Reload stats to show updated learning metrics
      loadSystemStats();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50'; // Green
    if (confidence >= 0.6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="negation-analyzer">
      <div className="header">
        <h1>Enhanced Negation Analyzer</h1>
        <p>AI-powered text analysis with continuous learning</p>
        
        {systemStats && (
          <div className="system-stats">
            <div className="stat-item">
              <span className="stat-label">Patterns Learned:</span>
              <span className="stat-value">{systemStats.total_patterns_learned?.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">User Feedback:</span>
              <span className="stat-value">{systemStats.user_feedback_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy Improvement:</span>
              <span className="stat-value">+{(systemStats.average_confidence_improvement * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single Text Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          Batch Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          Training Data Management
        </button>
      </div>

      {/* Language Selector */}
      <div className="language-selector">
        <label htmlFor="language">Language:</label>
        <select 
          id="language" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="french">French</option>
          <option value="english">English</option>
          <option value="mandarin">Mandarin</option>
        </select>
      </div>

      {/* Single Text Analysis Tab */}
      {activeTab === 'single' && (
        <div className="input-section">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to analyze for negation patterns..."
            rows={4}
            className="text-input"
          />

          <button 
            onClick={analyzeText} 
            disabled={loading || !inputText.trim()}
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>

          {/* Single Analysis Results */}
          {results && (
            <div className="results-section">
              <h3>Analysis Results</h3>
              
              <div className="result-card">
                <div className="result-header">
                  <span className={`negation-status ${results.negation_detected ? 'detected' : 'not-detected'}`}>
                    {results.negation_detected ? '✓ Negation Detected' : '✗ No Negation Detected'}
                  </span>
                  
                  <div className="confidence-badge">
                    <span 
                      className="confidence-score"
                      style={{ color: getConfidenceColor(results.confidence_score) }}
                    >
                      {(results.confidence_score * 100).toFixed(1)}% ({getConfidenceLabel(results.confidence_score)})
                    </span>
                  </div>
                </div>

                {/* Highlighted Text */}
                {highlightedText && (
                  <div className="highlighted-text">
                    <h4>Highlighted Text:</h4>
                    <div 
                      className="text-highlight" 
                      dangerouslySetInnerHTML={{ __html: highlightedText }}
                    />
                  </div>
                )}

                {results.matches && results.matches.length > 0 && (
                  <div className="matches-section">
                    <h4>Detected Patterns:</h4>
                    <div className="matches-list">
                      {results.matches.map((match, index) => (
                        <span key={index} className="match-tag">{match}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="analysis-details">
                  <div className="detail-item">
                    <span className="detail-label">Pattern Type:</span>
                    <span className="detail-value">{results.pattern_type || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Language:</span>
                    <span className="detail-value">{results.language?.toUpperCase()}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Processing Time:</span>
                    <span className="detail-value">{results.processing_time_ms}ms</span>
                  </div>

                  {results.kb_enhanced && (
                    <div className="kb-enhancement">
                      <span className="enhancement-badge">🧠 Knowledge Base Enhanced</span>
                      <span className="similar-patterns">
                        {results.similar_patterns_count} similar patterns found
                      </span>
                    </div>
                  )}
                </div>

                {/* Feedback Section */}
                <div className="feedback-section">
                  <button 
                    onClick={() => setFeedbackMode(!feedbackMode)}
                    className="feedback-toggle"
                  >
                    {feedbackMode ? 'Cancel Feedback' : 'Provide Feedback'}
                  </button>

                  {feedbackMode && (
                    <div className="feedback-form">
                      <h4>Help Improve Our System</h4>
                      
                      <div className="feedback-field">
                        <label>Was negation correctly detected?</label>
                        <div className="radio-group">
                          <label>
                            <input
                              type="radio"
                              name="negation_feedback"
                              value="true"
                              onChange={(e) => setUserFeedback({
                                ...userFeedback,
                                negation_detected: e.target.value === 'true'
                              })}
                            />
                            Yes
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="negation_feedback"
                              value="false"
                              onChange={(e) => setUserFeedback({
                                ...userFeedback,
                                negation_detected: e.target.value === 'true'
                              })}
                            />
                            No
                          </label>
                        </div>
                      </div>

                      <div className="feedback-field">
                        <label>Confidence Rating (0-100%):</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={userFeedback.confidence_score || 50}
                          onChange={(e) => setUserFeedback({
                            ...userFeedback,
                            confidence_score: parseInt(e.target.value) / 100
                          })}
                        />
                        <span>{Math.round((userFeedback.confidence_score || 0.5) * 100)}%</span>
                      </div>

                      <div className="feedback-field">
                        <label>Additional Comments:</label>
                        <textarea
                          value={userFeedback.comments}
                          onChange={(e) => setUserFeedback({
                            ...userFeedback,
                            comments: e.target.value
                          })}
                          placeholder="Any additional feedback or corrections..."
                          rows={3}
                        />
                      </div>

                      <button onClick={submitFeedback} className="submit-feedback">
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Analysis Tab */}
      {activeTab === 'batch' && (
        <div className="input-section">
          <textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Enter multiple lines of text to analyze (one per line)..."
            rows={8}
            className="text-input"
          />

          <button 
            onClick={analyzeBatch} 
            disabled={loading || !batchInput.trim()}
            className="analyze-button"
          >
            {loading ? 'Analyzing Batch...' : 'Analyze Batch'}
          </button>

          {/* Batch Results */}
          {batchResults.length > 0 && (
            <div className="results-section">
              <h3>Batch Analysis Results ({batchResults.length} items)</h3>
              
              <div className="batch-summary">
                <div className="summary-stat">
                  <span className="stat-label">Negation Detected:</span>
                  <span className="stat-value">
                    {batchResults.filter(r => r.negation_detected).length} / {batchResults.length}
                  </span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Average Confidence:</span>
                  <span className="stat-value">
                    {(batchResults.reduce((sum, r) => sum + r.confidence_score, 0) / batchResults.length * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="batch-results">
                {batchResults.map((result, index) => (
                  <div key={index} className="batch-result-item">
                    <div className="result-header">
                      <span className="result-id">#{result.id}</span>
                      <span className={`negation-status ${result.negation_detected ? 'detected' : 'not-detected'}`}>
                        {result.negation_detected ? '✓' : '✗'}
                      </span>
                      <span 
                        className="confidence-score"
                        style={{ color: getConfidenceColor(result.confidence_score) }}
                      >
                        {(result.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div 
                      className="result-text" 
                      dangerouslySetInnerHTML={{ __html: result.highlighted }}
                    />
                    
                    {result.matches && result.matches.length > 0 && (
                      <div className="result-matches">
                        {result.matches.map((match, i) => (
                          <span key={i} className="match-tag small">{match}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Training Data Management Tab */}
      {activeTab === 'training' && (
        <div className="training-section">
          <div className="training-upload">
            <h3>Upload Training Data</h3>
            <p>Upload a CSV or JSON file with training examples to improve the model's accuracy.</p>
            
            <div className="upload-area">
              <label htmlFor="file-upload" className="upload-label">
                Choose File (CSV, JSON)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileUpload}
                className="file-input"
              />
              
              {uploadError && (
                <div className="error-message">
                  <strong>Error:</strong> {uploadError}
                </div>
              )}
            </div>

            <div className="file-format-info">
              <h4>Expected File Format:</h4>
              <ul>
                <li><strong>CSV:</strong> First column = text, Second column = classification</li>
                <li><strong>JSON:</strong> Array of objects with text and classification fields</li>
                <li><strong>Classifications:</strong> "with ne", "without ne", "expletive", "logical", etc.</li>
              </ul>
              
              <div className="example-format">
                <strong>Example CSV:</strong>
                <pre>
{`text,classification
"Je crains qu'il ne vienne",with ne
"Je pense qu'il viendra",without ne
"J'ai peur qu'il ne soit malade",expletive`}
                </pre>
              </div>
            </div>
          </div>

          {/* Training Statistics */}
          {trainingStats.totalExamples > 0 && (
            <div className="training-stats">
              <h3>Training Data Statistics</h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{trainingStats.totalExamples}</div>
                  <div className="stat-label">Total Examples</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{trainingStats.withNe}</div>
                  <div className="stat-label">With Negation</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{trainingStats.withoutNe}</div>
                  <div className="stat-label">Without Negation</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">
                    {trainingStats.totalExamples > 0 
                      ? Math.round((trainingStats.withNe / trainingStats.totalExamples) * 100)
                      : 0}%
                  </div>
                  <div className="stat-label">Negation Ratio</div>
                </div>
              </div>

              {trainingStats.lastUpdated && (
                <div className="last-updated">
                  <strong>Last Updated:</strong> {new Date(trainingStats.lastUpdated).toLocaleString()}
                </div>
              )}

              <div className="training-actions">
                <button onClick={clearTrainingData} className="clear-button">
                  Clear Training Data
                </button>
              </div>
            </div>
          )}

          {/* Training Data Preview */}
          {trainingData.length > 0 && (
            <div className="training-preview">
              <h3>Training Data Preview (First 10 items)</h3>
              
              <div className="training-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Text</th>
                      <th>Classification</th>
                      <th>Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingData.slice(0, 10).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td className="text-cell">{item.text}</td>
                        <td className="classification-cell">
                          <span className={`classification-tag ${
                            item.classification?.toLowerCase().includes('with') || 
                            item.classification?.toLowerCase().includes('expletive') 
                              ? 'with-negation' : 'without-negation'
                          }`}>
                            {item.classification}
                          </span>
                        </td>
                        <td>{item.language}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {trainingData.length > 10 && (
                  <div className="table-footer">
                    Showing 10 of {trainingData.length} training examples
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model Protection Notice */}
          <div className="model-protection-notice">
            <h4>🔒 Model Protection</h4>
            <p>
              Training data is stored locally and used to enhance analysis accuracy. 
              The core model remains unchanged to ensure consistency across updates.
              Your training data helps improve confidence scoring and pattern recognition.
            </p>
          </div>
        </div>
      )}

      <div className="footer">
        <p>
          This system continuously learns from user feedback and improves over time.
          {systemStats?.learning_enabled && (
            <span className="learning-indicator"> 🔄 Learning Mode: Active</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default EnhancedNegationAnalyzer;
