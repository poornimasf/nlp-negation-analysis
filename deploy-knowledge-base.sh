#!/bin/bash

# Cost-Effective Knowledge Base Deployment Script
# Deploys DynamoDB, Lambda, and SQS infrastructure

set -e

STACK_NAME="negation-analyzer-knowledge-base"
REGION="us-east-2"
TEMPLATE_FILE="infrastructure/knowledge-base-stack.yml"

echo "🚀 Deploying Knowledge Base Infrastructure..."
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "Template: $TEMPLATE_FILE"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Create infrastructure directory if it doesn't exist
mkdir -p infrastructure

# Deploy CloudFormation stack
echo "📦 Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file "$TEMPLATE_FILE" \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION" \
    --parameter-overrides \
        Environment=production

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Infrastructure deployed successfully!"
    
    # Get stack outputs
    echo "📋 Stack Outputs:"
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
    
    # Get resource costs estimate
    echo "💰 Estimated Monthly Costs:"
    echo "  - DynamoDB (Pay-per-request): ~$0.25 per million requests"
    echo "  - Lambda: ~$0.20 per million requests + $0.0000166667 per GB-second"
    echo "  - SQS: ~$0.40 per million requests"
    echo "  - Total estimated for moderate usage: $5-15/month"
    
    echo ""
    echo "🎉 Knowledge Base is ready!"
    echo "Next steps:"
    echo "1. Update your React app to use the enhanced components"
    echo "2. Deploy the enhanced Python modules to your backend"
    echo "3. Configure API Gateway endpoints (optional)"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Optional: Create API Gateway for REST endpoints
read -p "Do you want to create API Gateway endpoints? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Creating API Gateway..."
    
    # Create API Gateway (basic setup)
    API_ID=$(aws apigateway create-rest-api \
        --name "negation-analyzer-api" \
        --description "API for Enhanced Negation Analyzer" \
        --region "$REGION" \
        --query 'id' \
        --output text)
    
    echo "API Gateway created with ID: $API_ID"
    echo "You can configure endpoints manually in the AWS Console"
    echo "API Gateway URL will be: https://$API_ID.execute-api.$REGION.amazonaws.com/prod"
fi

echo ""
echo "🔧 Configuration Notes:"
echo "- All services are configured for cost optimization"
echo "- DynamoDB uses on-demand billing (pay only for what you use)"
echo "- Lambda functions have optimized memory settings"
echo "- SQS uses long polling to reduce costs"
echo "- Data retention is set to reasonable limits"

echo ""
echo "📊 Monitoring:"
echo "- Check CloudWatch for Lambda execution metrics"
echo "- Monitor DynamoDB consumed capacity"
echo "- Set up billing alerts in AWS Console"
