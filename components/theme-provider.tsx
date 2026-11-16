"use client"

import type { ComponentProps } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Light theme only for now. Dark tokens exist in styles/tokens; remove
// `forcedTheme` when dark mode is in scope.
export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider attribute="class" forcedTheme="light" disableTransitionOnChange {...props} />
}
