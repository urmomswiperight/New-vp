const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const sessionPath = path.join(process.cwd(), 'LI_SESSION.json');

if (!fs.existsSync(sessionPath)) {
    console.error('LI_SESSION.json not found');
    process.exit(1);
}

const sessionContent = fs.readFileSync(sessionPath, 'utf8');
let envContent = fs.readFileSync(envPath, 'utf8');

// Escape single quotes in the session content for .env file
const escapedSession = sessionContent.replace(/'/g, "'\\''");

const liSessionRegex = /^LI_SESSION=.*$/m;
if (liSessionRegex.test(envContent)) {
    envContent = envContent.replace(liSessionRegex, `LI_SESSION='${escapedSession}'`);
} else {
    envContent += `\nLI_SESSION='${escapedSession}'\n`;
}

fs.writeFileSync(envPath, envContent);
console.log('✅ Successfully updated LI_SESSION in .env.local');
