import prisma from '../src/lib/prisma';

async function startCampaign() {
  const campaignId = '5b1228a2-41ea-4ca5-82a2-a8dd8f5876ac'; // Initial Outreach Sprint
  
  console.log(`Activating campaign: ${campaignId}`);
  
  try {
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'Active' }
    });
    
    console.log(`✅ Campaign ${campaign.name} is now ACTIVE.`);
    
    // In a real scenario, we'd fetch the webhook from env, 
    // but since I'm local, I'll try to trigger the n8n webhook directly if possible
    // or just let the n8n cron handle it if it's active.
    
    console.log('Campaign status updated. n8n will pick up "New" leads on its next run.');
  } catch (error) {
    console.error('Error activating campaign:', error);
  }
}

startCampaign();
