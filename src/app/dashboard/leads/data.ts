import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  Timer,
} from "lucide-react"

export const statuses = [
  {
    value: "NEW",
    label: "New",
    icon: HelpCircle,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "SUCCESS",
    label: "Success",
    icon: CheckCircle2,
  },
  {
    value: "FAILED",
    label: "Failed",
    icon: XCircle,
  },
]
