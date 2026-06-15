import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    const content = fs.readFileSync(filepath, 'utf8');
    if (content.includes('indigo')) {
      const newContent = content.replace(/indigo/g, 'accent');
      fs.writeFileSync(filepath, newContent);
      console.log(`Updated ${filepath}`);
    }
  }
});
