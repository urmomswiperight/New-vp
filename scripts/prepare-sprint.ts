import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Client } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const connectionString = process.env.DATABASE_URL?.replace('localhost', '127.0.0.1');
const client = new Client({ connectionString });

const userId = 'default-user-id';

async function main() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL.');

    // 1. Clear existing leads for a fresh sprint start (optional, but cleaner for the 15-day challenge)
    console.log('Cleaning up old leads for user...');
    await client.query('DELETE FROM "Lead" WHERE "userId" = $1', [userId]);

    // 2. Import Real Ethiopian Leads
    console.log('Importing real Ethiopian leads...');
    const etPath = path.join(process.cwd(), 'ETHIOPIAN_LEAD.csv');
    const etContent = fs.readFileSync(etPath, 'utf8');
    const etResults = Papa.parse(etContent, { header: true, skipEmptyLines: true });
    
    let etCount = 0;
    for (const row of etResults.data as any[]) {
      if (row.fullName && row.fullName.includes('Refer to the log')) continue;
      const email = (row.email || row.personal_email || '').split(',')[0].trim();
      if (!email) continue;

      const metadata = {
        position: row.position,
        city: row.city,
        seniority: row.seniority,
        organizationDescription: row.organizationDescription,
        organizationSpecialities: row.organizationSpecialities,
        isRealEthiopian: true,
        source: 'ETHIOPIAN_LEAD.csv'
      };

      await client.query(
        `INSERT INTO "Lead" (id, "userId", email, "firstName", "lastName", company, "linkedinUrl", region, status, metadata, "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          crypto.createHash('md5').update(email + userId).digest('hex'),
          userId,
          email,
          row.firstName || null,
          row.lastName || null,
          row.organizationName || null,
          row.linkedinUrl || null,
          'Ethiopia',
          'New',
          JSON.stringify(metadata)
        ]
      );
      etCount++;
    }
    console.log(`Imported ${etCount} real Ethiopian leads.`);

    // 3. Import International Leads from large CSV
    console.log('Importing international leads from large CSV...');
    const intlFileName = 'dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416 - dataset_lead-scraper-apollo-zoominfo-lusha_2025-11-16_20-52-35-416.csv';
    const intlPath = path.join(process.cwd(), intlFileName);
    const intlContent = fs.readFileSync(intlPath, 'utf8');
    const intlResults = Papa.parse(intlContent, { header: true, skipEmptyLines: true });
    
    const allLeads = intlResults.data as any[];
    console.log(`Found ${allLeads.length} leads in large CSV.`);

    // Shuffle leads
    for (let i = allLeads.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLeads[i], allLeads[j]] = [allLeads[j], allLeads[i]];
    }

    const targetTotal = 5000;
    const targetEthiopia = 3000;
    const targetInternational = 2000;

    let totalImported = etCount;
    let etTaggedCount = 0;
    let intlCount = 0;

    for (const lead of allLeads) {
      if (totalImported >= targetTotal) break;
      if (!lead.email) continue;

      const email = lead.email.trim();
      const id = crypto.createHash('md5').update(email + userId).digest('hex');

      // Check if already imported as real Ethiopian
      const exists = await client.query('SELECT 1 FROM "Lead" WHERE id = $1', [id]);
      if (exists.rows.length > 0) continue;

      let region = 'International';
      if (etCount + etTaggedCount < targetEthiopia) {
        region = 'Ethiopia';
        etTaggedCount++;
      } else if (intlCount < targetInternational) {
        region = 'International';
        intlCount++;
      } else {
        // Should not reach here if targetTotal is respected
        continue;
      }

      const names = (lead.fullName || '').split(' ');
      const firstName = names[0] || null;
      const lastName = names.slice(1).join(' ') || null;

      await client.query(
        `INSERT INTO "Lead" (id, "userId", email, "firstName", "lastName", company, "linkedinUrl", region, status, metadata, "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
        [
          id,
          userId,
          email,
          firstName,
          lastName,
          lead.orgName || null,
          lead.linkedinUrl || null,
          region,
          'New',
          JSON.stringify({ source: 'large-csv', originalRegion: lead.country })
        ]
      );
      totalImported++;
      if (totalImported % 100 === 0) console.log(`Imported ${totalImported} leads...`);
    }

    console.log('--- SPRINT PREPARATION COMPLETE ---');
    console.log(`Total Leads: ${totalImported}`);
    console.log(`Real Ethiopia: ${etCount}`);
    console.log(`Tagged Ethiopia: ${etTaggedCount}`);
    console.log(`International: ${intlCount}`);
    console.log('All leads set to "New" status.');

  } catch (e) {
    console.error('Preparation failed:', e.message);
  } finally {
    await client.end();
  }
}

main();