const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/alane/Documents/Broto/broto/src/routes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('animate-pulse')) {
    content = content.replace(/bg-surface-container/g, 'bg-surface-variant');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
