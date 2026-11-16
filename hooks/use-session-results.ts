"use client"

import { useSyncExternalStore } from "react"

import type { ClassificationResult } from "@/lib/fixtures/classification"

// Results the user classified, kept in localStorage so History and Overview can show them and
// a reload keeps them. A deliberate exception to "no persistence" (AGENTS.md): this hook is the
// only place that touches storage, and every access is wrapped so the app works without it.
const KEY = "silicon.session-results.v1"
const MAX_ROWS = 50
const THUMB_PX = 96
const EMPTY: readonly ClassificationResult[] = []

let cache: readonly ClassificationResult[] | null = null
const listeners = new Set<() => void>()

function persistable(rows: readonly ClassificationResult[]) {
  // A blob: URL dies with the page, so a row that still holds one is kept in memory only.
  return rows.filter((row) => !row.thumbnail.startsWith("blob:"))
}

function read(): readonly ClassificationResult[] {
  if (cache === null) {
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]")
      cache = Array.isArray(parsed) ? (parsed as ClassificationResult[]) : EMPTY
    } catch {
      cache = EMPTY
    }
  }
  return cache
}

function write(rows: readonly ClassificationResult[]) {
  cache = rows
  try {
    window.localStorage.setItem(KEY, JSON.stringify(persistable(rows)))
  } catch {
    // Storage full or blocked: the session still sees the rows.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Shrinks an uploaded image to a small JPEG data URL. Resolves to the input on any failure. */
function downscale(src: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image()
    image.addEventListener("load", () => {
      try {
        const scale = Math.min(1, THUMB_PX / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.7))
      } catch {
        resolve(src)
      }
    })
    image.addEventListener("error", () => resolve(src))
    image.src = src
  })
}

/**
 * Results classified in this browser, newest first, plus `add`. Empty on the server and on the
 * first client render, so server HTML never differs; stored rows arrive right after hydration.
 */
export function useSessionResults() {
  const results = useSyncExternalStore(subscribe, read, () => EMPTY)

  async function add(result: ClassificationResult) {
    const thumbnail = result.source === "upload" ? await downscale(result.thumbnail) : result.thumbnail
    const current = read()
    // The same image always gets the same id; row edits key on id, so repeats get a suffix.
    const taken = current.filter((row) => row.id === result.id || row.id.startsWith(`${result.id}_`)).length
    const id = taken === 0 ? result.id : `${result.id}_${taken + 1}`
    write([{ ...result, id, thumbnail }, ...current].slice(0, MAX_ROWS))
  }

  return { results, add } as const
}
