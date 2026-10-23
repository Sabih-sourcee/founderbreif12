/**
 * Render a preview MP4 by seeking the film and screenshotting frames.
 * Default: 30fps, no motion-blur subframes (watchable preview).
 * Usage: node scripts/render-preview.js [--fps 30]
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
const FRAMES = path.join(ROOT, "render", "frames");
const OUT = path.join(ROOT, "render", "founderbreif-flyover-preview.mp4");
const PORT = 4178;

const fpsArg = process.argv.indexOf("--fps");
const FPS = fpsArg >= 0 ? Number(process.argv[fpsArg + 1]) || 30 : 30;
const DURATION = CONFIG.duration || 14.5;
const TOTAL = Math.round(DURATION * FPS);

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  return "application/octet-stream";
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      if (urlPath === "/") urlPath = "/film/index.html";
      const rel = urlPath.replace(/^\//, "");
      const filePath = path.join(ROOT, rel);
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("not found " + urlPath);
        return;
      }
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function runFfmpeg() {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-framerate", String(FPS),
      "-i", path.join(FRAMES, "frame_%05d.png"),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "18",
      "-preset", "medium",
      "-movflags", "+faststart",
      OUT,
    ];
    const ff = spawn("ffmpeg", args, { stdio: "inherit" });
    ff.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("ffmpeg exit " + code))));
  });
}

async function main() {
  fs.mkdirSync(FRAMES, { recursive: true });
  // Clear old frames
  for (const f of fs.readdirSync(FRAMES)) {
    if (f.endsWith(".png")) fs.unlinkSync(path.join(FRAMES, f));
  }

  const server = await startServer();
  console.log(`Serving on http://127.0.0.1:${PORT} — rendering ${TOTAL} frames @ ${FPS}fps`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-angle=d3d11",
      "--enable-gpu",
      "--ignore-gpu-blocklist",
      "--disable-software-rasterizer",
    ],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 1152 },
    deviceScaleFactor: 1,
  });

  page.on("pageerror", (e) => console.error("PAGEERROR", e.message));

  await page.goto(`http://127.0.0.1:${PORT}/film/index.html`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });

  await page.waitForFunction(
    () => typeof window.__filmReady === "function" && window.__filmReady() === true,
    null,
    { timeout: 180000 }
  );
  await page.evaluate(() => document.body.classList.add("export"));
  await page.waitForTimeout(400);

  const stage = await page.$("#stage");
  const t0 = Date.now();

  for (let i = 0; i < TOTAL; i++) {
    const t = (i / FPS);
    await page.evaluate(async (time) => {
      window.seek(time);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, Math.min(t, DURATION - 1e-4));

    const out = path.join(FRAMES, `frame_${String(i).padStart(5, "0")}.png`);
    await stage.screenshot({ path: out, type: "png" });

    if (i % 30 === 0 || i === TOTAL - 1) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const eta = i > 0 ? (((Date.now() - t0) / i) * (TOTAL - i) / 1000).toFixed(0) : "?";
      console.log(`frame ${i + 1}/${TOTAL}  t=${t.toFixed(2)}s  elapsed=${elapsed}s  eta≈${eta}s`);
    }
  }

  await browser.close();
  server.close();

  console.log("Encoding MP4…");
  await runFfmpeg();
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
