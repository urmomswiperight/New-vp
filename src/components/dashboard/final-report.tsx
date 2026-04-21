"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Users, MessageSquare, TrendingUp, AlertCircle, FileText } from "lucide-react"

interface FinalReportProps {
  stats: {
    totalLeads: number
    contacted: number
    replied: number
    interested: number
    booked: number
    variants: {
      A: { sent: number; replied: number; interested: number }
      B: { sent: number; replied: number; interested: number }
    }
  }
}

export function FinalReport({ stats }: FinalReportProps) {
  const replyRate = stats.contacted > 0 
    ? ((stats.replied / stats.contacted) * 100).toFixed(1) 
    : "0"
  
  const conversionRate = stats.contacted > 0 
    ? ((stats.interested / stats.contacted) * 100).toFixed(1) 
    : "0"

  const variantARate = stats.variants.A.sent 
    ? (stats.variants.A.interested / stats.variants.A.sent) 
    : 0
  const variantBRate = stats.variants.B.sent 
    ? (stats.variants.B.interested / stats.variants.B.sent) 
    : 0

  const winningVariant = variantARate >= variantBRate ? "A" : "B"
  const winPercent = ((Math.abs(variantARate - variantBRate)) * 100).toFixed(1)

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <CardTitle className="text-xl">Final Sprint Report</CardTitle>
              <CardDescription>Performance summary for the 5,000 lead campaign</CardDescription>
            </div>
          </div>
          <Badge variant="default" className="px-4 py-1">SPRINT COMPLETE</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Reach</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{stats.contacted}</p>
              <p className="text-xs text-muted-foreground">/ {stats.totalLeads}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Reply Rate</p>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              <p className="text-3xl font-bold">{replyRate}%</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qualified Leads</p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <p className="text-3xl font-bold">{stats.interested}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conv. Rate</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-3xl font-bold">{conversionRate}%</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              A/B Testing Insights
            </h4>
            <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Winner: Variant {winningVariant}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +{winPercent}% higher interest
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Variant {winningVariant} ({winningVariant === "A" ? "Feature-Focused" : "Benefit-Focused"}) outperformed its counterpart, 
                generating significantly more positive engagement from consulting agencies.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Next Strategic Actions
            </h4>
            <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
              <li>Scale outreach with Variant {winningVariant} copy globally.</li>
              <li>Follow up with {stats.interested} high-interest leads immediately.</li>
              <li>Analyze {stats.replied} replies to refine the objection handling prompt.</li>
              <li>Verify the first $500/mo subscription closure.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
