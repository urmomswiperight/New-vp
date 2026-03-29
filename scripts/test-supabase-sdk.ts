import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Initializing Supabase tables...')
  
  // The standard Supabase SDK can't push Prisma schemas, 
  // but we can at least try to run a dummy query to see if it's alive.
  const { data, error } = await supabase.from('User').select('*').limit(1)
  
  if (error) {
    console.log('Tables do not exist yet or connection failed:', error.message)
    console.log('ACTION REQUIRED: Go to Supabase SQL Editor and paste your schema or use the Supabase Dashboard to create tables.')
  } else {
    console.log('Connection successful!')
  }
}

main()
