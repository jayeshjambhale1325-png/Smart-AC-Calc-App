import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// Rounded square badge with cyan/blue gradient + a sleek metallic snowflake.
function snowflakeSVG(size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.42; // arm length
  const stroke = Math.max(2, s * 0.045);
  const branch = r * 0.32;
  const bAngle = 0.5236; // 30 deg

  // Six arms of a snowflake with two side-branches near the tip.
  let arms = '';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const ex = cx + Math.cos(a) * r;
    const ey = cy + Math.sin(a) * r;
    // main arm
    arms += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="white" stroke-width="${stroke}" stroke-linecap="round"/>`;
    // two branches near the tip
    for (const off of [0.62, 0.82]) {
      const bx = cx + Math.cos(a) * r * off;
      const by = cy + Math.sin(a) * r * off;
      const a1 = a + bAngle;
      const a2 = a - bAngle;
      arms += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(a1) * branch}" y2="${by + Math.sin(a1) * branch}" stroke="white" stroke-width="${stroke * 0.72}" stroke-linecap="round"/>`;
      arms += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(a2) * branch}" y2="${by + Math.sin(a2) * branch}" stroke="white" stroke-width="${stroke * 0.72}" stroke-linecap="round"/>`;
    }
    // small hex center dot
  }
  // central hexagon for a metallic feel
  const hexR = s * 0.07;
  let hex = '';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = cx + Math.cos(a) * hexR;
    const py = cy + Math.sin(a) * hexR;
    hex += `${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
  }
  hex += 'Z';

  const gradId = 'bg';
  const sheenId = 'sheen';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="${s}" y2="${s}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#00B4D8"/>
      <stop offset="0.55" stop-color="#0077B6"/>
      <stop offset="1" stop-color="#023E8A"/>
    </linearGradient>
    <linearGradient id="${sheenId}" x1="0" y1="0" x2="0" y2="${s}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${s * 0.004}"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${s}" height="${s}" rx="${s * 0.22}" ry="${s * 0.22}" fill="url(#${gradId})"/>
  <rect x="0" y="0" width="${s}" height="${s}" rx="${s * 0.22}" ry="${s * 0.22}" fill="url(#${sheenId})"/>
  <g filter="url(#soft)">${arms}</g>
  <path d="${hex}" fill="white" opacity="0.95"/>
</svg>`;
  return svg;
}

// Favicon: transparent background, just the snowflake in blue gradient stroke.
function faviconSVG(size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.46;
  const stroke = Math.max(2, s * 0.05);
  const branch = r * 0.32;
  const bAngle = 0.5236;
  let arms = '';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const ex = cx + Math.cos(a) * r;
    const ey = cy + Math.sin(a) * r;
    arms += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="url(#fg)" stroke-width="${stroke}" stroke-linecap="round"/>`;
    for (const off of [0.62, 0.82]) {
      const bx = cx + Math.cos(a) * r * off;
      const by = cy + Math.sin(a) * r * off;
      const a1 = a + bAngle;
      const a2 = a - bAngle;
      arms += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(a1) * branch}" y2="${by + Math.sin(a1) * branch}" stroke="url(#fg)" stroke-width="${stroke * 0.72}" stroke-linecap="round"/>`;
      arms += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(a2) * branch}" y2="${by + Math.sin(a2) * branch}" stroke="url(#fg)" stroke-width="${stroke * 0.72}" stroke-linecap="round"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="fg" x1="0" y1="0" x2="${s}" y2="${s}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#00B4D8"/>
      <stop offset="1" stop-color="#023E8A"/>
    </linearGradient>
  </defs>
  ${arms}
</svg>`;
}

async function renderPNG(svg, size, file) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(file);
}

const sizes = [192, 256, 384, 512];
const tasks = [];
for (const size of sizes) {
  const svg = snowflakeSVG(size);
  tasks.push(renderPNG(svg, size, join(outDir, `icon-${size}.png`)));
}
// Apple touch icon (180, no transparency, full badge)
tasks.push(renderPNG(snowflakeSVG(180), 180, join(outDir, 'apple-touch-icon.png')));
// Maskable icon (512 with safe zone padding)
tasks.push(renderPNG(snowflakeSVG(512), 512, join(outDir, 'icon-maskable-512.png')));

await Promise.all(tasks);

// Favicon svg (transparent)
writeFileSync(join(outDir, 'favicon.svg'), faviconSVG(64));
// Also a 32px png favicon for compatibility
await renderPNG(snowflakeSVG(32), 32, join(outDir, 'favicon-32.png'));

console.log('icons generated');
