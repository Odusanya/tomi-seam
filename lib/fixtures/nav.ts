// Sidebar nav config. Icons are Heroicons 16/solid; swap one by editing its import and `icon` field here.
import type { ComponentType, SVGProps } from "react"
import {
  AdjustmentsHorizontalIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CubeIcon,
  KeyIcon,
  Squares2X2Icon,
} from "@heroicons/react/16/solid"

export type NavItem = {
  id: string
  title: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  count?: number
  unread?: boolean
  // Shown but not part of this release: rendered as a "Soon" row, never as a link.
  soon?: boolean
}
export type NavGroup = { id: string; label?: string; items: NavItem[] }

export const workspace = { name: "Silicon", initial: "S" }
export const currentUser = { name: "Tomi Odusanya", initials: "TO" }

export const SOON_TOOLTIP = "Not available in the sandbox"

// "How it works" video in the Classify dialog: the SeeFood scene, starting at 1:14.
export const HOW_IT_WORKS_URL = "https://www.youtube.com/watch?v=tWwCK95X6go&t=74s"

export const navGroups: NavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "overview", title: "Overview", href: "/overview", icon: Squares2X2Icon },
      { id: "history", title: "History", href: "/history", icon: ClockIcon },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { id: "audit-log", title: "Audit log", href: "#", icon: ClipboardDocumentListIcon, soon: true },
      { id: "models", title: "Models", href: "#", icon: CubeIcon, soon: true },
      { id: "api-keys", title: "API keys", href: "#", icon: KeyIcon, soon: true },
    ],
  },
]

export const navFooter: NavItem[] = [
  { id: "settings", title: "Settings", href: "#", icon: AdjustmentsHorizontalIcon },
]
