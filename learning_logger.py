import boto3
import json
import logging
from datetime import datetime
from typing import Dict, Any

class LearningLogger:
    def __init__(self):
        self.cloudwatch = boto3.client('cloudwatch')
        self.logs = boto3.client('logs')
        self.log_group = '/aws/negation-classifier/learning'
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('NegationLearner')
        
    def log_learning_event(self, event_type: str, data: Dict[str, Any]):
        """Log a learning event with metrics"""
        timestamp = datetime.utcnow()
        
        # Log to CloudWatch Logs
        try:
            self.logs.put_log_events(
                logGroupName=self.log_group,
                logStreamName=event_type,
                logEvents=[{
                    'timestamp': int(timestamp.timestamp() * 1000),
                    'message': json.dumps({
                        'event_type': event_type,
                        'timestamp': timestamp.isoformat(),
                        'data': data
                    })
                }]
            )
        except Exception as e:
            self.logger.error(f"Failed to log to CloudWatch: {str(e)}")
