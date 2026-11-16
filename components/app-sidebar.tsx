"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/16/solid"

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
import { currentUser, navFooter, navGroups, SOON_TOOLTIP, workspace, type NavItem } from "@/lib/fixtures/nav"

// Unavailable item: a focusable button with aria-disabled (not a link), a "Soon" tag,
// and a tooltip that shows in both expanded and collapsed states.
function SoonRow({ item }: { item: NavItem }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        variant="soon"
        aria-disabled="true"
        tooltip={{ children: `${item.title} · ${SOON_TOOLTIP}`, hidden: false }}
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
      <SidebarMenuBadge>Soon</SidebarMenuBadge>
    </SidebarMenuItem>
  )
}

function NavRow({ item, pathname }: { item: NavItem; pathname: string }) {
  if (item.soon) {
    return <SoonRow item={item} />
  }
  const active = item.href !== "#" && pathname === item.href
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        tooltip={item.unread && item.count ? `${item.title} · ${item.count}` : item.title}
        isActive={active}
        render={
          <Link href={item.href} aria-current={active ? "page" : undefined}>
            <item.icon className="group-data-active/menu-button:text-sidebar-primary" />
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
                <ChevronUpDownIcon className="ml-auto text-fg-tertiary" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger />
        </div>
        <Button variant="secondary" size="sm" aria-label="Search">
          <MagnifyingGlassIcon />
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
