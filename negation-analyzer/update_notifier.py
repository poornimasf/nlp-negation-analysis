import boto3
import json
from datetime import datetime
from typing import Dict, Any
from .model_versioning import ModelVersioning
from .learning_logger import LearningLogger

class UpdateNotifier:
    def __init__(self):
        self.sns = boto3.client('sns')
        self.topic_arn = self._create_or_get_topic()
        self.versioning = ModelVersioning()
        self.logger = LearningLogger()
        
    def _create_or_get_topic(self) -> str:
        """Create or get SNS topic for update notifications"""
        try:
            response = self.sns.create_topic(
                Name='negation-model-updates'
            )
            return response['TopicArn']
        except Exception as e:
            self.logger.log_error('SNS_TOPIC_ERROR', str(e))
            raise
            
    def notify_update(self, version_info: Dict[str, Any]):
        """Send notification about model update"""
        try:
            message = {
                'version': version_info['version'],
                'timestamp': version_info['timestamp'],
                'changes': version_info['changes'],
                'patterns_count': version_info['patterns_count'],
                'notification_time': datetime.utcnow().isoformat()
            }
            
            self.sns.publish(
                TopicArn=self.topic_arn,
                Message=json.dumps(message),
                Subject=f"Negation Model Updated to Version {version_info['version']}"
            )
