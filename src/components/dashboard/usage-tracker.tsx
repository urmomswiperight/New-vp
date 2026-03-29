"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, AlertCircle } from "lucide-react"

interface UsageStatus {
  allowed: boolean;
  usage: number;
  limit: number;
  daysLeft: number;
  status: string;
  message?: string;
  sprintUsage?: number;
  sprintLimit?: number;
}

export function UsageTracker({ usageStatus }: { usageStatus: UsageStatus }) {
  const { usage, limit, daysLeft, status, sprintUsage, sprintLimit } = usageStatus
  
  // Hide for admin
  if (status === "admin") return null

  const percentage = Math.min((usage / limit) * 100, 100)
  const isExpired = status === "expired" || status === "limit_reached"
  const isPaid = status === "active"

  const sprintPercentage = sprintUsage && sprintLimit 
    ? Math.min((sprintUsage / sprintLimit) * 100, 100) 
    : 0

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg mx-2 my-4 border border-border/50">
      {!isPaid ? (
        <>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              {isExpired && <AlertCircle className="h-3 w-3 text-destructive" />}
              {status === "trialing" ? "Trial Status" : "Trial Expired"}
            </span>
            <span className="font-bold">{usage} / {limit} uses</span>
          </div>
          
          <Progress value={percentage} className={`h-1.5 ${isExpired ? "bg-destructive/20" : ""}`} />
          
          {status === "trialing" && (
            <p className="text-[10px] text-muted-foreground text-center">
              {daysLeft} days remaining in trial
            </p>
          )}

          {isExpired && (
            <p className="text-[10px] text-destructive text-center font-medium">
              Limit reached. Upgrade to continue.
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 mb-1">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">Pro Account</span>
        </div>
      )}

      {/* Sprint Progress Section */}
      {sprintUsage !== undefined && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-muted-foreground font-semibold">SPRINT GOAL</span>
            <span className="font-bold">{sprintUsage} / 5k leads</span>
          </div>
          <Progress value={sprintPercentage} className="h-1 bg-primary/10" />
        </div>
      )}

      {!isPaid && (
        <Button asChild variant={isExpired ? "default" : "secondary"} size="sm" className="w-full h-8 text-xs mt-1">
          <Link href="/dashboard/billing">
            <CreditCard className="mr-2 h-3 w-3" /> {isExpired ? "Upgrade Now" : "Go Pro"}
          </Link>
        </Button>
      )}
    </div>
  )
}
