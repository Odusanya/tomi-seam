> Sonner toast API reference (props, types, defaults), checked against sonner 2.0.8 (`node_modules/sonner/dist/index.d.ts`).
> Copied from `seamflow-tomi/.claude/skills/ask-sonner/API.md` on 2026-11-16, then corrected for the installed version.

# Sonner API Reference

Exact props, types, and defaults. Options passed to `toast()` override the same options set via the Toaster's `toastOptions`. Version: sonner 2.0.8.

## `<Toaster />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `theme` | `string` | `'light'` | `'light'`, `'dark'`, or `'system'`. |
| `richColors` | `boolean` | `false` | Makes error and success states more colorful. |
| `expand` | `boolean` | `false` | Toasts expanded by default (otherwise they expand on hover). |
| `duration` | `number` | `4000` | Default auto-close time in ms for every toast. |
| `visibleToasts` | `number` | `3` | Amount of visible toasts. |
| `id` | `string` | – | Toaster id, targeted by `toast()`'s `toasterId` option. |
| `position` | `string` | `'bottom-right'` | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`. |
| `closeButton` | `boolean` | `false` | Adds a close button to all toasts. |
| `offset` | `string \| number \| object` | `'24px'` | Offset from screen edges. Object form is per-side: `{ bottom: '24px', right: '16px' }`. |
| `mobileOffset` | `string \| number \| object` | `'16px'` | Offset when screen width < 600px. |
| `swipeDirections` | `array` | based on position | Allowed swipe-to-dismiss directions. |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | document direction | Text directionality. |
| `hotkey` | `string[]` | `['altKey', 'KeyT']` | Keyboard shortcut that focuses the toaster area. |
| `invert` | `boolean` | `false` | Dark toasts in light mode and vice versa. |
| `toastOptions` | `object` | – | Defaults for every toast: `className`, `descriptionClassName`, `style`, `classNames`, `unstyled`, `duration`, `closeButton`, `closeButtonAriaLabel`, `toasterId`, `actionButtonStyle`, `cancelButtonStyle`. Not the full `toast()` option list. |
| `gap` | `number` | `14` | Gap between toasts when expanded. |
| `icons` | `object` | – | Replace default icons: `{ success, info, warning, error, loading, close }`; `null` removes one. |
| `containerAriaLabel` | `string` | `'Notifications'` | ARIA label for the toast container; the hotkey hint is appended. |
| `customAriaLabel` | `string` | – | Replaces the whole container label, hotkey hint included. |
| `className` / `style` | `string` / `object` | – | Applied to the toaster element. |

## `toast()` options

`toast(message, options)` — message is a string, JSX, or a function returning JSX. Returns the toast's id.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `description` | `ReactNode` | – | Renders underneath the title; also accepts a function returning JSX. |
| `closeButton` | `boolean` | `false` | Adds a close button. |
| `invert` | `boolean` | `false` | Dark toast in light mode and vice versa. |
| `duration` | `number` | `4000` | Milliseconds before auto-close. `Infinity` persists the toast. |
| `position` | `string` | `'bottom-right'` | Position of this toast. |
| `dismissible` | `boolean` | `true` | If `false`, the user cannot dismiss the toast. |
| `icon` | `ReactNode` | – | Icon in front of the text; `null` removes the default. |
| `action` | `ReactNode \| { label, onClick }` | – | Primary button; clicking closes the toast unless `onClick` calls `event.preventDefault()`. |
| `cancel` | `ReactNode \| { label, onClick }` | – | Secondary button; clicking closes the toast. |
| `actionButtonStyle` | `object` | `{}` | Styles for the action button. |
| `cancelButtonStyle` | `object` | `{}` | Styles for the cancel button. |
| `id` | `string \| number` | – | Custom id; calling `toast()` again with the same id updates the existing toast. |
| `testId` | `string` | – | Rendered as `data-testid` for e2e tests. |
| `toasterId` | `string` | – | Id of the toaster to render this toast in. |
| `style` | `object` | – | Inline styles for the toast. |
| `className` / `descriptionClassName` | `string` | – | Classes for the toast and its description. |
| `richColors` | `boolean` | – | Per-toast override of the Toaster prop. |
| `classNames` | `object` | – | Classes per part: `toast`, `title`, `description`, `actionButton`, `cancelButton`, `closeButton`, `loader`, `content`, `icon`, plus one per type (`success`, `error`, `info`, `warning`, `loading`, `default`). Needs `!important` unless `unstyled`. |
| `unstyled` | `boolean` | `false` | Removes all default styles. |
| `onDismiss` | `(toast) => void` | – | Fires when the close button is clicked, the toast is swiped away, or `toast.dismiss()` closes it. |
| `onAutoClose` | `(toast) => void` | – | Fires when the toast closes automatically after `duration`. |

## Functions

| Function | Purpose |
| --- | --- |
| `toast(message, opts?)` | Render a toast; returns its id. |
| `toast.success / .error / .info / .warning(message, opts?)` | Typed toast with matching icon. `toast.message` is the plain variant. |
| `toast.loading(message, opts?)` | Toast with a spinner; update it by id. |
| `toast.promise(promise, { loading, success, error, description, finally })` | Loading toast that resolves with the promise (a promise or a function returning one). `success`/`error`/`description` accept strings, JSX or functions of the result; `success`/`error` may also return `{ message, ...toastOptions }`. Returns the id with `.unwrap()` to get the promise result. |
| `toast.custom((id) => jsx, opts?)` | Headless toast — your JSX, Sonner's behavior; the callback receives the toast id. |
| `toast.dismiss(id?)` | Dismiss one toast, or all when called without an id. |
| `toast.getToasts()` | All active toasts, usable outside React. `toast.getHistory()` includes dismissed ones. |
| `useSonner()` | React hook returning `{ toasts }`. |
