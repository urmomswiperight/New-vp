import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getFullLead() {
  const { data, error } = await supabase
    .from('Lead')
    .select('*')
    .eq('status', 'Drafted')
    .limit(1)

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(JSON.stringify(data?.[0], null, 2))
}

getFullLead()
