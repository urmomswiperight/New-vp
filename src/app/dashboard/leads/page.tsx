import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { ImportLeadsModal } from "@/components/leads/import-modal"

export default async function LeadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const leads = await prisma.lead.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Serialize dates for client components
  const serializedLeads = leads.map((lead: any) => ({
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and organize your outreach targets.
          </p>
        </div>
        <ImportLeadsModal />
      </div>
      <DataTable columns={columns} data={serializedLeads} />
    </div>
  )
}
