/**
 * Export still PNGs by seeking the WebGL film and screenshotting the canvas.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
const STILLS = path.join(ROOT, "stills");
const PORT = 4177;

const TIMES = CONFIG.stills || [0, 1.6, 2.5, 5, 6.5, 9.3, 11];

function stillName(t) {
  if (t === 0) return "t0.png";
  return `t${String(t).replace(".", "_")}.png`;
}

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

      // Map /film/... and /capture/... and /assets/...
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

async function main() {
  fs.mkdirSync(STILLS, { recursive: true });

  // Preconditions
  const need = [
    path.join(ROOT, "capture", "page.png"),
    path.join(ROOT, "capture", "layout.json"),
    path.join(ROOT, "film", "index.html"),
    path.join(ROOT, "film", "film.js"),
  ];
  for (const f of need) {
    if (!fs.existsSync(f)) {
      console.error("Missing", f, "— run capture first");
      process.exit(1);
    }
  }

  const server = await startServer();
  console.log(`Serving flyover on http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1152 },
    deviceScaleFactor: 1,
  });

  page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      console.log("CONSOLE", m.type(), m.text());
    }
  });

  await page.goto(`http://127.0.0.1:${PORT}/film/index.html`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });

  // Wait for film ready
  await page.waitForFunction(
    () => typeof window.__filmReady === "function" && window.__filmReady() === true,
    null,
    { timeout: 180000 }
  );

  // Hide debug HUD for clean stills
  await page.evaluate(() => document.body.classList.add("export"));
  // Give fonts a moment
  await page.waitForTimeout(500);

  for (const t of TIMES) {
    await page.evaluate(async (time) => {
      window.seek(time);
      // allow a frame to present
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, t);

    await page.waitForTimeout(80);

    const out = path.join(STILLS, stillName(t));
    // Screenshot the stage (canvas + title overlay)
    const stage = await page.$("#stage");
    await stage.screenshot({ path: out, type: "png" });
    console.log("Wrote", out);
  }

  await browser.close();
  server.close();
  console.log("Stills done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
