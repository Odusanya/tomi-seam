# Tokens: one place to change

Change a product value in **`styles/tokens/product.css`**. Nothing else holds product values.

| File | Holds | Edit? |
|---|---|---|
| `styles/tokens/product.css` | Type scale, row/header heights, AI and severity colours | **Yes. The source of truth** |
| `styles/tokens/theme.css`, `app/app-theme.css` | Name → utility mapping (`text-body-sm`, `bg-ai`, `h-row`) | Only to add a new name |
| `semantic.css`, `generated.css`, `radix-scales.css` | Base system (neutrals, brand, radius, shadows) | Rarely |

Components use names only (`text-body-sm`, `bg-sev-major`, `h-row`), so a value change reaches every screen.

## `--scan-stage`: the one raw colour

`--scan-stage` is `#000` and maps to `bg-scan-stage`. Only the analysing stage (`components/domain/scan-stage.tsx`) uses it.

- **Why pure black:** the scan shader paints everything outside the subject black. The stage must match it exactly, or the canvas shows as a rectangle.
- **Why not `bg-inverted-solid`:** that is `--black-a12`, which is translucent. The page behind would show through and the stage would no longer match the canvas.
- **Don't reuse it** for other dark surfaces. Use `bg-inverted-solid` for those.

## Swapping to Paper later

When the Paper tokens are final:
1. In Paper, `get_tokens` (tailwind format).
2. Keep the names in `product.css`. Replace the values with Paper's.
3. `npm run check`, then look at a table (rows 36, header 32, body 13).

Names stay the same, so it is one file swap. If Paper renames a token, rename it in Paper to match the code. Don't change it in the components.
