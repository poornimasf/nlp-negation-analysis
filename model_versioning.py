import boto3
from datetime import datetime
import json

class ModelVersioning:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table('NegationPatterns')
        self.sns = boto3.client('sns')
        
    def update_version(self, changes: dict) -> str:
        """Update model version with changelog"""
        timestamp = datetime.utcnow().isoformat()
        version = f"{datetime.utcnow().strftime('%Y.%m.%d')}.{self._get_daily_version()}"
        
        version_record = {
            'pattern_id': 'MODEL_VERSION',
            'trigger_type': 'METADATA',
            'version': version,
            'timestamp': timestamp,
            'changes': changes,
            'patterns_count': self._count_patterns()
        }
        
        self.table.put_item(Item=version_record)
        return version
