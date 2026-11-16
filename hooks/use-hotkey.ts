"use client"

import { useEffect, useEffectEvent } from "react"

type Options = { enabled?: boolean; allowInInputs?: boolean }

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

/**
 * Shortcut: a single key ("j", "/", "?", "Escape") or "mod+k" (⌘K / Ctrl+K).
 * Plain keys are ignored while typing unless allowInInputs; mod combos always fire. Effect is allowed here: it syncs with an external system (window keys).
 */
export function useHotkey(key: string, handler: (event: KeyboardEvent) => void, options: Options = {}) {
  const { enabled = true, allowInInputs = false } = options
  const onKey = useEffectEvent(handler)
  const wantsMod = key.startsWith("mod+")
  const wanted = wantsMod ? key.slice(4) : key

  useEffect(() => {
    if (!enabled) {
      return
    }
    function onKeyDown(event: KeyboardEvent) {
      const hasMod = event.metaKey || event.ctrlKey
      const blocked =
        event.defaultPrevented ||
        event.altKey ||
        hasMod !== wantsMod ||
        (!wantsMod && !allowInInputs && isTypingTarget(event.target))
      const pressed = wantsMod ? event.key.toLowerCase() : event.key
      if (blocked || pressed !== wanted) {
        return
      }
      event.preventDefault()
      onKey(event)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [wanted, wantsMod, enabled, allowInInputs])
}
