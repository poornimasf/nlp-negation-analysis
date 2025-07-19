#!/bin/bash

echo "🚀 Deploying Enhanced Negation Analyzer Frontend"
echo "================================================"

# Build the React application
echo "📦 Building React application..."
cd negation-analyzer
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build files are ready in: negation-analyzer/build/"
    echo ""
    echo "🌐 Deployment Options:"
    echo ""
    echo "1. 📤 Upload to any static hosting service:"
    echo "   - Netlify: Drag & drop the 'build' folder"
    echo "   - Vercel: Connect your GitHub repo"
    echo "   - AWS S3: Upload build folder to S3 bucket"
    echo "   - GitHub Pages: Push build folder to gh-pages branch"
    echo ""
    echo "2. 🖥️  Test locally:"
    echo "   npx serve -s build"
    echo "   Then open: http://localhost:3000"
    echo ""
    echo "3. 🔗 Direct file access:"
    echo "   Open: negation-analyzer/build/index.html in browser"
    echo ""
    
    # Test local server
    echo "🧪 Starting local test server..."
    echo "Press Ctrl+C to stop the server"
    echo "Open http://localhost:3000 in your browser"
    echo ""
    
    npx serve -s build -p 3000
else
    echo "❌ Build failed!"
    exit 1
fi
