// Sidebar nav config. Swap an icon by editing its import and `icon` field here.
import { HistoryIcon, ScanSearchIcon, SlidersHorizontalIcon, type LucideIcon } from "lucide-react"

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
export const currentUser = { name: "Tomi Odusanya", initials: "TO" }

// Content from the classify app: exactly two destinations.
export const navGroups: NavGroup[] = [
  {
    id: "main",
    items: [
      { id: "classify", title: "Classify", href: "/", icon: ScanSearchIcon },
      { id: "history", title: "History", href: "/history", icon: HistoryIcon },
    ],
  },
]

export const navFooter: NavItem[] = [
  { id: "settings", title: "Settings", href: "#", icon: SlidersHorizontalIcon },
]
