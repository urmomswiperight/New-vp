import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Fetching list of tables from Supabase...')
  
  try {
    const { data: userData, error: userError } = await supabase.from('User').select('id').limit(1)
    if (userError) {
      console.log('Error accessing "User" table:', userError.message)
    } else {
      console.log('Success! Table "User" found.')
    }

    const { data: leadData, error: leadError } = await supabase.from('Lead').select('id').limit(1)
    if (leadError) {
      console.log('Error accessing "Lead" table:', leadError.message)
    } else {
      console.log('Success! Table "Lead" found.')
    }
  } catch (e: any) {
    console.log('Unexpected Error:', e.message)
  }
}

main()
