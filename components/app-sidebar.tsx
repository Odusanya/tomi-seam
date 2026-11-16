"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsUpDownIcon, SearchIcon } from "lucide-react"

import { Initials } from "@/components/domain/initials"
import { NavCard } from "@/components/domain/nav-card"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { currentUser, navFooter, navGroups, workspace, type NavItem } from "@/lib/fixtures/nav"

// One stroke for every sidebar icon (DESIGN.md: 1.5).
const ICON_STROKE = 1.5

function NavRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.href !== "#" && pathname === item.href
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        tooltip={item.unread && item.count ? `${item.title} · ${item.count}` : item.title}
        isActive={active}
        render={
          <Link href={item.href} aria-current={active ? "page" : undefined}>
            <item.icon strokeWidth={ICON_STROKE} className="group-data-active/menu-button:text-sidebar-primary" />
            <span>{item.title}</span>
          </Link>
        }
      />
      {item.count ? <SidebarMenuBadge>{item.count}</SidebarMenuBadge> : null}
      {item.unread ? (
        <span
          aria-hidden
          className="absolute top-1 right-1.5 hidden size-1.5 rounded-full bg-sidebar-primary group-data-[collapsible=icon]:block"
        />
      ) : null}
    </SidebarMenuItem>
  )
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <NavCard variant="header">
        <div className="flex items-center group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-0.5">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={workspace.name}>
                <Initials kind="workspace">{workspace.initial}</Initials>
                <span className="font-medium text-fg-primary">{workspace.name}</span>
                <ChevronsUpDownIcon strokeWidth={ICON_STROKE} className="ml-auto text-fg-tertiary" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger />
        </div>
        <Button variant="secondary" size="sm" aria-label="Search">
          <SearchIcon strokeWidth={ICON_STROKE} />
          <span className="flex-1 text-left text-fg-tertiary group-data-[collapsible=icon]:hidden">Search</span>
          <Kbd className="group-data-[collapsible=icon]:hidden">⌘K</Kbd>
        </Button>
      </NavCard>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavCard key={group.id} variant="group">
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
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
            {navFooter.map((item) => (
              <NavRow key={item.id} item={item} pathname={pathname} />
            ))}
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
