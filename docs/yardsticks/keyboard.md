# Keyboard

| Key | Action |
|---|---|
| `j` / `k` | Next / previous item |
| `a` `r` `e` | Accept / reject / edit |
| `Enter` | Open |
| `Esc` | Close or go back |
| `/` | Search |
| `?` | Shortcut sheet |
| `⌘K` | Command palette |

- Use `useHotkey()` from `hooks/use-hotkey.ts`; it ignores keys while typing.
- Show the key (`<Kbd>`) next to the action when it has focus.
- Focus moves with `j`/`k`; the focused row scrolls into view.
