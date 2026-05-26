const strip = require('strip-comments');
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

function processFolder(folderPath) {
  walkDir(folderPath, (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const stripped = strip(content);
      if (content !== stripped) {
        fs.writeFileSync(filePath, stripped, 'utf8');
        console.log('Stripped:', filePath);
      }
    } catch (e) {
      console.error('Error on', filePath, e);
    }
  });
}

processFolder(path.join(__dirname, 'src'));
processFolder(path.join(__dirname, '..', 'tevra-backend', 'src'));

