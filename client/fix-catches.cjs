const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace unused catch block variables with _ prefix
  content = content.replace(/catch \((err|error)\)/g, 'catch (_$1)');
  content = content.replace(/catch \((err|error): unknown\)/g, 'catch (_$1: unknown)');
  
  if (content !== original) {
    fs.writeFileSync(f, content);
  }
});
console.log("Fixed unused catch variables globally!");
