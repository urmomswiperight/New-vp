const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

const config = `
# Ollama
OLLAMA_URL="https://unrubrically-nonsilicious-euclid.ngrok-free.dev"
OLLAMA_MODEL="deepseek-v3.1:671b-cloud"
`;

if (!envContent.includes('OLLAMA_URL')) {
    envContent += config;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Added Ollama config to .env.local');
} else {
    console.log('ℹ️ Ollama config already exists');
}
