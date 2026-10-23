const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const PORT = 4178;

function contentType(f) {
  if (f.endsWith(".html")) return "text/html";
  if (f.endsWith(".js")) return "application/javascript";
  if (f.endsWith(".json")) return "application/json";
  if (f.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/film/index.html";
  const filePath = path.join(ROOT, urlPath.replace(/^\//, ""));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("nf " + urlPath);
    return;
  }
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, "127.0.0.1", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("CONSOLE", m.type(), m.text()));
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message, e.stack));
  page.on("requestfailed", (r) =>
    console.log("FAIL", r.url(), r.failure() && r.failure().errorText)
  );
  await page.goto(`http://127.0.0.1:${PORT}/film/index.html`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(4000);
  const hud = await page.evaluate(() => document.getElementById("hud").textContent);
  console.log("HUD:", hud);
  const ready = await page.evaluate(() => typeof window.__filmReady);
  console.log("ready fn type:", ready);
  await browser.close();
  server.close();
});
