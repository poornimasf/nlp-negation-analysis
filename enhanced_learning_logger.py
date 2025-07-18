import json
import boto3
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import logging

class EnhancedLearningLogger:
    """
    Cost-effective learning logger that integrates with AWS knowledge base
    Uses SQS for async processing to minimize costs
    """
    
    def __init__(self, queue_url: str = None, region: str = 'us-east-2'):
        self.sqs = boto3.client('sqs', region_name=region)
        self.lambda_client = boto3.client('lambda', region_name=region)
        self.queue_url = queue_url or self._get_queue_url()
        self.logger = logging.getLogger(__name__)
        
    def _get_queue_url(self) -> str:
        """Get queue URL from CloudFormation exports or environment"""
        try:
            cf = boto3.client('cloudformation')
            exports = cf.list_exports()
            for export in exports['Exports']:
                if 'LearningQueueUrl' in export['Name']:
                    return export['Value']
        except Exception as e:
            self.logger.warning(f"Could not get queue URL from exports: {e}")
            return None
    
    def log_analysis_result(self, 
                          text: str, 
                          result: Dict[str, Any], 
                          user_feedback: Optional[Dict[str, Any]] = None,
                          language: str = 'en') -> bool:
        """
        Log analysis result for background learning
        Cost-effective: Uses SQS queue instead of direct DB writes
        """
        try:
            # Prepare learning data
            learning_data = {
                'type': 'pattern_analysis',
                'text': text,
                'language': language,
                'negation_detected': result.get('negation_detected', False),
                'confidence_score': result.get('confidence_score', 0.0),
                'pattern_type': result.get('pattern_type', 'general'),
                'timestamp': datetime.now().isoformat(),
                'analysis_id': str(uuid.uuid4())
            }
            
            # Queue for background processing
            self._queue_learning_data(learning_data)
            
            # If user feedback provided, queue that too
            if user_feedback:
                self.log_user_feedback(text, result, user_feedback)
                
            return True
            
        except Exception as e:
            self.logger.error(f"Error logging analysis result: {e}")
            return False
    
    def log_user_feedback(self, 
                         original_text: str, 
                         original_result: Dict[str, Any], 
                         user_correction: Dict[str, Any]) -> bool:
        """
        Log user feedback for model improvement
        """
        try:
            feedback_data = {
                'type': 'user_feedback',
                'text': original_text,
                'original_result': original_result,
                'user_correction': user_correction,
                'timestamp': datetime.now().isoformat(),
                'feedback_id': str(uuid.uuid4())
            }
            
            self._queue_learning_data(feedback_data)
            return True
            
        except Exception as e:
            self.logger.error(f"Error logging user feedback: {e}")
            return False
    
    def _queue_learning_data(self, data: Dict[str, Any]) -> bool:
        """
        Queue data for background processing
        Cost-effective: Async processing reduces Lambda costs
        """
        if not self.queue_url:
            self.logger.warning("No queue URL available, skipping background processing")
            return False
            
        try:
            response = self.sqs.send_message(
                QueueUrl=self.queue_url,
                MessageBody=json.dumps(data),
                MessageAttributes={
                    'Type': {
                        'StringValue': data['type'],
                        'DataType': 'String'
                    }
                }
            )
            
            self.logger.info(f"Queued learning data: {response['MessageId']}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error queuing learning data: {e}")
            return False
    
    def query_similar_patterns(self, 
                             text: str, 
                             language: str = 'en', 
                             min_confidence: float = 0.7) -> Optional[Dict[str, Any]]:
        """
        Query knowledge base for similar patterns
        Cost-effective: Direct Lambda invocation
        """
        try:
            payload = {
                'query_type': 'similar_patterns',
                'text': text,
                'language': language,
                'min_confidence': min_confidence
            }
            
            response = self.lambda_client.invoke(
                FunctionName='negation-knowledge-query',
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            
            result = json.loads(response['Payload'].read())
            if result['statusCode'] == 200:
                return json.loads(result['body'])
            else:
                self.logger.error(f"Knowledge query failed: {result}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error querying knowledge base: {e}")
            return None
    
    def get_learning_stats(self) -> Dict[str, Any]:
        """
        Get learning statistics from knowledge base
        """
        try:
            payload = {
                'query_type': 'learning_stats'
            }
            
            response = self.lambda_client.invoke(
                FunctionName='negation-knowledge-query',
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            
            result = json.loads(response['Payload'].read())
            if result['statusCode'] == 200:
                return json.loads(result['body'])
            else:
                return {'error': 'Could not retrieve stats'}
                
        except Exception as e:
            self.logger.error(f"Error getting learning stats: {e}")
            return {'error': str(e)}


# Cost-effective usage example
if __name__ == "__main__":
    logger = EnhancedLearningLogger()
    
    # Example usage
    sample_text = "I don't think this is not working"
    sample_result = {
        'negation_detected': True,
        'confidence_score': 0.85,
        'pattern_type': 'double_negation'
    }
    
    # Log for learning (queued for background processing)
    logger.log_analysis_result(sample_text, sample_result, language='en')
    
    # Query similar patterns
    similar = logger.query_similar_patterns(sample_text, language='en')
    print(f"Similar patterns: {similar}")
