import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Client } from 'pg';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const client = new Client({ connectionString: env.DATABASE_URL.replace('localhost', '127.0.0.1') });

const userId = 'default-user-id'; // As created in init-db-local.ts

async function main() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Reading CSV...');

    const csvPath = path.join(process.cwd(), 'ETHIOPIAN_LEAD.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    console.log(`Parsed ${results.data.length} rows.`);

    let importedCount = 0;
    for (const row of results.data as any[]) {
      // Skip the instruction row
      if (row.fullName && row.fullName.includes('Refer to the log')) continue;
      
      const email = row.email || row.personal_email;
      if (!email) continue;

      // Extract emails (might be a list)
      const emailList = email.split(',').map((e: string) => e.trim()).filter((e: string) => e.length > 0);
      const primaryEmail = emailList[0];

      if (!primaryEmail) continue;

      const metadata = {
        position: row.position,
        city: row.city,
        seniority: row.seniority,
        functional: row.functional,
        organizationDescription: row.organizationDescription,
        organizationSpecialities: row.organizationSpecialities,
        organizationIndustry: row.organizationIndustry,
        organizationSize: row.organizationSize,
        source: 'ETHIOPIAN_LEAD.csv'
      };

      try {
        await client.query(
          `INSERT INTO "Lead" (id, "userId", email, "firstName", "lastName", company, "linkedinUrl", region, status, metadata, "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO NOTHING`,
          [
            `et-${importedCount}-${Date.now()}`,
            userId,
            primaryEmail,
            row.firstName || null,
            row.lastName || null,
            row.organizationName || null,
            row.linkedinUrl || null,
            'Ethiopia',
            'New',
            JSON.stringify(metadata)
          ]
        );
        importedCount++;
      } catch (err: any) {
        console.error(`Error importing ${primaryEmail}:`, err.message);
      }
    }

    console.log(`Successfully imported ${importedCount} Ethiopian leads!`);
  } catch (e: any) {
    console.error('fail:', e.message);
  } finally {
    await client.end();
  }
}

main();