import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Send, CheckCircle, Mail, Linkedin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { CampaignToggle } from "@/components/dashboard/campaign-toggle"
import { Badge } from "@/components/ui/badge"
import { SprintStats } from "@/components/dashboard/sprint-stats"
import { KillSwitch } from "@/components/dashboard/kill-switch"
import { FinalReport } from "@/components/dashboard/final-report"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  // Fetch real data
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalLeads, contactedLeads, todaySent, pendingLeads, repliedLeads, interestedLeads, activeCampaigns, campaigns, variantStats] = await Promise.all([
    prisma.lead.count({ where: { userId: user.id } }),
    prisma.lead.count({ 
      where: { 
        userId: user.id,
        status: { in: ['Contacted', 'Contacted (Email)', 'Contacted (LinkedIn)'] }
      } 
    }),
    prisma.lead.count({ 
      where: { 
        userId: user.id,
        status: { in: ['Contacted', 'Contacted (Email)', 'Contacted (LinkedIn)'] },
        updatedAt: { gte: today }
      } 
    }),
    prisma.lead.count({ 
      where: { 
        userId: user.id,
        status: 'New'
      } 
    }),
    prisma.lead.count({ 
      where: { 
        userId: user.id,
        status: 'Replied'
      } 
    }),
    prisma.lead.count({ 
      where: { 
        userId: user.id,
        status: { in: ['Interested', 'Meeting Booked'] }
      } 
    }),
    prisma.campaign.count({ where: { userId: user.id, status: 'Active' } }),
    prisma.campaign.findMany({ 
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.lead.groupBy({
      by: ['variant', 'status'],
      where: { userId: user.id },
      _count: true
    })
  ])

  const variants = {
    A: { sent: 0, replied: 0, interested: 0 },
    B: { sent: 0, replied: 0, interested: 0 }
  }

  variantStats.forEach(stat => {
    const v = stat.variant as 'A' | 'B'
    if (!v) return
    if (['Contacted', 'Contacted (Email)', 'Contacted (LinkedIn)'].includes(stat.status)) {
      variants[v].sent += stat._count
    } else if (stat.status === 'Replied') {
      variants[v].replied += stat._count
    } else if (['Interested', 'Meeting Booked'].includes(stat.status)) {
      variants[v].interested += stat._count
    }
  })

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads.toString(),
      icon: Users,
      description: "Leads imported to date",
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns.toString(),
      icon: Send,
      description: "Campaigns currently running",
    },
    {
      title: "Outreach Sent",
      value: contactedLeads.toString(),
      icon: CheckCircle,
      description: "Leads reached successfully",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {activeCampaigns > 0 && <KillSwitch />}
      </div>

      {contactedLeads >= 4800 && (
        <FinalReport stats={{
          totalLeads: totalLeads,
          contacted: contactedLeads,
          replied: repliedLeads,
          interested: interestedLeads,
          booked: 0, // Placeholder
          variants: variants
        }} />
      )}

      <SprintStats stats={{
        totalSent: contactedLeads,
        todaySent: todaySent,
        pending: pendingLeads,
        replied: repliedLeads,
        interested: interestedLeads,
        goal: 5000,
        variants: variants
      }} />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10 dark:opacity-20`} />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No campaigns created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign: any) => (
                <div key={campaign.id} className="relative flex items-center justify-between p-4 border rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md hover:border-blue-500/50">
                  <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-${campaign.type === 'Email' ? 'blue' : 'purple'}-500/10`} />
                  <div className="relative flex items-center space-x-4">
                    {campaign.type === 'Email' ? (
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                    ) : (
                      <div className="p-2 bg-purple-500/10 rounded-full">
                        <Linkedin className="h-5 w-5 text-purple-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {campaign.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CampaignToggle 
                    campaignId={campaign.id} 
                    initialStatus={campaign.status}
                    name={campaign.name}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
