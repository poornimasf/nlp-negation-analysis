import re
import json
from typing import Dict, List, Any, Optional, Tuple
from enhanced_learning_logger import EnhancedLearningLogger
import logging

class EnhancedNegationSystem:
    """
    Enhanced negation detection system with knowledge base integration
    Cost-effective: Uses cached patterns and background learning
    """
    
    def __init__(self, enable_learning: bool = True):
        self.enable_learning = enable_learning
        self.learning_logger = EnhancedLearningLogger() if enable_learning else None
        self.logger = logging.getLogger(__name__)
        
        # Base patterns (will be enhanced by knowledge base)
        self.negation_patterns = {
            'en': [
                r'\b(not|no|never|nothing|nobody|nowhere|neither|nor)\b',
                r'\b(don\'t|doesn\'t|didn\'t|won\'t|wouldn\'t|can\'t|couldn\'t|shouldn\'t|mustn\'t)\b',
                r'\b(isn\'t|aren\'t|wasn\'t|weren\'t|haven\'t|hasn\'t|hadn\'t)\b',
                r'\b(without|lacking|absent|missing)\b',
                r'\b(refuse|deny|reject|decline|avoid)\b'
            ],
            'es': [
                r'\b(no|nunca|nada|nadie|ningún|ninguna|ni)\b',
                r'\b(sin|carece|falta|ausente)\b'
            ],
            'fr': [
                r'\b(ne|non|jamais|rien|personne|aucun|aucune)\b',
                r'\b(sans|manque|absent)\b'
            ]
        }
        
        # Pattern weights (learned from knowledge base)
        self.pattern_weights = {}
        self._load_learned_patterns()
    
    def _load_learned_patterns(self):
        """
        Load learned patterns from knowledge base
        Cost-effective: Cache patterns to reduce Lambda calls
        """
        if not self.learning_logger:
            return
            
        try:
            # Query for high-confidence patterns
            for language in ['en', 'es', 'fr']:
                patterns = self.learning_logger.query_similar_patterns(
                    text="", 
                    language=language, 
                    min_confidence=0.8
                )
                
                if patterns:
                    self._integrate_learned_patterns(language, patterns)
                    
        except Exception as e:
            self.logger.warning(f"Could not load learned patterns: {e}")
    
    def _integrate_learned_patterns(self, language: str, patterns: List[Dict]):
        """
        Integrate learned patterns into detection system
        """
        for pattern_data in patterns:
            pattern_type = pattern_data.get('pattern_type', 'general')
            confidence = pattern_data.get('confidence_score', 0.5)
            
            # Weight patterns based on learned confidence
            if pattern_type not in self.pattern_weights:
                self.pattern_weights[pattern_type] = {}
            
            self.pattern_weights[pattern_type][language] = confidence
    
    def analyze_text(self, text: str, language: str = 'en') -> Dict[str, Any]:
        """
        Enhanced negation analysis with knowledge base integration
        """
        try:
            # Basic pattern matching
            base_result = self._basic_negation_detection(text, language)
            
            # Enhance with knowledge base insights
            enhanced_result = self._enhance_with_knowledge_base(text, base_result, language)
            
            # Log for continuous learning
            if self.enable_learning:
                self.learning_logger.log_analysis_result(
                    text=text,
                    result=enhanced_result,
                    language=language
                )
            
            return enhanced_result
            
        except Exception as e:
            self.logger.error(f"Error analyzing text: {e}")
            return {
                'negation_detected': False,
                'confidence_score': 0.0,
                'error': str(e)
            }
    
    def _basic_negation_detection(self, text: str, language: str) -> Dict[str, Any]:
        """
        Basic negation detection using predefined patterns
        """
        text_lower = text.lower()
        patterns = self.negation_patterns.get(language, self.negation_patterns['en'])
        
        matches = []
        total_confidence = 0.0
        
        for pattern in patterns:
            found_matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if found_matches:
                matches.extend(found_matches)
                # Base confidence per match
                total_confidence += len(found_matches) * 0.3
        
        # Detect double negations (reduce confidence)
        double_neg_pattern = r'\b(not|no|never)\s+\w*\s*(not|no|never)\b'
        double_negations = re.findall(double_neg_pattern, text_lower)
        if double_negations:
            total_confidence *= 0.7  # Reduce confidence for double negations
        
        # Normalize confidence
        confidence_score = min(total_confidence, 1.0)
        
        return {
            'negation_detected': len(matches) > 0,
            'confidence_score': confidence_score,
            'matches': matches,
            'pattern_type': 'double_negation' if double_negations else 'standard',
            'language': language
        }
    
    def _enhance_with_knowledge_base(self, text: str, base_result: Dict, language: str) -> Dict[str, Any]:
        """
        Enhance results using knowledge base patterns
        Cost-effective: Only query if base confidence is uncertain
        """
        confidence = base_result['confidence_score']
        
        # Only query knowledge base if confidence is uncertain (0.3-0.7 range)
        if 0.3 <= confidence <= 0.7 and self.learning_logger:
            try:
                similar_patterns = self.learning_logger.query_similar_patterns(
                    text=text,
                    language=language,
                    min_confidence=0.6
                )
                
                if similar_patterns:
                    # Adjust confidence based on similar patterns
                    kb_confidence = self._calculate_kb_confidence(similar_patterns)
                    
                    # Weighted average of base and knowledge base confidence
                    enhanced_confidence = (confidence * 0.6) + (kb_confidence * 0.4)
                    
                    base_result['confidence_score'] = enhanced_confidence
                    base_result['kb_enhanced'] = True
                    base_result['similar_patterns_count'] = len(similar_patterns)
                    
            except Exception as e:
                self.logger.warning(f"Knowledge base enhancement failed: {e}")
        
        return base_result
    
    def _calculate_kb_confidence(self, similar_patterns: List[Dict]) -> float:
        """
        Calculate confidence based on similar patterns from knowledge base
        """
        if not similar_patterns:
            return 0.0
        
        total_confidence = sum(p.get('confidence_score', 0.0) for p in similar_patterns)
        avg_confidence = total_confidence / len(similar_patterns)
        
        # Weight by number of similar patterns (more patterns = higher confidence)
        pattern_weight = min(len(similar_patterns) / 10.0, 1.0)
        
        return avg_confidence * pattern_weight
    
    def process_user_feedback(self, 
                            text: str, 
                            original_result: Dict[str, Any], 
                            user_correction: Dict[str, Any]) -> bool:
        """
        Process user feedback for continuous learning
        """
        if not self.learning_logger:
            return False
        
        return self.learning_logger.log_user_feedback(
            original_text=text,
            original_result=original_result,
            user_correction=user_correction
        )
    
    def get_system_stats(self) -> Dict[str, Any]:
        """
        Get system learning statistics
        """
        stats = {
            'learning_enabled': self.enable_learning,
            'supported_languages': list(self.negation_patterns.keys()),
            'pattern_weights': self.pattern_weights
        }
        
        if self.learning_logger:
            kb_stats = self.learning_logger.get_learning_stats()
            stats.update(kb_stats)
        
        return stats


# Cost-effective usage example
if __name__ == "__main__":
    # Initialize with learning enabled
    system = EnhancedNegationSystem(enable_learning=True)
    
    # Test cases
    test_cases = [
        "I don't think this is working",
        "This is absolutely not acceptable",
        "I never said I wouldn't do it",  # Double negation
        "The system works perfectly",      # No negation
        "No way this can be right"
    ]
    
    for text in test_cases:
        result = system.analyze_text(text)
        print(f"Text: {text}")
        print(f"Result: {result}")
        print("-" * 50)
    
    # Get system statistics
    stats = system.get_system_stats()
    print(f"System Stats: {json.dumps(stats, indent=2)}")
