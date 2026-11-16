# Polish pass (last 25 minutes)

1. Focus ring visible on every interactive thing Primitives bring their own; anything custom keeps the global 1 px inset outline (lint blocks `outline-none`).
2. Hover only on things you can click; none on plain rows.
3. Disabled: primitives handle it. Custom elements use `text-fg-disabled` and `bg-disabled`, not `opacity-50`.
4. Icon size follows the control: 16 px, 1.5 stroke, muted icon colour; 14 px in 24 px controls.
5. Spacing on a 4 px grid; one gap value per group.
6. Popovers and menus animate in (opacity + scale .95); rows never animate.
7. Copy: sentence case, verbs on buttons, no "Successfully".
8. Empty states say what to do next.
9. Check at 1280 px and 1440 px; nothing clips.
10. Read the page in greyscale: hierarchy still reads.
