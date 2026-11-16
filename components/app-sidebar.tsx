"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronUpDownIcon } from "@heroicons/react/16/solid"

import { Initials } from "@/components/domain/initials"
import { NavCard } from "@/components/domain/nav-card"
import { ScanAction, ScanActionLabel } from "@/components/domain/scan-action"
import { SoonPill } from "@/components/domain/soon-pill"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useScan } from "@/hooks/use-scan"
import { currentUser, navGroups, SOON_TOOLTIP, workspace, type NavItem } from "@/lib/fixtures/nav"

// Unavailable item: a focusable button with aria-disabled (not a link), a "Soon" tag,
// and a tooltip that shows in both expanded and collapsed states.
function SoonRow({ item, tagged }: { item: NavItem; tagged: boolean }) {
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
      {tagged ? <SidebarMenuBadge>Soon</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  )
}

// `groupSoon`: the whole group is unavailable, so its label carries one "Soon" pill and rows drop theirs.
function NavRow({ item, pathname, groupSoon }: { item: NavItem; pathname: string; groupSoon: boolean }) {
  if (item.soon) {
    return <SoonRow item={item} tagged={!groupSoon} />
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
  const { scan } = useScan()
  const { setOpenMobile } = useSidebar()
  // On mobile the sidebar is a sheet: close it so the Classify dialog isn't stacked on it.
  const openClassify = () => {
    setOpenMobile(false)
    scan()
  }
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <NavCard variant="header">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={workspace.name}>
              <Initials kind="workspace">{workspace.initial}</Initials>
              <span className="font-medium text-fg-primary">{workspace.name}</span>
              <ChevronUpDownIcon className="ml-auto text-fg-tertiary" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </NavCard>
      <SidebarContent>
        {/* The one call to action, above the nav items: opens Classify in a dialog. */}
        <div className="px-2 pt-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Tooltip>
            <TooltipTrigger render={<ScanAction onClick={openClassify} />}>
              <ScanActionLabel>Classify image</ScanActionLabel>
            </TooltipTrigger>
            <TooltipContent side="right">Classify an image</TooltipContent>
          </Tooltip>
        </div>
        {navGroups.map((group) => {
          const groupSoon = group.items.every((item) => item.soon)
          return (
            <NavCard key={group.id} variant="group">
              {group.label ? (
                <SidebarGroupLabel>
                  <span className="flex items-center gap-1.5">
                    {group.label}
                    {groupSoon ? <SoonPill /> : null}
                  </span>
                </SidebarGroupLabel>
              ) : null}
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavRow key={item.id} item={item} pathname={pathname} groupSoon={groupSoon} />
                ))}
              </SidebarMenu>
            </NavCard>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavCard variant="footer">
          {/* User row with the sidebar toggle at the bottom right; they stack in the rail. */}
          <div className="flex items-center group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-start group-data-[collapsible=icon]:gap-1">
            <SidebarMenu className="min-w-0 flex-1">
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" tooltip={currentUser.name}>
                  <Initials kind="user">{currentUser.initials}</Initials>
                  <span className="text-fg-primary">{currentUser.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <span className="mr-0.5 flex group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:ml-0.5">
              <SidebarTrigger />
            </span>
          </div>
        </NavCard>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
