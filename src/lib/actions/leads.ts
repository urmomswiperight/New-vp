"use server"

import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { checkUsageLimit, incrementUsage } from "@/lib/usage"

export async function importLeadsAction(leads: Record<string, string>[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check usage limit
  const usageStatus = await checkUsageLimit(user.id)
  if (!usageStatus.allowed) {
    return { 
      success: false, 
      message: `Usage limit reached (${usageStatus.usage}/${usageStatus.limit}). Please upgrade to the Professional plan to continue.` 
    }
  }

  // Basic validation and formatting
  const formattedLeads = leads.map((lead) => ({
    userId: user.id,
    email: lead.email,
    firstName: lead.firstName || lead.first_name || null,
    lastName: lead.lastName || lead.last_name || null,
    company: lead.company || null,
    region: lead.region || null,
    variant: Math.random() > 0.5 ? "A" : "B",
    status: "New",
  }))

  // Filter out leads without email
  const validLeads = formattedLeads.filter((lead) => lead.email)

  if (validLeads.length === 0) {
    return { success: false, message: "No valid leads found in CSV" }
  }

  try {
    // Check usage count (Phase 2 Task 4)
    await prisma.user.findUnique({
      where: { id: user.id },
      select: { usage_count: true }
    })

    // For now, we'll allow it and increment usage
    // Real enforcement comes in Plan 04
    
    await prisma.lead.createMany({
      data: validLeads,
      skipDuplicates: true,
    })

    // Increment usage count
    await incrementUsage(user.id)

    revalidatePath("/dashboard/leads")
    return { success: true, count: validLeads.length }
  } catch (error) {
    console.error("Import error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Failed to import leads" }
  }
}
