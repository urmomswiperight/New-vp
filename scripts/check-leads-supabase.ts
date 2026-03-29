import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const { count, error } = await supabase.from('Lead').select('*', { count: 'exact', head: true })
  if (error) {
    console.error('Error fetching leads:', error)
    return
  }
  console.log('Total leads in Supabase:', count)

  const { data: statusStats, error: statusError } = await supabase.from('Lead').select('status')
  if (statusError) {
    console.error('Error fetching lead status:', statusError)
    return
  }
  const stats = statusStats.reduce((acc: any, lead: any) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {})
  console.log('Lead status in Supabase:', stats)
}

main()
