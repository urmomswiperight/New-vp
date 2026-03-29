const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8')
  content = content.replace(':5433/', ':5432/')
  fs.writeFileSync(envPath, content)
  console.log('Updated .env.local to use port 5432')
} else {
  console.log('.env.local not found')
}
