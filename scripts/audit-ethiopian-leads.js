const fs = require('fs');
const Papa = require('papaparse');

async function auditLeads() {
  const filePath = 'ETHIOPIAN_LEAD.csv';
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  const csvFile = fs.readFileSync(filePath, 'utf8');
  const results = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
  const leads = results.data;

  console.log(`\n--- DATA QUALITY AUDIT (ETHIOPIAN_LEAD.csv) ---`);
  console.log(`Total Leads in file: ${leads.length}`);

  let withEmail = 0;
  let withDesc = 0;
  let highQuality = 0;

  leads.forEach(l => {
    const hasEmail = l.email && l.email.trim().length > 0;
    const hasDesc = l.organizationDescription && l.organizationDescription.trim().length > 0;

    if (hasEmail) withEmail++;
    if (hasDesc) withDesc++;
    if (hasEmail && hasDesc) highQuality++;
  });

  console.log(`Leads with Email: ${withEmail}`);
  console.log(`Leads with Description: ${withDesc}`);
  console.log(`High Quality (Email + Desc): ${highQuality}`);
  
  if (highQuality > 0) {
    console.log(`✅ Ready for AI Personalization!`);
  } else {
    console.log(`⚠️ Warning: No leads have both email and description. Personalization will be generic.`);
  }
}

auditLeads();
