"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScanLineIcon } from "lucide-react"

import { Initials } from "@/components/domain/initials"
import { NavCard } from "@/components/domain/nav-card"
import { SandboxLabel } from "@/components/domain/sandbox-label"
import { ScanAction } from "@/components/domain/scan-action"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useScan } from "@/hooks/use-scan"
import { currentUser, navGroups, workspace, type NavItem } from "@/lib/fixtures/nav"

// One stroke for every sidebar icon (DESIGN.md: 1.5).
const ICON_STROKE = 1.5

function NavRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const { setOpenMobile } = useSidebar()
  const active = pathname === item.href
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        tooltip={item.title}
        isActive={active}
        render={
          <Link href={item.href} aria-current={active ? "page" : undefined} onClick={() => setOpenMobile(false)}>
            <item.icon strokeWidth={ICON_STROKE} className="group-data-active/menu-button:text-sidebar-primary" />
            <span>{item.title}</span>
          </Link>
        }
      />
    </SidebarMenuItem>
  )
}

// The page's one call to action. Always lands on the Classify idle screen: the link covers
// navigation from /history, the scan() bump resets Classify when already on /.
function ScanImageButton() {
  const { scan } = useScan()
  const { setOpenMobile } = useSidebar()
  return (
    <ScanAction
      href="/"
      onClick={() => {
        scan()
        setOpenMobile(false)
      }}
    >
      <ScanLineIcon aria-hidden strokeWidth={ICON_STROKE} />
      <span className="group-data-[collapsible=icon]:hidden">Scan image</span>
    </ScanAction>
  )
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <NavCard variant="header">
        <div className="flex items-center group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1">
            <Initials kind="workspace">{workspace.initial}</Initials>
            <span className="flex min-w-0 flex-col items-start gap-0.5 group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium text-fg-primary">{workspace.name}</span>
              <SandboxLabel />
            </span>
          </div>
          <SidebarTrigger />
        </div>
        <ScanImageButton />
      </NavCard>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavCard key={group.id} variant="group">
            <SidebarMenu>
              {group.items.map((item) => (
                <NavRow key={item.id} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </NavCard>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavCard variant="footer">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" tooltip={currentUser.name}>
                <Initials kind="user">{currentUser.initials}</Initials>
                <span className="text-fg-primary">{currentUser.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </NavCard>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
