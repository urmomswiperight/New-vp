"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export type Lead = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  company: string | null
  region: string | null
  status: string
  metadata: any | null
  createdAt: string
}

export const columns: ColumnDef<Lead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorFn: (row) => `${row.firstName || ""} ${row.lastName || ""}`.trim() || "N/A",
    id: "name",
    header: "Name",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "metadata",
    header: "Details",
    cell: ({ row }) => {
      const metadata = row.getValue("metadata") as any
      if (!metadata) return <span className="text-muted-foreground text-xs italic">No extra data</span>
      
      const details = []
      if (metadata.position) details.push(metadata.position)
      if (metadata.city) details.push(metadata.city)
      if (metadata.isRealEthiopian) details.push("✅")

      return (
        <div className="flex flex-col gap-0.5 max-w-[200px]">
          <span className="text-[11px] truncate font-medium">{details.join(" • ") || "No tags"}</span>
          {metadata.organizationDescription && (
            <span className="text-[10px] text-muted-foreground line-clamp-1 italic">
              {metadata.organizationDescription}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
      
      if (status === "New") variant = "default"
      if (status.includes("Contacted")) variant = "secondary"
      
      return (
        <Badge 
          variant={variant}
          className={
            status === "Contacted (Email)" ? "bg-blue-100 text-blue-800 border-blue-200" :
            status === "Contacted (LinkedIn)" ? "bg-indigo-100 text-indigo-800 border-indigo-200" :
            ""
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
]
