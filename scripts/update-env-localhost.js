const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8')
  content = content.replace('127.0.0.1:5433', 'localhost:5433')
  fs.writeFileSync(envPath, content)
  console.log('Updated .env.local to use localhost:5433')
}
