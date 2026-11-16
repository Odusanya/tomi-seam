"use client"

import { SandboxLabel } from "@/components/domain/sandbox-label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { workspace } from "@/lib/fixtures/nav"

// Below md the sidebar is a sheet, so the page needs its own trigger.
export function MobileBar() {
  return (
    <header className="flex items-center gap-2 border-b border-default px-3 py-2 md:hidden">
      <SidebarTrigger />
      <span className="font-medium text-fg-primary">{workspace.name}</span>
      <SandboxLabel />
    </header>
  )
}
