"use client"
// L3 atom. The scan shader drawn over one photo, 3:2, contained and centred. Decorative:
// callers keep the photo's alt text elsewhere. Used by ScanStage (the analysing modal)
// and by the /lab/scan playground.
import { ShaderMount } from "@paper-design/shaders-react"

import { SCAN_DEFAULTS, scanFragmentShader, type ScanTuning } from "@/components/domain/scan-shader"

// Paper Shaders' sizing uniforms: contain the image, centred, no transform.
const SIZING = {
  u_fit: 1,
  u_scale: 1,
  u_rotation: 0,
  u_originX: 0.5,
  u_originY: 0.5,
  u_offsetX: 0,
  u_offsetY: 0,
  u_worldWidth: 0,
  u_worldHeight: 0,
}

export function ScanCanvas({
  src,
  tuning = SCAN_DEFAULTS,
  speed = 1,
  frame = 0,
}: {
  src: string
  tuning?: ScanTuning
  /** Playback rate; 0 holds `frame`. */
  speed?: number
  /** Start time in ms. */
  frame?: number
}) {
  return (
    <ShaderMount
      aria-hidden
      className="aspect-3/2 w-full max-w-3xl"
      fragmentShader={scanFragmentShader}
      uniforms={{ u_image: src, ...SIZING, ...tuning }}
      mipmaps={["u_image"]}
      speed={speed}
      frame={frame}
    />
  )
}
