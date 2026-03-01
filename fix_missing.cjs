const fs = require('fs');
let text = fs.readFileSync('components/DocumentPreview.tsx', 'utf8');
const search = '  let p = 0;\n  let ap = 0;';
const replace = `  let p = 0;
  let currentP = 1;
  let ap = 0;

  const getPageNumStr = (id: string, forcedCount?: number) => {
     const count = forcedCount !== undefined ? forcedCount : (pageCounts[id] || 1);
     const startP = currentP;
     currentP += count;
     return startP;
  };`;

// Also check if CRLF
if (text.includes('  let p = 0;\r\n  let ap = 0;')) {
    text = text.replace('  let p = 0;\r\n  let ap = 0;', replace.replace(/\n/g, '\r\n'));
} else if (text.includes(search)) {
    text = text.replace(search, replace);
} else {
    console.log('Search string not found!');
}

fs.writeFileSync('components/DocumentPreview.tsx', text);
console.log('Done!');
