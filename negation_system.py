from .model_versioning import ModelVersioning
from .pattern_validator import PatternValidator
from .learning_logger import LearningLogger
from .update_notifier import UpdateNotifier
from typing import Dict, Any

class NegationSystem:
    def __init__(self):
        self.validator = PatternValidator()
        self.logger = LearningLogger()
        self.versioning = ModelVersioning()
        self.notifier = UpdateNotifier()
        
    def process_text(self, text: str) -> Dict[str, Any]:
        """Process text while maintaining static UI behavior"""
        # Static classification logic
        result = self._classify_text(text)
        
        # Log the classification
        self.logger.log_learning_event('classification_result', {
            'text_length': len(text),
            'is_expletive': result['is_expletive'],
            'triggers_found': result['triggers']
        })
        
        return result
        
    def _classify_text(self, text: str) -> Dict[str, Any]:
        """Static classification method"""
        text = text.lower()
        triggers_found = [t for t in self.validator.known_triggers if t in text]
        has_ne = ' ne ' in f' {text} '
        has_subjunctive = any(v in text.split() for v in self.validator.known_subjunctives)
        
        return {
            'is_expletive': bool(triggers_found and has_ne and has_subjunctive),
            'triggers': triggers_found,
            'pattern': {
                'has_ne': has_ne,
                'has_subjunctive': has_subjunctive
            }
        }
        
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        try:
            current_version = self.versioning.get_version()
            return {
                'current_version': current_version,
                'system_healthy': True
            }
        except Exception as e:
            self.logger.log_error('STATUS_CHECK_ERROR', str(e))
            return {
                'system_healthy': False,
                'error': str(e)
            }
