import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fastPersonalize() {
  console.log('Fetching ALL remaining leads for Fast Personalization...')
  
  let hasMore = true
  let offset = 0
  const limit = 1000
  let totalProcessed = 0

  while (hasMore) {
    const { data: leads, error } = await supabase
      .from('Lead')
      .select('id, firstName, company')
      .eq('status', 'New')
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching leads:', error.message)
      break
    }

    if (!leads || leads.length === 0) {
      hasMore = false
      break
    }

    console.log(`Processing batch of ${leads.length} leads...`)

    const batchSize = 50
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize)
      const updates = batch.map(lead => {
        const name = lead.firstName || 'there'
        const company = lead.company || 'your company'
        const message = `Hi ${name}, I saw your work at ${company}. We help founders scale outreach using AI—would love to connect!`
        
        return supabase
          .from('Lead')
          .update({ 
            status: 'Drafted', 
            metadata: { draft: message, strategy: 'fast-template-v2' } 
          })
          .eq('id', lead.id)
      })

      await Promise.all(updates)
    }

    totalProcessed += leads.length
    console.log(`Processed ${totalProcessed} leads so far...`)
    
    // If we got fewer than the limit, we're done
    if (leads.length < limit) {
      hasMore = false
    } else {
      // Offset doesn't change because we're updating status away from 'New'
      // But if we didn't update status, we'd need offset += limit
    }
  }

  console.log(`Done! Total ${totalProcessed} leads were drafted.`)
}

fastPersonalize()
