import type { Metadata } from "next"
import "@fontsource-variable/inter"
import localFont from "next/font/local"

import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"
import { StartupToast } from "@/components/startup-toast"
import { MobileBar } from "@/components/mobile-bar"
import { ScanProvider } from "@/hooks/use-scan"
import { SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Roobert variable (TRIAL licence, see DECISIONS.md). Axes: wght 300-900, slnt, MONO.
const fontRoobert = localFont({
  src: "./fonts/RoobertVF-TRIAL.woff2",
  variable: "--font-roobert",
  weight: "300 900",
  style: "normal",
  display: "swap",
})

// Mono: Paper Mono (OFL).
const fontPaperMono = localFont({
  src: "./fonts/PaperMono-VF.woff2",
  variable: "--font-paper-mono",
  weight: "100 800",
  style: "normal",
  display: "swap",
})

// Rename on the day to the product in the brief.
export const metadata: Metadata = {
  title: "SeeFood",
  description: "Classifies an image as Hot Dog or Not Hot Dog. Inference is simulated.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontRoobert.variable, fontPaperMono.variable, "font-sans")}>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <ScanProvider>
              <AppShell>
                <AppSidebar />
                <SidebarInset>
                  <MobileBar />
                  {children}
                </SidebarInset>
              </AppShell>
            </ScanProvider>
            <Toaster />
            <StartupToast />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
