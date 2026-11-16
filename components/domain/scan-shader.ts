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
/** Playback rate of the shader clock. One loop on screen takes SCAN_CYCLE_MS / SCAN_SPEED. */
export const SCAN_SPEED = 0.75

/** The look's tunable values, passed to the shader as uniforms. /lab/scan exposes them as sliders. */
export type ScanTuning = {
  /** Photo size inside the stage (Paper Shaders' own sizing uniform; 1 = fit). */
  u_scale: number
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
  /** How far the scan colour's hue drifts either side of violet, in degrees. */
  u_hueRange: number
  /** How fast the hue drifts (1 = default pace). */
  u_hueSpeed: number
}

export const SCAN_DEFAULTS: ScanTuning = {
  u_scale: 0.71,
  u_pitch: 10,
  u_wake: 0.37,
  u_rim: 1.3,
  u_tint: 0.55,
  u_cut: 0.32,
  u_floor: 0,
  u_mask: 0,
  u_hueRange: 12,
  u_hueSpeed: 1.75,
}

export const scanFragmentShader = `#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform float u_pitch;
uniform float u_wake;
uniform float u_rim;
uniform float u_tint;
uniform float u_cut;
uniform float u_floor;
uniform float u_mask;
uniform float u_hueRange;
uniform float u_hueSpeed;

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

const float CORNER = 20.0;   // stage corner radius in CSS px
const float FEATHER = 6.0;   // soft edge width in CSS px

// Rounded-rectangle mask over the whole stage: 1 inside, easing to 0 over FEATHER px at the
// edges, so the sweep and dots end in soft rounded corners instead of flat square ones.
float stageMask() {
  vec2 size = u_resolution / u_pixelRatio;
  vec2 p = gl_FragCoord.xy / u_pixelRatio - size * 0.5;
  vec2 q = abs(p) - (size * 0.5 - CORNER);
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - CORNER;
  return 1.0 - smoothstep(-FEATHER, 0.0, dist);
}

float easeOut(float t) { return 1.0 - (1.0 - t) * (1.0 - t); }
// Half smoothstep, half linear: eases at both ends without stalling at the top.
float easeInOut(float t) { return mix(t, t * t * (3.0 - 2.0 * t), 0.5); }

// "Thinking" colour: the scan colours drift in hue around violet. The rotation happens in
// OKLab, so lightness and chroma stay fixed and only the hue moves (an RGB or HSL shift
// would pulse in brightness). Two sines at unrelated rates, offset across the frame, so the
// drift never visibly loops and the line carries a gentle gradient along its length.
vec3 toOklab(vec3 c) {
  vec3 lms = mat3(0.4122214708, 0.2119034982, 0.0883024619,
                  0.5363325363, 0.6806995451, 0.2817188376,
                  0.0514459929, 0.1073969566, 0.6299787005) * c;
  lms = pow(max(lms, 0.0), vec3(1.0 / 3.0));
  return mat3(0.2104542553, 1.9779984951, 0.0259040371,
              0.7936177850, -2.4285922050, 0.7827717662,
              -0.0040720468, 0.4505937099, -0.8086757660) * lms;
}

vec3 fromOklab(vec3 lab) {
  vec3 lms = mat3(1.0, 1.0, 1.0,
                  0.3963377774, -0.1055613458, -0.0894841775,
                  0.2158037573, -0.0638541728, -1.2914855480) * lab;
  lms = lms * lms * lms;
  return clamp(mat3(4.0767416621, -1.2684380046, -0.0041960863,
                    -3.3077115913, 2.6097574011, -0.7034186147,
                    0.2309699292, -0.3413193965, 1.7076147010) * lms, 0.0, 1.0);
}

vec3 hueShift(vec3 c, float degrees) {
  vec3 lab = toOklab(c);
  float a = radians(degrees);
  lab.yz = mat2(cos(a), sin(a), -sin(a), cos(a)) * lab.yz;
  return fromOklab(lab);
}

float hueDrift(vec2 uv) {
  float t = u_time * u_hueSpeed;
  float d = 0.65 * sin(t * 1.3 + uv.x * 3.0) + 0.35 * sin(t * 0.47 - uv.y * 2.0 + 1.7);
  return d * u_hueRange;
}

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
  // Two spaces: the stage (whole canvas, 0..1, y down) carries the sweep, wake and dots, so
  // the scan runs the full height of the stage; the photo's uv carries the subject and outline.
  vec2 stage = vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y);
  vec2 uv = v_imageUV;   // already 0..1 with y down (Paper's vertex shader flips it)
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec2 uvc = clamp(uv, 0.0, 1.0);   // no branches before the derivatives below

  vec3 photo = texture(u_image, uvc).rgb;
  vec3 bg = background();
  float oval = centre(uvc);
  float gate = smoothstep(0.1, 0.25, saturatedShare());
  float edge = shape(uvc, bg, gate, 1.0, u_cut, u_cut + 0.1);        // tight: what keeps its colour
  float cut = edge * oval * inside;
  float focus = shape(uvc, bg, gate, 4.0, 0.06, 0.2) * oval * inside; // soft: where the scan is strongest
  // Smoother mask for the outline: one clean contour instead of every speckle's edge.
  float silhouette = shape(uvc, bg, gate, 3.0, u_cut, u_cut + 0.1) * oval * inside;

  // Everything but the subject is black; the subject keeps its colour.
  vec3 col = mix(photo * u_floor * inside, photo, cut);
  if (u_mask > 0.5) col = vec3(cut);

  vec3 s = sweep(u_time);
  float behind = (stage.y - s.x) * -s.y;          // > 0 on the side the line has passed
  float passed = s.z * step(0.0, behind);
  float wake = passed * (1.0 - smoothstep(0.0, u_wake, behind));
  float reach = mix(0.35, 1.0, focus);            // effects stay faint off the subject

  float drift = hueDrift(stage);
  vec3 scan = hueShift(SCAN, drift);
  vec3 scanLight = hueShift(SCAN_LIGHT, drift);

  // Outline: a ~1.5 px contour where the silhouette crosses 0.5, traced in as the line
  // passes it and held until the pass's rest fades it, brightest right behind the line.
  float contour = 1.0 - smoothstep(0.0, 1.5 * fwidth(silhouette) + 1e-4, abs(silhouette - 0.5));
  float outline = contour * passed * mix(0.55, 1.0, wake);
  col = mix(col, scanLight, clamp(outline * u_rim, 0.0, 1.0));

  // Fixed dot grid in screen space; dots grow toward the line.
  vec2 px = gl_FragCoord.xy / u_pixelRatio;
  vec2 cell = fract(px / u_pitch) - 0.5;
  float radius = mix(0.06, 0.2, wake);
  float aa = 1.0 / u_pitch;
  float dots = 1.0 - smoothstep(radius - aa, radius + aa, length(cell));
  col = mix(col, scan * 0.9, wake * u_tint * reach);
  col = mix(col, scanLight, dots * wake * reach);

  // The line: a 2 px core plus a soft glow, sized in CSS px, across the whole stage.
  float d = abs(stage.y - s.x) * (1.0 / fwidth(stage.y)) / u_pixelRatio;
  float line = (1.0 - smoothstep(1.0, 2.0, d)) + exp(-d * 0.18) * 0.45;
  col = mix(col, scanLight, clamp(line * reach, 0.0, 1.0));

  fragColor = vec4(col * stageMask(), 1.0);
}
`
