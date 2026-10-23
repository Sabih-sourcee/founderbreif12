/**
 * Capture full-page screenshot + liftable layer PNGs + layout.json
 * Viewport 1440 CSS px, deviceScaleFactor 2.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
const OUT = path.join(ROOT, "capture");
const LAYERS_DIR = path.join(OUT, "layers");
const PAD = CONFIG.layerPad || 28;

async function main() {
  fs.mkdirSync(LAYERS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: CONFIG.captureWidth, height: 900 },
    deviceScaleFactor: CONFIG.deviceScaleFactor || 2,
  });
  const page = await context.newPage();

  console.log("Navigating", CONFIG.url);
  await page.goto(CONFIG.url, { waitUntil: "networkidle", timeout: 120000 });

  // Scroll to bottom once for lazy load, then back to top
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await sleep(80);
    }
    window.scrollTo(0, h);
    await sleep(400);
    window.scrollTo(0, 0);
    await sleep(300);
  });

  // Inject layer markers
  const layerMeta = await page.evaluate(() => {
    const marked = [];
    const used = new Set();

    function mark(el, id, kind) {
      if (!el || used.has(el)) return;
      used.add(el);
      el.setAttribute("data-layer", id);
      el.setAttribute("data-layer-kind", kind);
      marked.push({ id, kind });
    }

    const main = document.querySelector("main") || document.body;
    const sections = Array.from(main.querySelectorAll(":scope > section"));

    // Hero mockup / phone / card (right column card in hero)
    const hero = sections[0];
    if (hero) {
      const mock =
        hero.querySelector(".rounded-2xl.border") ||
        hero.querySelector("[class*='rounded-2xl']") ||
        hero.querySelector("img") ||
        null;
      if (mock) mark(mock, "hero-mockup", "card");

      // Hero CTA buttons
      const btns = hero.querySelectorAll("a, button");
      let bi = 0;
      btns.forEach((b) => {
        const t = (b.textContent || "").trim().toLowerCase();
        if (
          t.includes("demo") ||
          t.includes("waitlist") ||
          t.includes("features") ||
          t.includes("try")
        ) {
          if (bi < 2) mark(b, `hero-btn-${bi++}`, "button");
        }
      });

      // Metric chips inside mockup
      const chips = hero.querySelectorAll(".grid.grid-cols-3 > div, .grid > .rounded-lg");
      chips.forEach((c, i) => {
        if (i < 3) mark(c, `hero-chip-${i}`, "chip");
      });

      // Eyebrow / badge pills
      const badges = hero.querySelectorAll(
        "span.inline-flex, span[class*='rounded-[12px]'], .eyebrow"
      );
      badges.forEach((b, i) => {
        if (i < 2) mark(b, `hero-badge-${i}`, "chip");
      });
    }

    // Problem strip cards
    if (sections[1]) {
      const cards = sections[1].querySelectorAll(".grid > div");
      cards.forEach((c, i) => {
        if (i < 3) mark(c, `problem-${i}`, "card");
      });
    }

    // How-it-works steps
    if (sections[2]) {
      const steps = sections[2].querySelectorAll(".grid > div");
      steps.forEach((c, i) => {
        if (i < 3) mark(c, `how-${i}`, "card");
      });
    }

    // Feature photo/cards
    const features =
      document.querySelector("#features") ||
      sections.find((s) => s.id === "features") ||
      sections[3];
    if (features) {
      const cards = features.querySelectorAll(".rounded-2xl, .grid > div");
      cards.forEach((c, i) => {
        if (i < 6) mark(c, `feature-${i}`, "photo");
      });
    }

    // Testimonials
    const testSection =
      sections.find((s) =>
        (s.textContent || "").includes("quieter way")
      ) || sections[4];
    if (testSection) {
      const figs = testSection.querySelectorAll("figure, .rounded-2xl");
      figs.forEach((c, i) => {
        if (i < 3) mark(c, `testimonial-${i}`, "testimonial");
      });
    }

    // Pricing cards
    const pricing = document.querySelector("#pricing") || sections[5];
    if (pricing) {
      const cards = pricing.querySelectorAll(".rounded-2xl");
      cards.forEach((c, i) => {
        if (i < 3) mark(c, `pricing-${i}`, "card");
      });
    }

    return marked;
  });

  console.log(`Marked ${layerMeta.length} layers:`, layerMeta.map((l) => l.id).join(", "));

  // Measure page + layers in CSS pixels (document coords)
  const layout = await page.evaluate((pad) => {
    const body = document.documentElement;
    const pageWidth = Math.max(body.scrollWidth, document.body.scrollWidth, window.innerWidth);
    const pageHeight = Math.max(body.scrollHeight, document.body.scrollHeight);

    const layers = [];
    document.querySelectorAll("[data-layer]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left + window.scrollX;
      const y = r.top + window.scrollY;
      layers.push({
        id: el.getAttribute("data-layer"),
        kind: el.getAttribute("data-layer-kind") || "card",
        x,
        y,
        w: r.width,
        h: r.height,
        pad,
      });
    });

    // Hero region for dive card
    const heroSec = document.querySelector("main > section");
    let hero = null;
    if (heroSec) {
      const r = heroSec.getBoundingClientRect();
      hero = {
        x: r.left + window.scrollX,
        y: r.top + window.scrollY,
        w: r.width,
        h: r.height,
      };
    }

    return { pageWidth, pageHeight, layers, hero };
  }, PAD);

  // Hide sticky header for clean capture
  await page.addStyleTag({
    content: `
      header.sticky, [class*="sticky"][class*="top-0"] { position: relative !important; }
      [data-layer] { outline: none !important; }
    `,
  });

  // Full page with layers HIDDEN (visibility) so holes are clean for compositing
  await page.evaluate(() => {
    document.querySelectorAll("[data-layer]").forEach((el) => {
      el.dataset._prevVis = el.style.visibility;
      el.style.visibility = "hidden";
    });
  });

  const pagePath = path.join(OUT, "page.png");
  await page.screenshot({
    path: pagePath,
    fullPage: true,
    type: "png",
  });
  console.log("Saved", pagePath);

  // Restore layers, then capture each alone
  await page.evaluate(() => {
    document.querySelectorAll("[data-layer]").forEach((el) => {
      el.style.visibility = el.dataset._prevVis || "";
    });
  });

  // Measure actual screenshot size for scale
  const PNG = require("pngjs").PNG;
  const pagePng = PNG.sync.read(fs.readFileSync(pagePath));
  const scaleX = pagePng.width / layout.pageWidth;
  const scaleY = pagePng.height / layout.pageHeight;
  const scale = (scaleX + scaleY) / 2;

  layout.scale = scale;
  layout.screenshotWidth = pagePng.width;
  layout.screenshotHeight = pagePng.height;
  layout.captureWidth = CONFIG.captureWidth;
  layout.deviceScaleFactor = CONFIG.deviceScaleFactor;

  // For each layer: hide everything else conceptually by capturing clip of full page
  // with other elements visibility:hidden — keep target visible, hide siblings via CSS
  for (const layer of layout.layers) {
    await page.evaluate((id) => {
      // Show only this layer: hide all other data-layers, and wash page bg for transparent edges
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
      document.querySelectorAll("[data-layer]").forEach((el) => {
        if (el.getAttribute("data-layer") === id) {
          el.style.visibility = "visible";
          el.style.opacity = "1";
        } else {
          el.style.visibility = "hidden";
        }
      });
    }, layer.id);

    // Clip region with padding (CSS coords)
    const clipX = Math.max(0, layer.x - PAD);
    const clipY = Math.max(0, layer.y - PAD);
    const clipW = Math.min(layout.pageWidth - clipX, layer.w + PAD * 2);
    const clipH = Math.min(layout.pageHeight - clipY, layer.h + PAD * 2);

    // Playwright clip is in CSS pixels relative to page origin for fullPage... 
    // Actually for element screenshots, better use element handle
    const handle = await page.$(`[data-layer="${layer.id}"]`);
    if (!handle) {
      console.warn("Missing handle", layer.id);
      continue;
    }

    // Scroll into view then screenshot element with transparent surroundings via canvas composite
    await handle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(50);

    const buf = await handle.screenshot({
      type: "png",
      omitBackground: true,
    });

    // Pad onto transparent canvas
    const src = PNG.sync.read(buf);
    const outW = src.width + Math.round(PAD * 2 * scale);
    const outH = src.height + Math.round(PAD * 2 * scale);
    const out = new PNG({ width: outW, height: outH });
    // transparent already (zeros)
    const ox = Math.round(PAD * scale);
    const oy = Math.round(PAD * scale);
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const si = (src.width * y + x) << 2;
        const di = (outW * (y + oy) + (x + ox)) << 2;
        out.data[di] = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = src.data[si + 3];
      }
    }

    const layerPath = path.join(LAYERS_DIR, `${layer.id}.png`);
    fs.writeFileSync(layerPath, PNG.sync.write(out));
    layer.file = `layers/${layer.id}.png`;
    layer.imgW = outW;
    layer.imgH = outH;
    console.log(`  layer ${layer.id} ${outW}x${outH}`);
  }

  // Restore page for sanity
  await page.evaluate(() => {
    document.querySelectorAll("[data-layer]").forEach((el) => {
      el.style.visibility = "";
      el.style.opacity = "";
    });
  });

  // Sort layers top-to-bottom for draw order hint
  layout.layers.sort((a, b) => a.y - b.y || a.x - b.x);

  const layoutPath = path.join(OUT, "layout.json");
  fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2));
  console.log("Saved", layoutPath);
  console.log(`Done: ${layout.layers.length} layers, page ${pagePng.width}x${pagePng.height}`);

  await browser.close();

  if (layout.layers.length < 8) {
    console.warn("WARNING: fewer than 8 layers captured");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
