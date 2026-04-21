import dotenv from 'dotenv'
import { execSync } from 'child_process'
dotenv.config({ path: '.env.local' })

const command = process.argv.slice(2).join(' ')
if (!command) {
  console.error('Please provide a command to run')
  process.exit(1)
}

try {
  execSync(command, { stdio: 'inherit', env: process.env })
} catch (error) {
  process.exit(1)
}
