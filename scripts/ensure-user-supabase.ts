import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const email = 'robel@example.com'
  console.log(`Ensuring user ${email} exists in Supabase...`)

  const { data, error } = await supabase
    .from('User')
    .upsert({ 
      id: 'default-user-id', 
      email: email,
      usage_count: 0,
      createdAt: new Date().toISOString()
    })
    .select()

  if (error) {
    console.error('Error ensuring user:', error.message)
  } else {
    console.log('User ensured successfully:', data[0].id)
  }
}

main()
