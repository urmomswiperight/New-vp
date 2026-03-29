import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function cleanMessage(msg: string, firstName: string, company: string): string {
  let cleaned = msg
    .replace(/\[Your Name\]/gi, 'Robel')
    .replace(/\[Name\]/gi, firstName)
    .replace(/\[Sitra's name\]/gi, firstName)
    .replace(/\[Lead Name\]/gi, firstName)
    .replace(/\[Company Name\]/gi, company)
    .replace(/\[Insert your name\]/gi, 'Robel')
    .replace(/\[Insert LinkedIn username\]/gi, 'Robel')
    .replace(/Best regards,.*/gi, '')
    .replace(/Sincerely,.*/gi, '')
    .replace(/Best regards/gi, '')
    .replace(/Sincerely/gi, '')
    .replace(/Hi \[,/g, `Hi ${firstName},`)
    .trim();
  
  // If it's still too long or has placeholders, give a fallback
  if (cleaned.includes('[') || cleaned.length > 300) {
    return `Hi ${firstName}, I saw your work at ${company}. We help Ethiopian founders scale outreach using AI—would love to connect!`;
  }
  return cleaned;
}

async function generateOutreach() {
  console.log('Fetching leads from Supabase for personalization...')
  
  const { data: leads, error } = await supabase
    .from('Lead')
    .select('*')
    .eq('region', 'Ethiopia')
    .eq('status', 'New')
    .limit(50)

  if (error || !leads) {
    console.error('Error fetching leads:', error?.message)
    return
  }

  console.log(`Generating personalized outreach for ${leads.length} leads using Ollama (TinyLlama)...`)

  for (const lead of leads) {
    console.log(`\nGenerating message for: ${lead.firstName} ${lead.lastName} (${lead.company})...`)
    const metadata = lead.metadata as any || {}
    const prompt = `
      Task: Write a 1-sentence LinkedIn connection request.
      Lead: ${lead.firstName} at ${lead.company}.
      Context: We help Ethiopian founders scale outreach using AI.
      Constraint: Max 150 characters. No placeholders. No "Best regards".
      Example: Hi ${lead.firstName}, I love what you're doing at ${lead.company}. We're helping local founders automate their sales with AI—would love to connect!
      Your Output (Only the message):
    `

    try {
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama:latest',
          prompt: prompt,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any
      const rawMessage = data.response.trim()
      const message = cleanMessage(rawMessage, lead.firstName || '', lead.company || '')

      console.log(`\n---------------------------------------------------------`)
      console.log(`Lead: ${lead.firstName} ${lead.lastName} (${lead.company})`)
      console.log(`Message: ${message}`)
      
      // Update the lead status so we don't process it again
      await supabase
        .from('Lead')
        .update({ status: 'Drafted', metadata: { ...metadata, draft: message } })
        .eq('id', lead.id)

    } catch (e: any) {
      console.error(`  Error generating message for ${lead.email}: ${e.message}`)
    }
  }
}

generateOutreach()
