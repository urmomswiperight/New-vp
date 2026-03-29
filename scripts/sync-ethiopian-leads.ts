import fs from 'fs';
import path from 'path';
import pkg from 'papaparse';
const { parse } = pkg;
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client({ 
  connectionString: process.env.DATABASE_URL?.replace('localhost', '127.0.0.1') 
});

const userId = 'default-user-id';

async function main() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Syncing Ethiopian leads...');

    const csvPath = path.join(process.cwd(), 'ETHIOPIAN_LEAD.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const results = parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    console.log(`Parsed ${results.data.length} rows from CSV.`);

    let updatedCount = 0;
    let newCount = 0;

    for (const row of results.data as any[]) {
      const emailRaw = row.email || row.personal_email;
      if (!emailRaw) continue;

      const email = emailRaw.split(',')[0].trim();
      if (!email) continue;

      const metadata = {
        position: row.position,
        city: row.city,
        organizationName: row.organizationName,
        source: 'ETHIOPIAN_LEAD.csv'
      };

      // Check if lead exists by email
      const existing = await client.query('SELECT id FROM "Lead" WHERE email = $1 AND "userId" = $2', [email, userId]);
      
      if (existing.rows.length > 0) {
        // Update
        await client.query(
          `UPDATE "Lead" SET 
            "firstName" = $1, 
            "lastName" = $2, 
            company = $3, 
            "linkedinUrl" = $4, 
            region = $5,
            metadata = $6,
            "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = $7`,
          [
            row.firstName || null,
            row.lastName || null,
            row.organizationName || null,
            row.linkedinUrl || null,
            'Ethiopia',
            JSON.stringify(metadata),
            existing.rows[0].id
          ]
        );
        updatedCount++;
      } else {
        // Insert
        await client.query(
          `INSERT INTO "Lead" (id, "userId", email, "firstName", "lastName", company, "linkedinUrl", region, status, metadata, "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
          [
            `et-${Date.now()}-${newCount}`,
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
        newCount++;
      }
    }

    console.log(`Sync Complete: ${newCount} New, ${updatedCount} Updated.`);
  } catch (e: any) {
    console.error('fail:', e.message);
  } finally {
    await client.end();
  }
}

main();
