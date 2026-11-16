import { useEffect, type RefObject } from "react"

// Moves focus to an element when `active` turns true (and on mount if it starts true).
// Needed because the focused control unmounts as the screen changes, which drops focus to <body>.
export function useFocusWhen(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (active) {
      ref.current?.focus()
    }
  }, [ref, active])
}
