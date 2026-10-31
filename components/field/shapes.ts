/*
 * Where each point sits in each shape. Built once on the CPU; the shader only
 * blends between them. Seeded, so the field is the same on every visit.
 */

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: () => number) {
  return Math.sqrt(-2 * Math.log(random() + 1e-9)) * Math.cos(2 * Math.PI * random());
}

/** A square grid for the surface, filled in row by row. */
function grid(count: number) {
  const out = new Float32Array(count * 2);
  const side = Math.ceil(Math.sqrt(count));
  for (let i = 0; i < count; i++) {
    out[i * 2] = ((i % side) / (side - 1)) * 2 - 1;
    out[i * 2 + 1] = (Math.floor(i / side) / (side - 1)) * 2 - 1;
  }
  return out;
}

/**
 * The last year of contributions as a dot-matrix skyline: one column per week,
 * five dots wide, as tall as the week's work. Points the columns don't need
 * lie on the ground in front of them as a faint grid.
 */
function graph(count: number, days: number[], random: () => number) {
  const position = new Float32Array(count * 3);
  const info = new Float32Array(count * 4);
  const weeks: number[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7).reduce((a, b) => a + b, 0));
  const max = Math.max(...weeks, 1);
  const dot = 0.021;
  const wide = 5;
  const pitch = dot * wide + 0.045;
  const tallest = 104;
  const rows = weeks.map((w) => Math.max(1, Math.round(Math.sqrt(w / max) * tallest)));
  const needed = rows.reduce((a, b) => a + b * wide, 0);
  const squeeze = Math.min(1, (count * 0.72) / needed);
  const fitted = rows.map((r) => Math.max(1, Math.floor(r * squeeze)));
  const span = (weeks.length - 1) * pitch;

  let i = 0;
  fitted.forEach((height, week) => {
    const k = Math.sqrt(weeks[week] / max);
    const x0 = week * pitch - span / 2;
    for (let row = 0; row < height && i < count; row++) {
      for (let col = 0; col < wide && i < count; col++, i++) {
        position.set([x0 + (col - (wide - 1) / 2) * dot, row * dot, 0], i * 3);
        info.set([k, 1, row / Math.max(1, height - 1), 0], i * 4);
      }
    }
  });
  // The ground: a grid running back from the columns, fading with depth.
  const rest = count - i;
  const across = Math.ceil(span / (dot * 2.4));
  for (let j = 0; i < count; i++, j++) {
    const x = (j % across) * dot * 2.4 - span / 2;
    const z = -Math.floor(j / across) * dot * 3.2 - 0.06;
    position.set([x + (random() - 0.5) * 0.004, 0, z], i * 3);
    info.set([0, 0, Math.min(1, j / Math.max(1, rest)), 0], i * 4);
  }
  return { position, info };
}

/** A three-armed galaxy; exactly `visible` points shine, one per GitHub star. */
function galaxy(count: number, visible: number, random: () => number) {
  const position = new Float32Array(count * 3);
  const on = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = Math.pow(random(), 0.72) * 3.1 + 0.04;
    const arm = (i % 3) * ((Math.PI * 2) / 3);
    const spread = normal(random) * (0.42 / (r * 0.9 + 0.4));
    const angle = arm + r * 1.75 + spread;
    const y = normal(random) * 0.07 * (1.4 - r / 3.1);
    position.set([Math.cos(angle) * r, y, Math.sin(angle) * r], i * 3);
    on[i] = i < visible ? 1 : 0;
  }
  return { position, on };
}

type Sampled = { points: number[]; width: number; height: number };

/** The bright pixels of whatever was drawn, with the box they fill. */
function bright(canvas: HTMLCanvasElement, step = 2): Sampled {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width: W, height: H } = canvas;
  const data = ctx.getImageData(0, 0, W, H).data;
  const found: number[] = [];
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const o = (y * W + x) * 4;
      if (data[o] + data[o + 1] + data[o + 2] > 420 && data[o + 3] > 128) {
        found.push(x, y);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  // Centred on its own box, so the caller only says how tall it should be.
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  for (let i = 0; i < found.length; i += 2) {
    found[i] -= cx;
    found[i + 1] -= cy;
  }
  return { points: found, width: maxX - minX, height: maxY - minY };
}

/** The avatar's formula, from the avatar itself. */
function avatarCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 700;
  canvas.getContext("2d")!.drawImage(image, 0, 0, 700, 700);
  return bright(canvas);
}

function textCanvas(text: string, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 420;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 300px ${font}`;
  ctx.fillText(text, 700, 210);
  return bright(canvas);
}

/** Scatters `count` points over a sampled drawing, `height` world units tall. */
function scatter(out: Float32Array, from: number, count: number, shape: Sampled, height: number, dy: number, random: () => number) {
  const n = shape.points.length / 2;
  if (n === 0) return;
  const scale = height / shape.height;
  for (let i = 0; i < count; i++) {
    const j = Math.floor(random() * n) * 2;
    out.set(
      [
        (shape.points[j] + (random() - 0.5) * 2) * scale,
        -(shape.points[j + 1] + (random() - 0.5) * 2) * scale + dy,
        normal(random) * 0.04,
      ],
      (from + i) * 3,
    );
  }
}

/**
 * The two shapes made from the avatar: the formula over the name, and the
 * formula alone. Needs the avatar loaded and the font in.
 */
export function avatarShapes(count: number, image: HTMLImageElement, font: string) {
  const random = seeded(31);
  const formula = avatarCanvas(image);
  const name = textCanvas("Crynta", font);
  const withName = new Float32Array(count * 3);
  // Thin strokes need fewer points than the name's heavy letters.
  const forFormula = Math.floor(count * 0.5);
  scatter(withName, 0, forFormula, formula, 1.7, 1.02, random);
  scatter(withName, forFormula, count - forFormula, name, 0.8, -0.86, random);
  const alone = new Float32Array(count * 3);
  scatter(alone, 0, count, formula, 1.6, 0, random);
  return { withName, alone };
}

/**
 * A picture as a dot matrix: one point per cell of a grid as wide as the
 * picture, coloured like the pixels under it. Points the grid has no room for
 * stay dark.
 */
export function pictureShape(count: number, image: HTMLImageElement) {
  const aspect = image.naturalWidth / image.naturalHeight;
  const cols = Math.floor(Math.sqrt(count * aspect));
  const rows = Math.floor(count / cols);
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  const place = new Float32Array(count * 4);
  const color = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (i >= cols * rows) continue;
    const x = i % cols;
    const y = Math.floor(i / cols);
    const o = (y * cols + x) * 4;
    const r = data[o] / 255, g = data[o + 1] / 255, b = data[o + 2] / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Lift the colours a little: a dot glows less than the pixel it stands for.
    // Dark pixels still show as a faint dot, so the window reads as a window.
    const lift = (v: number) => Math.min(1, 0.16 + Math.pow(v, 0.62) * 1.35);
    place.set([((x + 0.5) / cols - 0.5) * aspect, 0.5 - (y + 0.5) / rows, 0, 0.5 + 0.5 * Math.pow(lum, 0.45)], i * 4);
    color.set([lift(r), lift(g), lift(b)], i * 3);
  }
  return { place, color, aspect };
}

export function buildShapes(count: number, days: number[], stars: number) {
  const random = seeded(19);
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = random();
  const g = graph(count, days, random);
  const s = galaxy(count, Math.min(stars, count), random);
  return {
    grid: grid(count),
    graph: g.position,
    graphInfo: g.info,
    star: s.position,
    starOn: s.on,
    // Until the avatar and the font are in, its shapes wait inside the galaxy.
    mark: s.position.slice(),
    solo: s.position.slice(),
    picture: new Float32Array(count * 4),
    pictureColor: new Float32Array(count * 3).fill(1),
    rand,
  };
}
