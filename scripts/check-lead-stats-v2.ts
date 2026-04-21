import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCounts() {
  console.log('--- Fetching Exact Status Counts ---')
  
  const statuses = ['New', 'Drafted', 'Contacted', 'Replied']
  const results: Record<string, number> = {}

  for (const status of statuses) {
    const { count, error } = await supabase
      .from('Lead')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (error) {
      console.error(`Error fetching count for ${status}:`, error.message)
    } else {
      results[status] = count || 0
    }
  }

  console.log(JSON.stringify(results, null, 2))
  
  const { count: total, error: totalError } = await supabase
    .from('Lead')
    .select('*', { count: 'exact', head: true })
  
  console.log('Total Leads in DB:', total)
}

checkCounts()
