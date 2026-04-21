const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
const content = fs.readFileSync(envPath, 'utf8')
const lines = content.split(/\r?\n/)
const newLines = lines.map(line => {
  if (line.startsWith('DATABASE_URL=')) {
    return 'DATABASE_URL="postgresql://postgres:Robelseife@1@127.0.0.1:5433/postgres?sslmode=disable"'
  }
  return line
})
fs.writeFileSync(envPath, newLines.join('\n'))
console.log('Completely rewrote DATABASE_URL in .env.local')
