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
 * Single-key shortcut (e.g. "j", "a", "/", "?"). Ignored while typing unless
 * allowInInputs. Effect is allowed here: it syncs with an external system (window keys).
 */
export function useHotkey(key: string, handler: (event: KeyboardEvent) => void, options: Options = {}) {
  const { enabled = true, allowInInputs = false } = options
  const onKey = useEffectEvent(handler)

  useEffect(() => {
    if (!enabled) {
      return
    }
    function onKeyDown(event: KeyboardEvent) {
      const blocked =
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (!allowInInputs && isTypingTarget(event.target))
      if (blocked || event.key !== key) {
        return
      }
      event.preventDefault()
      onKey(event)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [key, enabled, allowInInputs])
}
