const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.css')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Palette mapping
    const replacements = {
        '#031926': '#134074',
        '#0d3349': '#13315C',
        '#010f17': '#0B2545',
        '#468189': '#8DA9C4',
        '#77ACA2': '#A5C0D8',
        '#9DBEBB': '#C5D8E8',
        '#EBF2FA': '#EEF4ED',
        
        // Gold
        '#d4a96a': '#D4AF37',
        '#efe3bb': '#F9F3DF',
        '#3a6e75': '#B5952F',
        '#2d5c63': '#967A26',
        
        // Minor text adjustments
        '#1e6570': '#13315C',
        '#3d5a67': '#13315C',
        '#5a7a8a': '#8DA9C4',
        
        // Login page specific gradients
        '#062c3d': '#13315C',
        '#0d4a5a': '#8DA9C4',
        
        // Splash screen gradients
        '#0a2540': '#134074',
        '#0d1b2a': '#0B2545',
        '#1a1a2e': '#0B2545',
        
        // RGBA values
        'rgba\\(70,\\s*129,\\s*137,': 'rgba(141, 169, 196,',
        'rgba\\(3,\\s*25,\\s*38,': 'rgba(19, 64, 116,',
        'rgba\\(157,\\s*190,\\s*187,': 'rgba(197, 216, 232,',
        'rgba\\(244,\\s*233,\\s*205,': 'rgba(212, 175, 55,'
    };

    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'gi');
        content = content.replace(regex, value);
    }
    
    // Also replace btn-primary with btn-gold in specific CTAs
    if (file.includes('HeroSection.jsx') || file.includes('FinalCTA.jsx')) {
        content = content.replace(/className="btn-primary"/g, 'className="btn-gold"');
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
