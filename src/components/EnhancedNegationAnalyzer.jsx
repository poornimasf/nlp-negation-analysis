import React, { useState, useEffect } from 'react';
import './NegationAnalyzer.css';

const EnhancedNegationAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [systemStats, setSystemStats] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [userFeedback, setUserFeedback] = useState({
    negation_detected: null,
    confidence_score: null,
    comments: ''
  });

  // Load system statistics on component mount
  useEffect(() => {
    loadSystemStats();
  }, []);

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
      // Simulate API call to enhanced negation system
      // In production, this would call your Lambda function or API Gateway
      const mockAnalysis = await simulateEnhancedAnalysis(inputText, language);
      setResults(mockAnalysis);
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

  const simulateEnhancedAnalysis = async (text, lang) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Enhanced analysis simulation with knowledge base features
    const negationWords = ['not', 'no', 'never', 'nothing', 'nobody', 'don\'t', 'doesn\'t', 'won\'t', 'can\'t'];
    const textLower = text.toLowerCase();
    
    let matches = [];
    let baseConfidence = 0;
    
    negationWords.forEach(word => {
      if (textLower.includes(word)) {
        matches.push(word);
        baseConfidence += 0.3;
      }
    });

    // Simulate knowledge base enhancement
    const kbEnhanced = matches.length > 0 && Math.random() > 0.3;
    const kbConfidenceBoost = kbEnhanced ? 0.15 : 0;
    
    const finalConfidence = Math.min(baseConfidence + kbConfidenceBoost, 1.0);

    return {
      negation_detected: matches.length > 0,
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

      <div className="input-section">
        <div className="language-selector">
          <label htmlFor="language">Language:</label>
          <select 
            id="language" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

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
      </div>

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
