// L3 atom. Isometric illustration for the Classify dropzone: a photo card hovering over an
// inspection tray, the image's next step being the scan. True isometric (orthographic, 30° axes,
// no perspective), hard shadow, neutral faces; the card turns brand only while a file is dragged.
// Corners are rounded to echo the theme radii (see RADIUS below). Decorative: the dropzone's
// text carries the meaning.
import { cva, type VariantProps } from "class-variance-authority"

type Point = readonly [x: number, y: number, z: number]
type Rect = { x: number; y: number; w: number; d: number; r: number }

const COS30 = Math.cos(Math.PI / 6)
const SIN30 = 0.5
const ARC_STEPS = 6

/** World (x right-back, y left-back, z up) to screen. */
function iso([x, y, z]: Point): string {
  return `${((x - y) * COS30).toFixed(2)},${((x + y) * SIN30 - z).toFixed(2)}`
}

function poly(points: readonly Point[]): string {
  return points.map(iso).join(" ")
}

/** Outline of a rounded rectangle lying flat at height z, walked x → y so outward normals are (dy, -dx). */
function outline({ x, y, w, d, r }: Rect, z: number): Point[] {
  const corners = [
    { cx: x + w - r, cy: y + r, from: -Math.PI / 2 },
    { cx: x + w - r, cy: y + d - r, from: 0 },
    { cx: x + r, cy: y + d - r, from: Math.PI / 2 },
    { cx: x + r, cy: y + r, from: Math.PI },
  ]
  return corners.flatMap(({ cx, cy, from }) =>
    Array.from({ length: ARC_STEPS + 1 }, (_, i): Point => {
      const a = from + (i / ARC_STEPS) * (Math.PI / 2)
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]
    }),
  )
}

type Side = { points: string; face: "left" | "right" }

/**
 * A rounded slab: its top face, the visible side strips (each tagged with the face it belongs
 * to, so the rounded front corner steps from the right tone to the left), and a silhouette line
 * along the bottom edge and the two vertical tangents.
 */
function slab(rect: Rect, z: number, h: number) {
  const top = outline(rect, z + h)
  const n = top.length
  const sides: Side[] = []
  const visible: boolean[] = []
  for (let i = 0; i < n; i++) {
    const a = top[i]
    const b = top[(i + 1) % n]
    const nx = b[1] - a[1]
    const ny = -(b[0] - a[0])
    visible.push(nx + ny > 1e-6)
    if (visible[i]) {
      sides.push({
        points: poly([a, b, [b[0], b[1], z], [a[0], a[1], z]]),
        face: nx >= ny ? "right" : "left",
      })
    }
  }
  // The visible run is contiguous on a convex outline; start where it begins.
  const start = visible.findIndex((v, i) => v && !visible[(i - 1 + n) % n])
  const run: Point[] = []
  for (let k = 0; k < n && visible[(start + k) % n]; k++) {
    run.push(top[(start + k) % n])
  }
  run.push(top[(start + run.length) % n])
  const edge = [run[0], ...run.map(([px, py]): Point => [px, py, z]), run.at(-1) as Point]
  return { top: poly(top), sides, edge: poly(edge) }
}

// Radii in world units. The illustration renders at about 0.8 px per unit, so these land near
// the theme's radius-lg (8 px, the dropzone) for the tray and radius-md (6 px, tiles) for the card.
const RADIUS = { tray: 10, card: 6, frame: 3, sun: 4 }

const TRAY_H = 8
const TRAY = slab({ x: 0, y: 0, w: 100, d: 100, r: RADIUS.tray }, 0, TRAY_H)
const CARD_RECT: Rect = { x: 22, y: 30, w: 56, d: 40, r: RADIUS.card }
const CARD_Z = 30
const CARD_H = 3
const CARD = slab(CARD_RECT, CARD_Z, CARD_H)
const CARD_TOP = CARD_Z + CARD_H

// Hard shadow: the card's footprint on the tray, pushed straight back-right along x.
const SHADOW_SHIFT = 8
const SHADOW = poly(outline({ ...CARD_RECT, x: CARD_RECT.x + SHADOW_SHIFT }, TRAY_H))

// The photo glyph drawn on the card's top plane: an inset frame, two peaks and a sun.
const INSET = 6
const { x: cx, y: cy, w: cw, d: cd } = CARD_RECT
const FRAME = poly(outline({ x: cx + INSET, y: cy + INSET, w: cw - INSET * 2, d: cd - INSET * 2, r: RADIUS.frame }, CARD_TOP))
const near = cy + cd - INSET
const PEAKS = poly([
  [cx + INSET, near, CARD_TOP],
  [cx + 20, cy + 16, CARD_TOP],
  [cx + 30, near - 8, CARD_TOP],
  [cx + 38, cy + 20, CARD_TOP],
  [cx + cw - INSET, near, CARD_TOP],
])
const SUN = poly(outline({ x: cx + 38, y: cy + 8, w: RADIUS.sun * 2, d: RADIUS.sun * 2, r: RADIUS.sun }, CARD_TOP))

const FACE_FILL = { left: "fill-component-active stroke-component-active", right: "fill-component stroke-component" }

const cardVariants = cva("transition-colors duration-150 motion-reduce:transition-none", {
  variants: {
    state: {
      idle: "fill-page stroke-fg-tertiary",
      dragging: "fill-brand-subtle stroke-fg-brand",
      rejected: "fill-page stroke-fg-tertiary",
    },
  },
  defaultVariants: { state: "idle" },
})

type Props = VariantProps<typeof cardVariants>

const STROKE = 0.75
const SEAM = 0.4

function Sides({ sides }: { sides: Side[] }) {
  return (
    <g strokeWidth={SEAM}>
      {sides.map((side) => (
        <polygon key={side.points} points={side.points} className={FACE_FILL[side.face]} />
      ))}
    </g>
  )
}

export function IsoTray({ state }: Props) {
  return (
    <svg aria-hidden viewBox="-90 -14 180 118" className="h-auto w-36" strokeLinejoin="round" strokeLinecap="round">
      <Sides sides={TRAY.sides} />
      <g className="fill-none stroke-fg-tertiary" strokeWidth={STROKE}>
        <polyline points={TRAY.edge} />
      </g>
      <polygon points={TRAY.top} className="fill-page stroke-fg-tertiary" strokeWidth={STROKE} />
      <polygon points={SHADOW} className="fill-component-hover" />
      <Sides sides={CARD.sides} />
      <g className={cardVariants({ state })} strokeWidth={STROKE}>
        <polyline points={CARD.edge} fill="none" />
        <polygon points={CARD.top} />
        <g fill="none">
          <polygon points={FRAME} />
          <polyline points={PEAKS} />
          <polygon points={SUN} />
        </g>
      </g>
    </svg>
  )
}
