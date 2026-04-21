import prisma from '../src/lib/prisma';
import { runLinkedInFollowUp } from '../src/lib/linkedin/follow-up';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function dryRunTest() {
    console.log('🧪 Starting LinkedIn Automation Dry Run...');

    // 1. Check Ollama Configuration
    console.log('--- Phase 1: AI Config ---');
    console.log(`OLLAMA_URL: ${process.env.OLLAMA_URL || 'NOT SET'}`);
    console.log(`OLLAMA_MODEL: ${process.env.OLLAMA_MODEL || 'NOT SET'}`);
    
    // 2. Check Database for eligible leads
    console.log('--- Phase 2: Database Check ---');
    const totalLeads = await prisma.lead.count();
    const contactedLeads = await prisma.lead.count({ where: { status: 'Contacted (LinkedIn)' } });
    const repliedLeads = await prisma.lead.count({ where: { status: 'Replied' } });
    
    console.log(`Total Leads: ${totalLeads}`);
    console.log(`Contacted Leads: ${contactedLeads}`);
    console.log(`Replied Leads: ${repliedLeads}`);

    // 3. Simulate a Follow-Up Search
    console.log('--- Phase 3: Follow-Up Eligibility Test ---');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 3);

    const eligibleLeads = await prisma.lead.findMany({
        where: {
            status: { in: ['Contacted (LinkedIn)', 'Followed Up'] },
            followUpStep: 0,
            updatedAt: { lte: cutoffDate },
            sentiment: null 
        },
        take: 3
    });

    if (eligibleLeads.length > 0) {
        console.log(`✅ Found ${eligibleLeads.length} leads eligible for Step 1 follow-up.`);
        eligibleLeads.forEach(l => console.log(` - ${l.firstName} ${l.lastName} (${l.email})`));
    } else {
        console.log('ℹ️ No leads currently eligible for Step 1 follow-up (3 days delay).');
    }

    console.log('\n✅ Dry run complete. Everything looks healthy!');
}

dryRunTest().catch(console.error);
