import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCounts() {
  const { data: allLeads, error } = await supabase
    .from('Lead')
    .select('status', { count: 'exact' })

  if (error) {
    console.error('Error fetching counts:', error.message)
    return
  }

  const counts: Record<string, number> = {}
  allLeads.forEach((l: any) => {
    counts[l.status] = (counts[l.status] || 0) + 1
  })

  console.log('--- Lead Counts by Status ---')
  console.log(JSON.stringify(counts, null, 2))
  console.log('Total Leads:', allLeads.length)
}

checkCounts()
