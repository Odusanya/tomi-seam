import type { Metadata } from "next"
import "@fontsource-variable/inter"
import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"
import { SidebarInset } from "@/components/ui/sidebar"
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

// Opt-in mono: ?mono=paper. Geist stays the default.
const fontPaperMono = localFont({
  src: "./fonts/PaperMono-VF.woff2",
  variable: "--font-paper-mono",
  weight: "100 800",
  style: "normal",
  display: "swap",
})

// Static page, so the query is read on the client before paint; no searchParams here.
const monoScript = `if(new URLSearchParams(location.search).get("mono")==="paper")document.documentElement.dataset.mono="paper"`

// Rename on the day to the product in the brief.
export const metadata: Metadata = {
  title: "Assessments · Halden",
  description: "Prototype built for a design engineering task.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, fontRoobert.variable, fontPaperMono.variable, "font-sans")}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: monoScript }} />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <AppShell>
              <AppSidebar />
              <SidebarInset>{children}</SidebarInset>
            </AppShell>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
