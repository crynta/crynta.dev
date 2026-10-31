/*
 * One field of points, five shapes. Every point knows where it sits in each:
 *   0  the Gaussian surface, the curve the avatar's formula describes
 *   1  the avatar's formula over the name, sampled from the avatar itself
 *   2  last year's contributions, a column per week
 *   3  a galaxy with one lit point per Terax star
 *   4  the formula alone, beside the contact
 *   5  Terax's terminal, a dot per pixel, in the screenshot's own colours
 * The page picks two (uFrom, uTo) and how far between them it is (uMix).
 * Each point leaves a little later than its neighbour and arcs out on the
 * way, so a shape comes apart and gathers instead of sliding.
 */

export const VERT = /* glsl */ `
uniform float uTime;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform vec2 uPointer;
uniform float uPointerPower;
uniform float uAspect;
uniform float uSize;
uniform float uPixelRatio;
uniform float uFit;
uniform float uImgAspect;

attribute vec2 aGrid;
attribute vec3 aGraph;
attribute vec4 aGraphInfo;
attribute vec3 aStar;
attribute float aStarOn;
attribute vec3 aMark;
attribute vec3 aSolo;
attribute vec4 aImg;      // xy: place in the picture (height 1), w: brightness
attribute vec3 aImgColor;
attribute vec4 aRand;

varying vec3 vColor;
varying float vAlpha;

const vec3 PAPER = vec3(0.95, 0.937, 0.91);
const vec3 SIGNAL = vec3(1.0, 0.357, 0.122);
const vec3 DEEP = vec3(0.22, 0.21, 0.2);

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }

void surface(out vec3 p, out vec3 c, out float a, out float z) {
  z = 0.55 + aRand.z * 0.9;
  float fit = mix(0.62, 1.0, uFit);
  vec2 q = aGrid * vec2(3.6 * fit, 2.4) * mix(0.72, 1.0, uFit);
  float sigma = 0.82 + 0.07 * sin(uTime * 0.35);
  float r = length(q);
  float h = 1.55 * exp(-dot(q, q) / (2.0 * sigma * sigma));
  h += 0.05 * sin(r * 5.5 - uTime * 1.3) * exp(-r * 0.35);
  h += 0.035 * sin(q.x * 2.1 + uTime * 0.6) * cos(q.y * 2.7 - uTime * 0.45);
  p = rotX(0.42) * vec3(q.x, h, q.y) + vec3(0.0, -0.4, 0.0);
  float lift = clamp(h / 1.55, 0.0, 1.0);
  c = mix(DEEP, PAPER, smoothstep(0.02, 0.6, lift));
  c = mix(c, SIGNAL, smoothstep(0.84, 1.0, lift) * 0.8);
  a = mix(0.28, 1.0, smoothstep(0.0, 0.5, lift)) * (1.0 - smoothstep(0.82, 1.0, length(aGrid)));
}

void mark(out vec3 p, out vec3 c, out float a, out float z) {
  z = 0.55 + aRand.z * 0.9;
  p = aMark * mix(0.5, 1.0, uFit);
  c = PAPER;
  a = 0.95;
}

void graph(out vec3 p, out vec3 c, out float a, out float z) {
  z = 0.55 + aRand.z * 0.9;
  float fit = mix(0.42, 0.62, uFit);
  p = rotY(-0.1) * rotX(0.16) * (aGraph * fit);
  p.y -= 1.05;
  float k = aGraphInfo.x;
  c = mix(DEEP, PAPER, smoothstep(0.0, 0.4, k) * mix(0.55, 1.0, aGraphInfo.z));
  c = mix(c, SIGNAL, smoothstep(0.62, 0.95, k) * smoothstep(0.35, 1.0, aGraphInfo.z));
  a = mix(0.16 * (1.0 - aGraphInfo.z), mix(0.5, 1.0, k), aGraphInfo.y);
}

void stars(out vec3 p, out vec3 c, out float a, out float z) {
  z = 0.55 + aRand.z * 0.9;
  float fit = mix(0.7, 1.0, uFit);
  vec3 q = rotY(uTime * 0.04) * aStar;
  p = rotX(1.08) * q * fit + vec3(1.45 * uFit, -1.7 * (1.0 - uFit), 0.0);
  float core = 1.0 - smoothstep(0.0, 1.6, length(aStar.xz));
  c = mix(PAPER, SIGNAL, step(0.93, aRand.w) * 0.9);
  c = mix(c, vec3(1.0, 0.86, 0.72), core * 0.6);
  float twinkle = 0.5 + 0.5 * sin(uTime * (0.8 + aRand.z * 2.2) + aRand.y * 40.0);
  a = aStarOn * mix(0.45, 1.0, twinkle) * mix(0.4, 1.0, uFit);
}

void solo(out vec3 p, out vec3 c, out float a, out float z) {
  z = 0.55 + aRand.z * 0.9;
  // Beside the contact on a wide screen; behind it, and quieter, on a narrow one.
  p = aSolo * mix(0.55, 1.0, uFit) + vec3(2.05 * uFit, 0.15 - 1.55 * (1.0 - uFit), 0.0);
  c = PAPER;
  a = 0.9 * mix(0.16, 1.0, uFit);
}

// The picture fills the same box the real screenshot is laid out in:
// at most 86% of the width and 74% of the height of the screen.
void picture(out vec3 p, out vec3 c, out float a, out float z) {
  float visible = 4.4142; // world height the camera sees at z = 0
  float scale = min(visible * uAspect * 0.86 / uImgAspect, visible * 0.74);
  p = vec3(aImg.xy * scale, 0.0);
  c = aImgColor;
  a = aImg.w;
  z = 1.25;
}

void shape(float i, out vec3 p, out vec3 c, out float a, out float z) {
  if (i < 0.5) surface(p, c, a, z);
  else if (i < 1.5) mark(p, c, a, z);
  else if (i < 2.5) graph(p, c, a, z);
  else if (i < 3.5) stars(p, c, a, z);
  else if (i < 4.5) solo(p, c, a, z);
  else picture(p, c, a, z);
}

void main() {
  float stagger = 0.45;
  float g = clamp((uMix - aRand.x * stagger) / (1.0 - stagger), 0.0, 1.0);
  g = g * g * g * (g * (g * 6.0 - 15.0) + 10.0);

  vec3 pA, cA, pB, cB; float aA, aB, zA, zB;
  shape(uFrom, pA, cA, aA, zA);
  shape(uTo, pB, cB, aB, zB);
  vec3 pos = mix(pA, pB, g);
  vec3 col = mix(cA, cB, g);
  float alpha = mix(aA, aB, g);
  float size = mix(zA, zB, g);

  // The arc between shapes: out along the point's own direction, then home.
  float travel = step(0.5, abs(uTo - uFrom));
  vec3 scatter = normalize(aRand.xyz - 0.5 + 1e-4) * (0.6 + aRand.w * 1.4);
  pos += scatter * sin(g * 3.14159) * 0.9 * travel;
  // A small drift, so nothing is ever perfectly still; the picture keeps its grid.
  float still = (uFrom > 4.5 ? 1.0 - g : 0.0) + (uTo > 4.5 ? g : 0.0);
  pos += 0.01 * (1.0 - still) * vec3(sin(uTime * 0.7 + aRand.y * 30.0), cos(uTime * 0.6 + aRand.z * 30.0), 0.0);

  // The pointer moves through the field like a hand through water.
  vec4 view = modelViewMatrix * vec4(pos, 1.0);
  vec4 clip = projectionMatrix * view;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
  float near = exp(-dot(d, d) * 9.0) * uPointerPower * (1.0 - still * 0.6);
  view.xy += normalize(d + 1e-5) * near * 0.32;
  view.z += near * 0.5;
  col = mix(col, SIGNAL, near * 0.5);

  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * uPixelRatio * size * (1.0 + near * 0.8) / -view.z;
  vColor = col;
  vAlpha = alpha;
}
`;

export const FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, r) * vAlpha * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor * a, a);
}
`;
