import type { Metadata } from "next"
import "@fontsource-variable/inter"
import localFont from "next/font/local"

import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"
import { StartupToast } from "@/components/startup-toast"
import { MobileBar } from "@/components/mobile-bar"
import { ClassifyDialog } from "@/features/classify/classify-dialog"
import { ScanProvider } from "@/hooks/use-scan"
import { SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Mono: Paper Mono (OFL).
const fontPaperMono = localFont({
  src: "./fonts/PaperMono-VF.woff2",
  variable: "--font-paper-mono",
  weight: "100 800",
  style: "normal",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Silicon",
  description: "Classifies an image as Hot Dog or Not Hot Dog. Inference is simulated.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontPaperMono.variable, "font-sans")}>
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
              <ClassifyDialog />
            </ScanProvider>
            {/* Bottom right: bottom left would cover the sidebar's user row and toggle. */}
            <Toaster position="bottom-right" />
            <StartupToast />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
