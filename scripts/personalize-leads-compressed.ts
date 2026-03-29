import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateOutreach() {
  console.log('Fetching leads for LOW-TOKEN personalization...')
  
  const { data: leads, error } = await supabase
    .from('Lead')
    .select('id, firstName, company, region, status, metadata')
    .eq('status', 'New')
    .limit(50)

  if (error || !leads) {
    console.error('Error fetching leads:', error?.message)
    return
  }

  console.log(`Processing ${leads.length} leads with Compressed Prompt (TinyLlama)...`)

  for (const lead of leads) {
    const metadata = lead.metadata as any || {}
    const prompt = `Write 1-sentence LinkedIn req.
Lead: ${lead.firstName} @ ${lead.company}
Context: AI outreach for founders.
Rule: <150 chars. No signatures.
Output:`

    try {
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama:latest',
          prompt: prompt,
          stream: false,
          options: {
            num_predict: 40,
            temperature: 0.5
          }
        })
      })

      if (!response.ok) throw new Error(`Ollama error: ${response.status}`)

      const data = await response.json() as any
      let message = data.response.trim().split('\n')[0];

      // Robust cleanup for TinyLlama chatter
      if (message.length > 250 || message.includes('[') || message.length < 20 || message.includes('Lead:')) {
        message = `Hi ${lead.firstName}, I saw your work at ${lead.company}. We help founders scale outreach using AI—would love to connect!`;
      }

      console.log(`[${lead.firstName} @ ${lead.company}]: ${message}`)
      
      await supabase
        .from('Lead')
        .update({ 
          status: 'Drafted', 
          metadata: { ...metadata, draft: message, model: 'tinyllama-compressed' } 
        })
        .eq('id', lead.id)

      // Small delay to let Ollama breathe
      await new Promise(r => setTimeout(r, 500))

    } catch (e: any) {
      console.error(`  Fail [${lead.id}]: ${e.message}`)
    }
  }
}

generateOutreach()
