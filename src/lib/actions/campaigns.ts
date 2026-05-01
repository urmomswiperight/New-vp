'use server'

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCampaigns() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  return await prisma.campaign.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCampaign(name: string, type: string = 'Email') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const campaign = await prisma.campaign.create({
    data: {
      name,
      type,
      userId: user.id,
      status: 'Paused'
    }
  })

  revalidatePath('/dashboard/campaigns')
  return campaign
}

export async function toggleCampaignStatus(campaignId: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active'

  const updatedCampaign = await prisma.campaign.update({
    where: { 
        id: campaignId,
        userId: user.id // Security check
    },
    data: { status: newStatus }
  })

  // If we just activated it, trigger the n8n webhook
  if (newStatus === 'Active') {
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      
      if (n8nWebhookUrl) {
        // Construct the full webhook URL if it's just the base
        const fullUrl = n8nWebhookUrl.endsWith('/') 
          ? `${n8nWebhookUrl}webhook/campaign-trigger` 
          : `${n8nWebhookUrl}/webhook/campaign-trigger`;

        await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'CAMPAIGN_START',
            campaignId: updatedCampaign.id,
            userId: user.id,
            campaignType: updatedCampaign.type
          })
        });
        console.log(`n8n Campaign Webhook triggered for ${updatedCampaign.name}`);
      }
    } catch (error) {
      console.error("Failed to trigger n8n from server action:", error)
    }
  }

  revalidatePath('/dashboard/campaigns')
  return updatedCampaign
}

export async function stopAllCampaigns() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const updated = await prisma.campaign.updateMany({
    where: { 
        userId: user.id,
        status: 'Active'
    },
    data: { status: 'Paused' }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/campaigns')
  return updated
}
