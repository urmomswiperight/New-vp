'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toggleCampaignStatus } from '@/lib/actions/campaigns'
import { toast } from 'sonner'

interface CampaignToggleProps {
  campaignId: string
  initialStatus: string
  name: string
}

export function CampaignToggle({ campaignId, initialStatus, name }: CampaignToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus === 'Active')
  const [isPending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      try {
        const updated = await toggleCampaignStatus(campaignId, isActive ? 'Active' : 'Paused')
        setIsActive(updated.status === 'Active')
        toast.success(`Campaign "${name}" is now ${updated.status}`)
      } catch (error) {
        toast.error('Failed to update campaign status')
        console.error(error)
      }
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`campaign-toggle-${campaignId}`}
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <Label htmlFor={`campaign-toggle-${campaignId}`} className="text-sm font-medium">
        {isActive ? 'Active' : 'Paused'}
      </Label>
    </div>
  )
}
