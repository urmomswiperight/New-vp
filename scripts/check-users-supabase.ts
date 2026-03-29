import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const { data, error } = await supabase.from('user').select('id, email').limit(1)
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  console.log('Users found:', JSON.stringify(data, null, 2))
}

main()
