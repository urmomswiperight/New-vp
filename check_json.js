const fs = require('fs');
const content = fs.readFileSync('n8n_email_workflow.json', 'utf8');
let insideString = false;
let escape = false;
let found = false;
for (let i = 0; i < content.length; i++) {
  let char = content[i];
  if (char === '"' && !escape) {
    insideString = !insideString;
  }
  if (char === '\\' && !escape) {
    escape = true;
  } else {
    escape = false;
  }
  if (insideString && (char === '\n' || char === '\r')) {
    console.log(`Literal newline (0x${char.charCodeAt(0).toString(16)}) found at index ${i}, around line ${content.substring(0, i).split('\n').length}`);
    found = true;
  }
}
if (!found) {
  console.log('No literal newlines found inside strings.');
}
