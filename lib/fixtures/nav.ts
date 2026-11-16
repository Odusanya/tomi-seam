// Sidebar nav config. Swap an icon by editing its import and `icon` field here.
import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  FileIcon,
  HistoryIcon,
  InboxIcon,
  SlidersHorizontalIcon,
  SquareCheckIcon,
  TriangleAlertIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { exampleFindings } from "@/lib/fixtures/example"
import { people } from "@/lib/fixtures/vocab"

export type NavItem = {
  id: string
  title: string
  href: string
  icon: LucideIcon
  count?: number
  unread?: boolean
}
export type NavGroup = { id: string; label?: string; items: NavItem[] }

export const workspace = { name: "SeeFood", initial: "S" }
export const currentUser = { name: people[0], initials: "AO" }

export const navGroups: NavGroup[] = [
  {
    id: "inbox",
    items: [{ id: "inbox", title: "Inbox", href: "#", icon: InboxIcon, count: 3, unread: true }],
  },
  {
    id: "work",
    label: "Work",
    items: [
      { id: "assessments", title: "Assessments", href: "#", icon: SquareCheckIcon, count: 24 },
      { id: "technical-files", title: "Technical files", href: "#", icon: FileIcon },
      { id: "findings", title: "Findings", href: "/", icon: TriangleAlertIcon, count: exampleFindings.length },
      { id: "reports", title: "Reports", href: "#", icon: ChartNoAxesColumnIcon },
    ],
  },
  {
    id: "planning",
    label: "Planning",
    items: [
      { id: "scheduling", title: "Scheduling", href: "#", icon: CalendarIcon },
      { id: "auditors", title: "Auditors", href: "#", icon: UsersIcon },
    ],
  },
  {
    id: "records",
    label: "Records",
    items: [{ id: "audit-trail", title: "Audit trail", href: "#", icon: HistoryIcon }],
  },
]

export const navFooter: NavItem[] = [
  { id: "settings", title: "Settings", href: "#", icon: SlidersHorizontalIcon },
]
