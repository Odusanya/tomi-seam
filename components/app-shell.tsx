"use client"

import { useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { SidebarProvider } from "@/components/ui/sidebar"

const DOC_ROUTE_PREFIX = "/documents"

// Sidebar starts as the icon rail on document routes. The user's toggle is kept per path,
// so the default is derived during render and needs no effect.
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [pref, setPref] = useState<{ path: string; open: boolean } | null>(null)
  const open = pref?.path === pathname ? pref.open : !pathname.startsWith(DOC_ROUTE_PREFIX)
  return (
    <SidebarProvider open={open} onOpenChange={(next) => setPref({ path: pathname, open: next })}>
      {children}
    </SidebarProvider>
  )
}
