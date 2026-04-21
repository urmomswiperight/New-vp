const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8')
  if (!content.includes('sslmode=')) {
    content = content.replace('/postgres', '/postgres?sslmode=disable')
    fs.writeFileSync(envPath, content)
    console.log('Added sslmode=disable to .env.local')
  }
} else {
  console.log('.env.local not found')
}
