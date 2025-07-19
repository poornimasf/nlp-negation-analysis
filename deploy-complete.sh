#!/bin/bash

# Enhanced Negation Analyzer - Complete Deployment Script
# Supports multiple deployment options

set -e

echo "🚀 Enhanced Negation Analyzer - Deployment Script"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_status "Node.js: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm: $(npm --version)"
    
    # Check AWS CLI (optional)
    if command -v aws &> /dev/null; then
        print_status "AWS CLI: $(aws --version)"
        AWS_AVAILABLE=true
    else
        print_warning "AWS CLI not available (optional for knowledge base)"
        AWS_AVAILABLE=false
    fi
    
    echo ""
}

# Build React application
build_frontend() {
    echo "📦 Building React Frontend..."
    cd negation-analyzer
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install
    fi
    
    # Build the application
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend build completed successfully!"
        cd ..
        return 0
    else
        print_error "Frontend build failed!"
        cd ..
        return 1
    fi
}

# Deploy Knowledge Base
deploy_knowledge_base() {
    if [ "$AWS_AVAILABLE" = false ]; then
        print_warning "AWS CLI not available, skipping knowledge base deployment"
        return 0
    fi
    
    echo "🧠 Deploying Knowledge Base Infrastructure..."
    
    # Check AWS credentials
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        print_error "AWS credentials not configured"
        print_info "Run: aws configure"
        return 1
    fi
    
    # Deploy CloudFormation stack
    ./deploy-knowledge-base.sh
    
    if [ $? -eq 0 ]; then
        print_status "Knowledge base deployed successfully!"
        return 0
    else
        print_error "Knowledge base deployment failed!"
        return 1
    fi
}

# Show deployment options
show_deployment_options() {
    echo ""
    echo "🌐 Frontend Deployment Options:"
    echo "==============================="
    echo ""
    echo "1. 🖥️  Local Testing:"
    echo "   cd negation-analyzer && npx serve -s build"
    echo "   Open: http://localhost:3000"
    echo ""
    echo "2. 📤 Static Hosting Services:"
    echo "   • Netlify: Drag & drop 'negation-analyzer/build' folder"
    echo "   • Vercel: Connect GitHub repo or upload build folder"
    echo "   • GitHub Pages: Push to gh-pages branch"
    echo "   • AWS S3: Upload to S3 bucket with static hosting"
    echo ""
    echo "3. ☁️  AWS Amplify:"
    echo "   cd negation-analyzer"
    echo "   amplify init"
    echo "   amplify add hosting"
    echo "   amplify publish"
    echo ""
    echo "4. 🐳 Docker Deployment:"
    echo "   docker build -t negation-analyzer ."
    echo "   docker run -p 3000:80 negation-analyzer"
    echo ""
}

# Create Docker configuration
create_docker_config() {
    echo "🐳 Creating Docker configuration..."
    
    cat > negation-analyzer/Dockerfile << 'EOF'
# Multi-stage build for React app
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if needed
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

    cat > negation-analyzer/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    cat > negation-analyzer/.dockerignore << 'EOF'
node_modules
npm-debug.log
build
.git
.gitignore
README.md
Dockerfile
.dockerignore
EOF

    print_status "Docker configuration created!"
}

# Main deployment function
main() {
    echo "Select deployment option:"
    echo "1. Frontend only (Quick)"
    echo "2. Frontend + Knowledge Base (Full)"
    echo "3. Create Docker configuration"
    echo "4. Show all deployment options"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo "🎯 Deploying Frontend Only..."
            check_prerequisites
            build_frontend
            show_deployment_options
            ;;
        2)
            echo "🎯 Full Deployment (Frontend + Knowledge Base)..."
            check_prerequisites
            build_frontend
            deploy_knowledge_base
            show_deployment_options
            ;;
        3)
            echo "🎯 Creating Docker Configuration..."
            create_docker_config
            print_info "Docker files created in negation-analyzer/"
            print_info "To build: docker build -t negation-analyzer negation-analyzer/"
            print_info "To run: docker run -p 3000:80 negation-analyzer"
            ;;
        4)
            show_deployment_options
            ;;
        *)
            print_error "Invalid choice. Please select 1-4."
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deployment process completed!"
    echo ""
    echo "📚 Additional Resources:"
    echo "• Frontend README: negation-analyzer/README.md"
    echo "• Cost Optimization: COST_OPTIMIZATION.md"
    echo "• System Documentation: README.md"
    echo ""
    echo "🆘 Need help? Check the troubleshooting section in README.md"
}

# Run main function
main
