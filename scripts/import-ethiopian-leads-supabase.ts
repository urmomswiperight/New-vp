import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const csvPath = path.join(process.cwd(), 'ETHIOPIAN_LEAD.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath)
    return
  }

  try {
    const { data: userData } = await supabase.from('User').select('id').limit(1).single()
    if (!userData) {
      console.log('No user found.')
      return
    }

    const userId = userData.id
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    const results = Papa.parse(csvContent, { header: true, skipEmptyLines: true })
    const rows = results.data as any[]

    console.log(`Parsed ${rows.length} rows from ETHIOPIAN_LEAD.csv`)

    const formattedLeads = []
    let count = 0

    for (const row of rows) {
      if (row.fullName && row.fullName.includes('Refer to the log')) continue
      
      const email = row.email || row.personal_email
      if (!email) continue

      const primaryEmail = email.split(',')[0].trim()
      if (!primaryEmail) continue

      formattedLeads.push({
        id: `et-${count++}-${Date.now()}`,
        userId: userId,
        email: primaryEmail,
        firstName: row.firstName || null,
        lastName: row.lastName || null,
        company: row.organizationName || null,
        linkedinUrl: row.linkedinUrl || null,
        region: 'Ethiopia',
        status: 'New',
        metadata: {
          position: row.position,
          city: row.city,
          organizationIndustry: row.organizationIndustry,
          source: 'ETHIOPIAN_LEAD.csv'
        },
        updatedAt: new Date().toISOString()
      })
    }

    console.log(`Inserting ${formattedLeads.length} Ethiopian leads...`)
    
    const batchSize = 50
    let totalInserted = 0
    for (let i = 0; i < formattedLeads.length; i += batchSize) {
      const batch = formattedLeads.slice(i, i + batchSize)
      const { data, error } = await supabase.from('Lead').insert(batch).select()
      if (error) {
        console.error(`Error in batch:`, error.message)
      } else {
        totalInserted += data?.length || 0
        console.log(`Inserted ${totalInserted} leads...`)
      }
    }

    console.log(`Done! Successfully imported ${totalInserted} Ethiopian leads.`)
  } catch (e: any) {
    console.error('Error:', e.message)
  }
}

main()
