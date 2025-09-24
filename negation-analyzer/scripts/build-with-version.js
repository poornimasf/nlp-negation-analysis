const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get git commit hash
try {
  const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const buildTime = new Date().toISOString();
  
  // Create .env.production.local with build info
  const envContent = `REACT_APP_BUILD_HASH=${gitHash}
REACT_APP_BUILD_TIME=${buildTime}
`;
  
  fs.writeFileSync(path.join(__dirname, '../.env.production.local'), envContent);
  console.log(`Build version: ${gitHash} at ${buildTime}`);
} catch (error) {
  console.error('Could not get git hash:', error.message);
}
