/**
 * Extract orange logo mark from gray background → transparent PNG.
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets", "logo-raw.png");
const DST = path.join(ROOT, "assets", "logo.png");

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Missing logo-raw.png at", SRC);
    process.exit(1);
  }

  const raw = PNG.sync.read(fs.readFileSync(SRC));
  const { width, height, data } = raw;

  // Sample corner to learn bg color
  const corners = [
    0,
    (width - 1) << 2,
    (width * (height - 1)) << 2,
    (width * (height - 1) + (width - 1)) << 2,
  ];
  let br = 0,
    bg = 0,
    bb = 0;
  for (const i of corners) {
    br += data[i];
    bg += data[i + 1];
    bb += data[i + 2];
  }
  br = (br / 4) | 0;
  bg = (bg / 4) | 0;
  bb = (bb / 4) | 0;
  console.log(`BG sample rgb(${br},${bg},${bb})`);

  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (width * y + x) << 2;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Distance from gray plate
      const dr = r - br;
      const dg = g - bg;
      const db = b - bb;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      // Keep orange mark (warm + far from bg); kill gray plate
      const isOrange = r > 160 && r > g + 20 && g > b && b < 120;
      let a;
      if (isOrange) {
        a = 255;
      } else if (dist < 28) {
        a = 0;
      } else if (dist < 48) {
        a = Math.round(((dist - 28) / 20) * 255);
      } else {
        // leftover midtones near mark — keep if warm
        a = r > g && g >= b && r > 140 ? 255 : 0;
      }

      data[i + 3] = a;
      if (a > 20) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = new PNG({ width: cw, height: ch });

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = (width * (minY + y) + (minX + x)) << 2;
      const di = (cw * y + x) << 2;
      out.data[di] = data[si];
      out.data[di + 1] = data[si + 1];
      out.data[di + 2] = data[si + 2];
      out.data[di + 3] = data[si + 3];
    }
  }

  fs.mkdirSync(path.dirname(DST), { recursive: true });
  fs.writeFileSync(DST, PNG.sync.write(out));
  console.log(`Logo written ${cw}x${ch} → ${DST}`);
}

main();
