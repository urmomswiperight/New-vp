import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import Imap from 'imap'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not defined')

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Common provider settings
const PROVIDER_SETTINGS: Record<string, any> = {
  'gmx.com': { smtpHost: 'mail.gmx.com', smtpPort: 587, imapHost: 'imap.gmx.com', imapPort: 993 },
  'gmx.us': { smtpHost: 'mail.gmx.com', smtpPort: 587, imapHost: 'imap.gmx.com', imapPort: 993 },
  'mailo.com': { smtpHost: 'mail.mailo.com', smtpPort: 587, imapHost: 'imap.mailo.com', imapPort: 993 },
  'netcourrier.com': { smtpHost: 'mail.mailo.com', smtpPort: 587, imapHost: 'imap.mailo.com', imapPort: 993 },
  'outlook.com': { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 },
  'hotmail.com': { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 },
  'office365.com': { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 },
  'yahoo.com': { smtpHost: 'smtp.mail.yahoo.com', smtpPort: 465, imapHost: 'imap.mail.yahoo.com', imapPort: 993 },
  'aol.com': { smtpHost: 'smtp.aol.com', smtpPort: 465, imapHost: 'imap.aol.com', imapPort: 993 },
}

async function verifySmtp(acc: any): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: acc.smtpHost,
    port: acc.smtpPort,
    secure: acc.smtpPort === 465,
    auth: { user: acc.email, pass: acc.smtpPassword },
    connectionTimeout: 5000,
  })
  try {
    await transporter.verify()
    return true
  } catch (e) {
    console.log(`❌ SMTP failed for ${acc.email}: ${e.message}`)
    return false
  }
}

async function verifyImap(acc: any): Promise<boolean> {
  return new Promise((resolve) => {
    const imap = new Imap({
      user: acc.email,
      password: acc.imapPassword,
      host: acc.imapHost,
      port: acc.imapPort,
      tls: true,
      authTimeout: 5000,
    })
    imap.once('ready', () => { imap.end(); resolve(true); })
    imap.once('error', (err) => { console.log(`❌ IMAP failed for ${acc.email}: ${err.message}`); resolve(false); })
    imap.connect()
  })
}

async function main() {
  const oldCsv = 'lead with email - Sheet3 (4).csv'
  const newCsv = 'new_senders.csv'
  const allAccounts: any[] = []

  // Get first user
  const user = await prisma.user.findFirst()
  if (!user) throw new Error('No user found')

  // Load Old CSV
  if (fs.existsSync(oldCsv)) {
    const content = fs.readFileSync(oldCsv, 'utf8')
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true }).data as any[]
    parsed.forEach(acc => {
      if (!acc.email) return
      allAccounts.push({
        email: acc.email.trim().toLowerCase(),
        smtpPassword: (acc['smtp password'] || acc.smtpPassword || '').trim(),
        imapPassword: (acc['imap password'] || acc.imapPassword || '').trim(),
        smtpHost: (acc['stmp server'] || acc.smtpHost || '').trim(),
        smtpPort: parseInt(acc['smtp port'] || acc.smtpPort) || 0,
        imapHost: (acc['imap serve'] || acc.imapHost || '').trim(),
        imapPort: parseInt(acc['imap port'] || acc.imapPort) || 0,
      })
    })
  }

  // Load New CSV
  if (fs.existsSync(newCsv)) {
    const content = fs.readFileSync(newCsv, 'utf8')
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true }).data as any[]
    parsed.forEach(acc => {
      if (!acc.email) return
      const email = acc.email.trim().toLowerCase()
      // Skip duplicates from old CSV
      if (allAccounts.find(a => a.email === email)) return
      
      allAccounts.push({
        email,
        smtpPassword: (acc['smtp password'] || acc.smtpPassword || '').trim(),
        imapPassword: (acc['imap password'] || acc.imapPassword || '').trim(),
        smtpHost: (acc.smtpHost || '').trim(),
        smtpPort: parseInt(acc.smtpPort) || 0,
        imapHost: (acc.imapHost || '').trim(),
        imapPort: parseInt(acc.imapPort) || 0,
      })
    })
  }

  console.log(`Processing ${allAccounts.length} unique accounts...`)

  const validAccounts: any[] = []

  for (const acc of allAccounts) {
    // Fill missing settings
    const domain = acc.email.split('@')[1]
    if (PROVIDER_SETTINGS[domain]) {
      const defaults = PROVIDER_SETTINGS[domain]
      if (!acc.smtpHost) acc.smtpHost = defaults.smtpHost
      if (!acc.smtpPort) acc.smtpPort = defaults.smtpPort
      if (!acc.imapHost) acc.imapHost = defaults.imapHost
      if (!acc.imapPort) acc.imapPort = defaults.imapPort
    }

    // Default IMAP password to SMTP if missing
    if (!acc.imapPassword) acc.imapPassword = acc.smtpPassword
    if (!acc.smtpPassword) acc.smtpPassword = acc.imapPassword

    if (!acc.smtpHost || !acc.smtpPort) {
        console.log(`⚠️ Missing settings for ${acc.email} (${domain}). Skipping...`)
        continue
    }

    console.log(`Testing ${acc.email}...`)
    const smtpOk = await verifySmtp(acc)
    const imapOk = smtpOk ? await verifyImap(acc) : false

    if (smtpOk && imapOk) {
      console.log(`✅ ${acc.email} is healthy!`)
      validAccounts.push(acc)
    }
  }

  console.log(`\nImporting ${validAccounts.length} valid accounts...`)

  // Delete all old ones first (clean slate as requested)
  await prisma.senderAccount.deleteMany({ where: { userId: user.id } })

  for (const acc of validAccounts) {
    await prisma.senderAccount.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        email: acc.email,
        smtpHost: acc.smtpHost,
        smtpPort: acc.smtpPort,
        smtpPassword: acc.smtpPassword,
        imapHost: acc.imapHost,
        imapPort: acc.imapPort,
        imapPassword: acc.imapPassword,
      }
    })
  }

  console.log('✅ Update complete.')
  await prisma.$disconnect()
}

main().catch(console.error)
