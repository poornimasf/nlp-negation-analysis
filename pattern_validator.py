from typing import Dict, Any, List, Tuple

class PatternValidator:
    def __init__(self):
        self.required_fields = ['trigger', 'ne_position', 'subjunctive_verb']
        self.known_triggers = {
            'peur que', 'craindre que', 'redouter que'
        }
        self.known_subjunctives = {
            'soit', 'ait', 'fasse', 'vienne', 'parte', 'tombe',
            'mange', 'dise', 'prenne', 'mette',
            "s'agisse", 'puisse', 'doive', 'sache', 'veuille', 'aille'
        }
        
    def validate_pattern(self, pattern: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate a pattern and return (is_valid, error_messages)"""
        errors = []
        
        # Check required fields
        for field in self.required_fields:
            if field not in pattern:
                errors.append(f"Missing required field: {field}")
                
        # Validate trigger
        if 'trigger' in pattern:
            if pattern['trigger'] not in self.known_triggers:
                errors.append(f"Unknown trigger: {pattern['trigger']}")
                
        return len(errors) == 0, errors
