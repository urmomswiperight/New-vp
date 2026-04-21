const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8')
  // Clean up the mess
  content = content.replace('postgres?sslmode=disable:Robelseife@1', 'postgres:Robelseife@1')
  // Add it properly at the end
  if (!content.includes('?sslmode=disable')) {
    content = content.replace('/postgres', '/postgres?sslmode=disable')
  }
  fs.writeFileSync(envPath, content)
  console.log('Fixed .env.local DATABASE_URL')
}
