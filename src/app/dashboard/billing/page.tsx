'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Clock, ExternalLink, AlertCircle, ShieldCheck, Zap } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Progress } from '@/components/ui/progress'

interface UsageStatus {
  allowed: boolean;
  usage: number;
  limit: number;
  daysLeft: number;
  status: string;
  message?: string;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [status, setStatus] = useState<'inactive' | 'pending_verification' | 'active' | 'error' | 'trialing'>('inactive')
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null)
  const [orderId, setOrderId] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch Subscription Status
        const { data: subData } = await supabase
          .from('Subscription')
          .select('status')
          .eq('userId', user.id)
          .single()

        if (subData) {
          setStatus(subData.status as any)
        }

        // Fetch Usage Status
        try {
          const res = await fetch('/api/billing/usage')
          if (res.ok) {
            const data = await res.json()
            setUsageStatus(data)
            if (data.status === 'trialing' && (!subData || subData.status === 'inactive')) {
              setStatus('trialing')
            }
          }
        } catch (err) {
          console.error('Error fetching usage:', err)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleGumroadCheckout = (productId: string) => {
    if (!user) return
    // Append user_id for webhook attribution
    const gumroadUrl = `https://robelseife.gumroad.com/l/${productId}?url_params[user_id]=${user.id}`
    window.open(gumroadUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const fiverrGigUrl = process.env.NEXT_PUBLIC_FIVERR_GIG_URL || '#'
  const isTrial = status === 'trialing' || status === 'inactive'

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your plan and track your usage.</p>
        </div>
        
        {status === 'active' && (
          <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-green-500/20">
            <ShieldCheck className="h-4 w-4" /> Professional Plan Active
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Summary</CardTitle>
              <CardDescription>Current period tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usageStatus && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium">Credits Used</span>
                    <span className="text-2xl font-bold">{usageStatus.usage} <span className="text-sm text-muted-foreground font-normal">/ {usageStatus.limit === Infinity ? '∞' : usageStatus.limit}</span></span>
                  </div>
                  <Progress value={usageStatus.limit === Infinity ? 0 : (usageStatus.usage / usageStatus.limit) * 100} className="h-2" />
                  
                  {usageStatus.status === 'trialing' && (
                    <div className="bg-primary/5 p-3 rounded-md flex items-center gap-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs font-bold text-primary">{usageStatus.daysLeft} Days Remaining</p>
                        <p className="text-[10px] text-muted-foreground text-nowrap">Your 7-day free trial is active.</p>
                      </div>
                    </div>
                  )}

                  {usageStatus.status === 'expired' || usageStatus.status === 'limit_reached' ? (
                    <div className="bg-destructive/10 p-3 rounded-md flex items-center gap-3 border border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-xs font-bold text-destructive">{usageStatus.message}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <div className="space-y-1 mt-3">
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{user?.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <div className="lg:col-span-2 space-y-6">
          {status === 'pending_verification' && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
              <CardHeader>
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-6 w-6" />
                  <CardTitle>Payment Pending Verification</CardTitle>
                </div>
                <CardDescription>
                  We&apos;ve received your Order ID. Verification usually takes 1-12 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Once verified, your account will be automatically activated.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            <Card className={status === 'active' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Professional Plan
                  {status === 'active' && <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">CURRENT PLAN</span>}
                </CardTitle>
                <CardDescription>
                  Complete outreach automation for high-growth teams.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$500</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">5,000 Monthly Outreach Leads</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">Email & LinkedIn Automation</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">AI Meeting Research Battle Cards</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">Competitor Intelligence Engine</p>
                  </div>
                </div>
              </CardContent>
              {isTrial && (
                <CardFooter className="flex flex-col sm:flex-row gap-4 border-t pt-6 bg-muted/20">
                  <Button onClick={() => handleGumroadCheckout('Fullmarketing')} className="w-full sm:w-auto font-bold px-8">
                    Get Started Now
                  </Button>
                  <p className="text-xs text-muted-foreground sm:max-w-[200px]">
                    Instant activation via Gumroad (Card, PayPal, Apple Pay).
                  </p>
                </CardFooter>
              )}
            </Card>

            {isTrial && (
              <Card className="border-dashed border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Need a custom setup?</CardTitle>
                  <CardDescription>
                    Book a strategy call to audit your current stack and design your custom roadmap.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">1</div>
                        <p className="text-sm font-medium">1-on-1 Strategy Call</p>
                      </div>
                      <Button onClick={() => handleGumroadCheckout('Bookacall')} variant="outline" size="sm" className="w-full">
                        Book Your Call (Free)
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">2</div>
                        <p className="text-sm font-medium">Manual Verification</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For regions with payment restrictions, we support manual bank transfers after our call.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
