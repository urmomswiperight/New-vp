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
  const csvFileName = 'dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416 - dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416.csv'
  const csvFilePath = path.join(process.cwd(), csvFileName)

  if (!fs.existsSync(csvFilePath)) {
    console.error('CSV file not found at:', csvFilePath)
    process.exit(1)
  }

  try {
    // Get the default user
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('id')
      .limit(1)
      .single()

    if (userError || !userData) {
      console.log('No user found. Please ensure a user exists in the "User" table.')
      return
    }

    const userId = userData.id
    console.log(`Importing leads for user ID: ${userId}`)

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    const results = Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
    })

    const leads = results.data as any[]
    console.log(`Found ${leads.length} lines in CSV.`)

    const formattedLeads = leads
      .filter((lead) => lead.email && lead.email.trim() !== '')
      .map((lead) => {
        const names = (lead.fullName || '').split(' ')
        const firstName = names[0] || null
        const lastName = names.slice(1).join(' ') || null

        return {
          userId: userId,
          email: lead.email.trim(),
          firstName,
          lastName,
          company: lead.orgName || null,
          linkedinUrl: lead.linkedinUrl || null,
          region: lead.country || null,
          status: 'New',
          updatedAt: new Date().toISOString()
        }
      })

    console.log(`Formatted ${formattedLeads.length} valid leads. Starting bulk insert...`)

    const batchSize = 50
    let totalInserted = 0

    for (let i = 0; i < formattedLeads.length; i += batchSize) {
      const batch = formattedLeads.slice(i, i + batchSize)
      // Add a unique ID to each lead since the table expects a primary key 'id'
      const batchWithIds = batch.map((lead, index) => ({
        id: `lead-${totalInserted + index}-${Date.now()}`,
        ...lead
      }))

      const { data, error } = await supabase
        .from('Lead')
        .insert(batchWithIds)
        .select()

      if (error) {
        console.error(`Error in batch ${i / batchSize + 1}:`, error.message)
      } else {
        totalInserted += data?.length || 0
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(formattedLeads.length / batchSize)} (${totalInserted} total)`)
      }
    }

    console.log(`Import completed! Total leads processed: ${totalInserted}`)
  } catch (error: any) {
    console.error('Unexpected error:', error.message)
  }
}

main()
