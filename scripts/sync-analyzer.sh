#!/bin/bash

# Sync NegationAnalyzer between production and development

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Syncing NegationAnalyzer files...${NC}"

# Paths
PROD_DIR="src/utils"
DEV_DIR="negation-analyzer/src/utils"
FILES=("NegationAnalyzer.js" "textProcessing.js")

# Check if we're in the right directory
if [ ! -d "$PROD_DIR" ] || [ ! -d "$DEV_DIR" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Sync files
for file in "${FILES[@]}"; do
    if [ -f "$PROD_DIR/$file" ]; then
        echo -e "${GREEN}Syncing $file to development...${NC}"
        cp "$PROD_DIR/$file" "$DEV_DIR/$file"
    elif [ -f "$DEV_DIR/$file" ]; then
        echo -e "${GREEN}Syncing $file to production...${NC}"
        cp "$DEV_DIR/$file" "$PROD_DIR/$file"
    else
        echo -e "${RED}Warning: $file not found in either location${NC}"
    fi
done

echo -e "${GREEN}Sync complete!${NC}"
