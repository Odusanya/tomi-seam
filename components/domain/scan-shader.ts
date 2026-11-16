// Fragment shader for the scan overlay (direction 01, "Sweep + dot wake").
// Runs inside Paper Shaders' ShaderMount, which supplies u_time, u_resolution, u_pixelRatio,
// the image texture with its aspect ratio, and v_imageUV from its vertex shader.
//
// Look: the frame is black. The subject (its shape is estimated from the photo: anything
// that differs from the background colour, blurred through mipmaps) stays in colour and
// gets a violet outline where the scan passes. A violet line ping-pongs across it, and a dot grid fades in
// behind the line like a wake.
//
// Timing (seconds): 0.6 fast pass up, 0.2 dwell, 1.9 eased pass down, 0.3 dwell = 3.0 loop.
export const SCAN_CYCLE_MS = 3000

/** The look's tunable values, passed to the shader as uniforms. /lab/scan exposes them as sliders. */
export type ScanTuning = {
  /** Dot grid pitch in CSS px. */
  u_pitch: number
  /** Wake length behind the line, in image heights. */
  u_wake: number
  /** Strength of the violet outline where the wake passes. */
  u_rim: number
  /** Strength of the violet wash in the wake. */
  u_tint: number
  /** Colour-distance threshold for what counts as the subject (higher = tighter cut). */
  u_cut: number
  /** Brightness kept outside the subject (0 = pure black). */
  u_floor: number
  /** 1 shows the subject mask in grey instead of the photo (debug). */
  u_mask: number
}

export const SCAN_DEFAULTS: ScanTuning = {
  u_pitch: 9,
  u_wake: 0.22,
  u_rim: 0.8,
  u_tint: 0.18,
  u_cut: 0.12,
  u_floor: 0,
  u_mask: 0,
}

export const scanFragmentShader = `#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_pixelRatio;
uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform float u_pitch;
uniform float u_wake;
uniform float u_rim;
uniform float u_tint;
uniform float u_cut;
uniform float u_floor;
uniform float u_mask;

in vec2 v_imageUV;
out vec4 fragColor;

// Radix violet-9 and violet-7: the app's AI colour (DESIGN rule 1: violet means the AI).
const vec3 SCAN = vec3(0.431, 0.337, 0.812);
const vec3 SCAN_LIGHT = vec3(0.694, 0.627, 0.957);

const float UP = 0.6;
const float DWELL = 0.2;      // rest at the top before the slow pass
const float DOWN = 1.9;
const float REST = 0.3;       // rest at the bottom; the verdict lands here
const float CYCLE = UP + DWELL + DOWN + REST;
const float TOP = 0.06;
const float BOTTOM = 0.94;

float easeOut(float t) { return 1.0 - (1.0 - t) * (1.0 - t); }
// Half smoothstep, half linear: eases at both ends without stalling at the top.
float easeInOut(float t) { return mix(t, t * t * (3.0 - 2.0 * t), 0.5); }

// x = line position (image uv, 0 top), y = direction (+1 down), z = wake strength.
vec3 sweep(float t) {
  t = mod(t, CYCLE);
  if (t < UP) return vec3(mix(BOTTOM, TOP, easeOut(t / UP)), -1.0, 1.0);
  t -= UP;
  if (t < DWELL) return vec3(TOP, -1.0, 1.0 - t / DWELL);
  t -= DWELL;
  if (t < DOWN) return vec3(mix(TOP, BOTTOM, easeInOut(t / DOWN)), 1.0, 1.0);
  t -= DOWN;
  return vec3(BOTTOM, 1.0, 1.0 - t / REST);
}

vec3 blurred(vec2 uv, float lod) { return textureLod(u_image, uv, lod).rgb; }

// Background colour = average of the four heavily blurred corners.
vec3 background() {
  return (blurred(vec2(0.04), 5.0) + blurred(vec2(0.96, 0.04), 5.0) + blurred(vec2(0.04, 0.96), 5.0) + blurred(vec2(0.96), 5.0)) * 0.25;
}

float chroma(vec3 c) { return max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b)); }

// Soft oval that keeps stray background near the frame edges out of the spotlight.
float centre(vec2 uv) {
  vec2 c = (uv - 0.5) * vec2(1.0, 1.15);
  return 1.0 - smoothstep(0.42, 0.62, length(c));
}

// How much of the frame is saturated (4x4 coarse samples). Low for white or grey food
// such as sushi, where the saturation test below would hide the subject.
float saturatedShare() {
  float n = 0.0;
  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      n += step(0.15, chroma(blurred((vec2(x, y) + 0.5) / 4.0, 5.0)));
    }
  }
  return n / 16.0;
}

// 0 outside the subject, 1 on it. Food differs from the background colour and, when the
// photo has colour to go on, is saturated, which keeps white plates and paper out.
// A low lod gives a tight cut-out for the colour; a high lod a soft region for the scan.
float shape(vec2 uv, vec3 bg, float gate, float lod, float lo, float hi) {
  vec3 c = blurred(uv, lod);
  float saturated = smoothstep(0.08, 0.2, chroma(c));
  return smoothstep(lo, hi, distance(c, bg)) * mix(1.0, saturated, gate);
}

void main() {
  vec2 uv = v_imageUV;   // already 0..1 with y down (Paper's vertex shader flips it)
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  if (inside < 0.5) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 photo = texture(u_image, uv).rgb;
  vec3 bg = background();
  float oval = centre(uv);
  float gate = smoothstep(0.1, 0.25, saturatedShare());
  float edge = shape(uv, bg, gate, 1.0, u_cut, u_cut + 0.1);          // tight: what keeps its colour
  float cut = edge * oval;
  float focus = shape(uv, bg, gate, 4.0, 0.06, 0.2) * oval;   // soft: where the scan is strongest

  // Everything but the subject is black; the subject keeps its colour.
  vec3 col = mix(photo * u_floor, photo, cut);
  if (u_mask > 0.5) col = vec3(cut);

  vec3 s = sweep(u_time);
  float behind = (uv.y - s.x) * -s.y;            // > 0 on the side the line has passed
  float wake = s.z * step(0.0, behind) * (1.0 - smoothstep(0.0, u_wake, behind));
  float reach = mix(0.35, 1.0, focus);           // effects stay faint off the subject

  // Fixed dot grid in screen space; dots grow toward the line.
  vec2 px = gl_FragCoord.xy / u_pixelRatio;
  vec2 cell = fract(px / u_pitch) - 0.5;
  float radius = mix(0.06, 0.2, wake);
  float aa = 1.0 / u_pitch;
  float dots = 1.0 - smoothstep(radius - aa, radius + aa, length(cell));
  // The subject's outline lights up only where the wake passes, so the highlight travels
  // with the scan instead of tinting textured photos all over.
  float rim = edge * (1.0 - edge) * 4.0 * oval;
  col += SCAN_LIGHT * rim * wake * u_rim;
  col = mix(col, SCAN * 0.9, wake * u_tint * reach);
  col = mix(col, SCAN_LIGHT, dots * wake * reach);

  // The line: a 2 px core plus a soft glow, sized in CSS px.
  float d = abs(uv.y - s.x) * (1.0 / fwidth(uv.y)) / u_pixelRatio;
  float line = (1.0 - smoothstep(1.0, 2.0, d)) + exp(-d * 0.18) * 0.45;
  col = mix(col, SCAN_LIGHT, clamp(line * reach, 0.0, 1.0));

  fragColor = vec4(col, 1.0);
}
`
