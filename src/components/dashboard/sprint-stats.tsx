"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Users, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SprintStatsProps {
  stats: {
    totalSent: number
    todaySent?: number
    pending: number
    replied: number
    interested: number
    goal: number
    variants?: {
      A: { sent: number; replied: number; interested: number }
      B: { sent: number; replied: number; interested: number }
    }
  }
}

export function SprintStats({ stats }: SprintStatsProps) {
  const goalProgress = Math.min((stats.totalSent / 5000) * 100, 100)
  const interestRate = stats.totalSent > 0 
    ? ((stats.interested / stats.totalSent) * 100).toFixed(1) 
    : "0"

  const variantARate = stats.variants?.A.sent 
    ? ((stats.variants.A.interested / stats.variants.A.sent) * 100).toFixed(1)
    : "0"
  const variantBRate = stats.variants?.B.sent 
    ? ((stats.variants.B.interested / stats.variants.B.sent) * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent} / 5,000</div>
            <Progress value={goalProgress} className="h-2 mt-2" />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {goalProgress.toFixed(1)}% of 15-day goal
              </p>
              {stats.todaySent !== undefined && (
                <Badge variant="secondary" className="text-[10px]">
                  +{stats.todaySent} Today
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replied}</div>
            <p className="text-xs text-muted-foreground">
              Leads that responded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interestRate}%</div>
            <p className="text-xs text-muted-foreground">
              Leads showing interest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interested Leads</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interested}</div>
            <p className="text-xs text-muted-foreground">
              Potential $500/mo deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Queue</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Leads waiting for outreach
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.variants && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-blue-200 bg-blue-50/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-blue-700">Variant A: Feature-Focused</CardTitle>
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50">50/50 Split</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sent</p>
                  <p className="text-lg font-bold">{stats.variants.A.sent}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Replies</p>
                  <p className="text-lg font-bold">{stats.variants.A.replied}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Interest</p>
                  <p className="text-lg font-bold text-green-600">{variantARate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-purple-700">Variant B: Benefit-Focused</CardTitle>
                <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-200 bg-purple-50">50/50 Split</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sent</p>
                  <p className="text-lg font-bold">{stats.variants.B.sent}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Replies</p>
                  <p className="text-lg font-bold">{stats.variants.B.replied}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Interest</p>
                  <p className="text-lg font-bold text-green-600">{variantBRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
