import type { Metadata } from "next"
import "@fontsource-variable/inter"
import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// Roobert variable (TRIAL licence, see DECISIONS.md). Axes: wght 300-900, slnt, MONO.
const fontRoobert = localFont({
  src: "./fonts/RoobertVF-TRIAL.woff2",
  variable: "--font-roobert",
  weight: "300 900",
  style: "normal",
  display: "swap",
})

// Rename on the day to the product in the brief.
export const metadata: Metadata = {
  title: "Workspace",
  description: "Prototype built for a design engineering task.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, fontRoobert.variable, "font-sans")}>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
