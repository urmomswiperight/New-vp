import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Rocket, LogOut, LayoutDashboard, Users, Megaphone, CreditCard } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-zinc-950 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <Rocket className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold italic tracking-tight">AdminDek</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <a href="/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </a>
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Users className="w-4 h-4" />
            Leads
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Megaphone className="w-4 h-4" />
            Campaigns
          </Button>
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <a href="/billing">
              <CreditCard className="w-4 h-4" />
              Billing
            </a>
          </Button>
        </nav>

        <div className="mt-auto border-t pt-4 flex flex-col gap-4">
          <div className="px-2 py-1">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="destructive" className="w-full gap-2" type="submit">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Manage your AI marketing engine and track outreach.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Leads</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Campaigns</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Usage</h3>
            <p className="text-2xl font-bold">0 / 5</p>
          </div>
        </div>
      </main>
    </div>
  )
}
