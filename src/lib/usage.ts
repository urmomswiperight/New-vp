import prisma from "@/lib/prisma"

const USAGE_LIMIT = 5 // Max 5 uses for free trial
const TRIAL_DAYS = 7  // 7-day trial period

export async function checkUsageLimit(userId: string) {
  // 1. Admin bypass
  if (process.env.ADMIN_USER_ID && userId === process.env.ADMIN_USER_ID) {
    return { 
      allowed: true, 
      usage: 0, 
      limit: Infinity, 
      daysLeft: Infinity, 
      status: "admin" 
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: true
    }
  })

  if (!user) {
    return { 
      allowed: false, 
      usage: 0, 
      limit: USAGE_LIMIT, 
      daysLeft: 0, 
      status: "not_found",
      message: "User not found" 
    }
  }

  // 2. Check for active subscription
  // We include 'active' and 'trialing' (from Lemon Squeezy) as paid/full access
  const activeSubscription = user.subscriptions.find((sub: any) => 
    sub.status === 'active' || sub.status === 'trialing'
  )
  
  if (activeSubscription) {
    return { 
      allowed: true, 
      usage: user.usage_count, 
      limit: Infinity, 
      daysLeft: Infinity, 
      status: "active" 
    }
  }

  // 3. Trial Logic: usage < 5 AND days since signup < 7
  const now = new Date()
  const signupDate = new Date(user.createdAt)
  const diffTime = Math.abs(now.getTime() - signupDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, TRIAL_DAYS - diffDays)

  const usageAllowed = user.usage_count < USAGE_LIMIT
  const timeAllowed = diffDays < TRIAL_DAYS
  const allowed = usageAllowed && timeAllowed

  let status = "trialing"
  let message = "Trial active"

  if (!usageAllowed) {
    status = "limit_reached"
    message = "Usage limit reached (5 uses). Please upgrade to continue."
  } else if (!timeAllowed) {
    status = "expired"
    message = "Trial period expired (7 days). Please upgrade to continue."
  }

  // 4. Sprint Stats (Phase 6 Enhancement)
  const sprintUsage = await prisma.lead.count({
    where: { 
      userId,
      status: { in: ['Contacted', 'Contacted (Email)', 'Contacted (LinkedIn)'] }
    }
  })

  return {
    allowed,
    usage: user.usage_count,
    limit: USAGE_LIMIT,
    daysLeft,
    status,
    message,
    sprintUsage,
    sprintLimit: 5000
  }
}

export async function incrementUsage(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { usage_count: { increment: 1 } }
  })
}
