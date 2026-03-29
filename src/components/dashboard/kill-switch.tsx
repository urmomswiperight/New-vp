"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, PowerOff } from "lucide-react"
import { stopAllCampaigns } from "@/lib/actions/campaigns"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export function KillSwitch() {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleKill = () => {
    startTransition(async () => {
      try {
        await stopAllCampaigns()
        toast.success("Emergency Stop: All campaigns paused")
        setOpen(false)
      } catch (error) {
        toast.error("Failed to stop campaigns")
        console.error(error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          <PowerOff className="mr-2 h-4 w-4" /> Emergency Stop
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This will immediately pause all active outreach campaigns. You will have to manually restart each campaign.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleKill} disabled={isPending} variant="destructive">
            {isPending ? "Stopping..." : "Stop All Campaigns"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
