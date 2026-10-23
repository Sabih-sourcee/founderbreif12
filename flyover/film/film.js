/**
 * Founderbreif 3D flyover film — WebGL2
 * Every frame driven by window.seek(t). No timers / CSS transitions for film timing.
 */
(() => {
  const W = 1440;
  const H = 1152;
  const DURATION = 14.5;
  const FOCAL = 1880;
  const TILT0 = (56 * Math.PI) / 180;
  const DIST0 = 1360;
  const DIST1 = 1700;
  const CRUISE = 770; // page px / s at speedShare 1.0
  const PAGE_RADIUS = 24;
  const HERO_RADIUS = 38;

  let config = {
    brand: "Founderbreif",
    closingLine: "One brief. Every Monday.",
    italicTail: "No noise.",
  };

  const canvas = document.getElementById("gl");
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) throw new Error("WebGL2 required");

  const hud = document.getElementById("hud");
  const badgeEl = document.getElementById("badge");
  const line1El = document.getElementById("line1");
  const line2El = document.getElementById("line2");

  // ---------- math ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
  const easeInQuad = (t) => t * t;

  // ---------- speed curve → page scroll position ----------
  // speed share: 0@0, 0.5@0.6, hold 0.5 to 1.25, 1.0@1.6, hold ~1.0 to 7.3, ease to 0.12@8.3
  function speedShare(t) {
    if (t <= 0) return 0;
    if (t < 0.6) return 0.5 * smoothstep(0, 0.6, t);
    if (t < 1.25) return 0.5;
    if (t < 1.6) return lerp(0.5, 1.0, smoothstep(1.25, 1.6, t));
    if (t < 7.3) {
      // slight breathe 0.94–1.1
      const phase = (t - 1.6) / (7.3 - 1.6);
      return lerp(0.94, 1.1, 0.5 + 0.5 * Math.sin(phase * Math.PI * 2));
    }
    if (t < 8.3) return lerp(1.0, 0.12, easeInOut(smoothstep(7.3, 8.3, t)));
    return 0.12 * (1 - smoothstep(8.3, 9.25, t));
  }

  // Pre-integrate scroll for stability
  const SCROLL_SAMPLES = 2000;
  const scrollAt = new Float64Array(SCROLL_SAMPLES + 1);
  {
    let y = 0;
    scrollAt[0] = 0;
    const dt = DURATION / SCROLL_SAMPLES;
    for (let i = 1; i <= SCROLL_SAMPLES; i++) {
      const t = (i - 0.5) * dt;
      y += speedShare(t) * CRUISE * dt;
      scrollAt[i] = y;
    }
  }
  function pageScrollY(t) {
    const u = clamp(t / DURATION, 0, 1) * SCROLL_SAMPLES;
    const i = Math.floor(u);
    const f = u - i;
    if (i >= SCROLL_SAMPLES) return scrollAt[SCROLL_SAMPLES];
    return lerp(scrollAt[i], scrollAt[i + 1], f);
  }

  // ---------- shaders ----------
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader compile");
    }
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "link");
    }
    return p;
  }

  const VS_QUAD = `#version 300 es
  layout(location=0) in vec2 a_pos;
  out vec2 v_uv;
  void main(){
    v_uv = a_pos*0.5+0.5;
    gl_Position = vec4(a_pos,0.0,1.0);
  }`;

  // Soft studio background
  const PROG_BG = program(
    VS_QUAD,
    `#version 300 es
    precision highp float;
    out vec4 o;
    uniform vec2 u_res;
    void main(){
      vec2 uv = gl_FragCoord.xy / u_res;
      float d = length(uv - vec2(0.5));
      vec3 c = mix(vec3(0.976,0.984,0.984), vec3(0.949,0.953,0.965), smoothstep(0.05,0.85,d));
      o = vec4(c,1.0);
    }`
  );

  // Scene compositor: page + layers projected with soft DOF
  const PROG_LAYER = program(
    `#version 300 es
    layout(location=0) in vec2 a_corner; // 0..1
    uniform mat4 u_mvp;
    uniform vec4 u_uvRect; // x,y,w,h in tex
    out vec2 v_uv;
    out float v_depth;
    void main(){
      vec2 p = a_corner * 2.0 - 1.0; // will be set by CPU into clip via mvp on unit quad in page space
      // Actually we pass page-space corners via instance-less: a_corner is 0/1, mvp maps them
      vec4 world = u_mvp * vec4(a_corner, 0.0, 1.0);
      v_depth = world.w; // stash
      v_uv = u_uvRect.xy + a_corner * u_uvRect.zw;
      gl_Position = world;
    }`,
    `#version 300 es
    precision highp float;
    in vec2 v_uv;
    in float v_depth;
    uniform sampler2D u_tex;
    uniform float u_opacity;
    uniform float u_radius; // px in texture space approx via uv
    uniform vec2 u_texSize;
    uniform float u_roundPx; // corner radius in layer local px (css*scale)
    uniform vec2 u_layerSize; // padded size
    uniform float u_pad;
    out vec4 o;
    float roundedAlpha(vec2 uv){
      // uv 0..1 over padded layer; content inset by pad
      vec2 px = uv * u_layerSize;
      vec2 local = px - vec2(u_pad);
      vec2 size = u_layerSize - vec2(u_pad*2.0);
      if(local.x < -1.0 || local.y < -1.0 || local.x > size.x+1.0 || local.y > size.y+1.0) return 0.0;
      vec2 halfSz = size * 0.5;
      vec2 q = abs(local - halfSz) - (halfSz - vec2(u_roundPx));
      float d = length(max(q,0.0)) + min(max(q.x,q.y),0.0) - u_roundPx;
      return 1.0 - smoothstep(-1.0, 1.0, d);
    }
    void main(){
      vec4 c = texture(u_tex, v_uv);
      float ra = roundedAlpha(v_uv);
      c.a *= ra * u_opacity;
      // premultiply for correct blending
      o = vec4(c.rgb * c.a, c.a);
    }`
  );

  // Simpler textured quad with screen-space placement (CPU projects corners)
  const PROG_SPRITE = program(
    `#version 300 es
    layout(location=0) in vec2 a_uv;
    uniform vec2 u_p0, u_p1, u_p2, u_p3; // screen px corners TL TR BR BL
    uniform vec2 u_res;
    out vec2 v_uv;
    out float v_zd;
    uniform float u_depth;
    void main(){
      // bilinear from a_uv
      vec2 a = mix(u_p0, u_p1, a_uv.x);
      vec2 b = mix(u_p3, u_p2, a_uv.x);
      vec2 p = mix(a, b, a_uv.y);
      vec2 ndc = vec2((p.x / u_res.x)*2.0 - 1.0, 1.0 - (p.y / u_res.y)*2.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
      v_uv = a_uv;
      v_zd = u_depth;
    }`,
    `#version 300 es
    precision highp float;
    in vec2 v_uv;
    in float v_zd;
    uniform sampler2D u_tex;
    uniform float u_opacity;
    uniform float u_blurPx; // DOF blur radius
    uniform vec2 u_texSize;
    uniform float u_round;
    uniform vec2 u_contentSize; // w,h without depending on pad for round
    out vec4 o;

    // 40 golden-angle disc taps (mip-matched via LOD)
    const float GOLD = 2.399963229728653;
    vec4 sampleBlur(vec2 uv, float radius){
      if(radius < 0.5){
        return texture(u_tex, uv);
      }
      float lod = log2(max(radius * 0.35, 1.0));
      vec4 acc = vec4(0.0);
      float wsum = 0.0;
      // match mip
      for(int i=0;i<40;i++){
        float fi = float(i);
        float r = sqrt((fi+0.5)/40.0);
        float a = fi * GOLD;
        vec2 off = vec2(cos(a), sin(a)) * r * radius;
        vec2 uvo = uv + off / u_texSize;
        float w = 1.0 - r*0.35;
        acc += textureLod(u_tex, uvo, lod) * w;
        wsum += w;
      }
      return acc / wsum;
    }

    float roundMask(vec2 uv){
      if(u_round <= 0.0) return 1.0;
      vec2 px = uv * u_contentSize;
      vec2 halfSz = u_contentSize * 0.5;
      float rr = u_round;
      vec2 q = abs(px - halfSz) - (halfSz - vec2(rr));
      float d = length(max(q,0.0)) + min(max(q.x,q.y),0.0) - rr;
      return 1.0 - smoothstep(-1.2, 1.2, d);
    }

    void main(){
      vec4 c = sampleBlur(v_uv, u_blurPx);
      float m = roundMask(v_uv);
      float a = c.a * m * u_opacity;
      o = vec4(c.rgb * a, a);
    }`
  );

  // Soft drop shadow (screen-space rounded rect approx via blurred alpha)
  const PROG_SHADOW = program(
    `#version 300 es
    layout(location=0) in vec2 a_uv;
    uniform vec2 u_p0, u_p1, u_p2, u_p3;
    uniform vec2 u_res;
    out vec2 v_uv;
    void main(){
      vec2 a = mix(u_p0, u_p1, a_uv.x);
      vec2 b = mix(u_p3, u_p2, a_uv.x);
      vec2 p = mix(a, b, a_uv.y);
      vec2 ndc = vec2((p.x / u_res.x)*2.0 - 1.0, 1.0 - (p.y / u_res.y)*2.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
      v_uv = a_uv;
    }`,
    `#version 300 es
    precision highp float;
    in vec2 v_uv;
    uniform float u_opacity;
    uniform float u_round;
    uniform vec2 u_size;
    out vec4 o;
    void main(){
      vec2 px = v_uv * u_size;
      vec2 halfSz = u_size * 0.5;
      float rr = max(u_round, 1.0);
      vec2 q = abs(px - halfSz) - (halfSz - vec2(rr));
      float d = length(max(q,0.0)) + min(max(q.x,q.y),0.0) - rr;
      float a = (1.0 - smoothstep(-2.0, 6.0, d)) * u_opacity;
      o = vec4(vec3(0.102, 0.129, 0.2) * a, a); // #1a2133
    }`
  );

  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  // uv grid 0..1
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]),
    gl.STATIC_DRAW
  );

  const fullscreenBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  function fitImageToMaxTex(img) {
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 8192;
    const w = img.width;
    const h = img.height;
    if (w <= maxTex && h <= maxTex) {
      return { source: img, width: w, height: h };
    }
    const scale = Math.min(maxTex / w, maxTex / h);
    const nw = Math.max(1, Math.floor(w * scale));
    const nh = Math.max(1, Math.floor(h * scale));
    const c = document.createElement("canvas");
    c.width = nw;
    c.height = nh;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, nw, nh);
    console.warn(`Downscaled texture ${w}x${h} → ${nw}x${nh} (max ${maxTex})`);
    return { source: c, width: nw, height: nh };
  }

  function texFromImage(img, genMips = true) {
    const fitted = fitImageToMaxTex(img);
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fitted.source);
    const pot =
      (fitted.width & (fitted.width - 1)) === 0 &&
      (fitted.height & (fitted.height - 1)) === 0;
    if (genMips && pot) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else if (genMips) {
      // NPOT: mipmap via manual levels not required; use linear
      try {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } catch (e) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const ext = gl.getExtension("EXT_texture_filter_anisotropic");
    if (ext) {
      const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, max));
    }
    t._w = fitted.width;
    t._h = fitted.height;
    return t;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("fail " + src));
      img.src = src;
    });
  }

  // ---------- camera projection ----------
  /**
   * Page lies on z=0 plane, x right, y down the page (document coords).
   * Camera looks at (lookX, lookY, 0), sits at distance along a ray tilted TILT from -Z toward +Y.
   * Tilt 56° off straight-down → camera is elevated and south of look-at.
   */
  function cameraAt(t, layout) {
    const pageW = layout.pageWidth;
    const pageH = layout.pageHeight;
    const hero = layout.hero || { x: 0, y: 0, w: pageW, h: Math.min(900, pageH * 0.18) };

    // Base look-at: centre of top-half of hero + scroll
    const scroll = pageScrollY(Math.min(t, 8.2));
    let lookX = pageW * 0.5;
    let lookY = hero.y + hero.h * 0.28 + scroll;

    // Distance eases 1360→1700, never back
    let dist = lerp(DIST0, DIST1, smoothstep(0, 8.2, Math.min(t, 8.2)));
    let tilt = TILT0;

    // Rise 7.75–9.25: zoom out, flatten tilt, pin bottom edge
    if (t >= 7.75) {
      const rise = clamp((t - 7.75) / (9.25 - 7.75), 0, 1);
      // log zoom trapezoid — pull far enough to fit whole page as strip
      const riseSpeed = Math.sin(Math.min(rise, 1) * Math.PI);
      const logZoom = Math.pow(2.15, rise * (0.85 + 0.15 * riseSpeed));
      dist = DIST1 * logZoom;

      // tilt flattens 8.15–8.95
      const flat = smoothstep(8.15, 8.95, t);
      tilt = lerp(TILT0, (8 * Math.PI) / 180, flat);

      // Hand glide: bottom edge ~42px above frame bottom from 8.3–8.65
      if (t >= 8.3) {
        lookY = pageH * 0.5;
        lookX = pageW * 0.5;
        // Extra pull so page height fits in frame with margin
        const fitDist = (pageH * 0.55 * FOCAL) / (H * 0.42);
        dist = Math.max(dist, lerp(dist, fitDist, smoothstep(8.3, 9.25, t)));
      }
    }

    // Overhead creep 9.25–9.47: 3.5% closer
    if (t >= 9.25 && t < 9.47) {
      const u = (t - 9.25) / (9.47 - 9.25);
      dist *= 1 - 0.035 * u;
      tilt = (8 * Math.PI) / 180;
      lookY = pageH * 0.5;
      lookX = pageW * 0.5;
    }

    // Dive 9.47–9.97
    let diveU = 0;
    let maskRadius = PAGE_RADIUS;
    let maskRect = { x: 0, y: 0, w: pageW, h: pageH };
    let showBelow = 1;

    if (t >= 9.47) {
      diveU = clamp((t - 9.47) / (9.97 - 9.47), 0, 1);
      const e = easeInQuad(diveU); // quadratic ease into dive scale
      // log scale
      const diveScale = Math.pow(2.4, e);
      dist = DIST1 * 1.55 / diveScale * (1 - 0.15 * e);
      tilt = lerp((8 * Math.PI) / 180, (42 * Math.PI) / 180, e);

      // Pin page top edge; grow; hero becomes 1018px card; top drops to y=283
      const heroCardW = 1018;
      const heroCardH = hero.h * (heroCardW / Math.max(hero.w, 1));
      const targetTop = lerp(0, 283, easeOutQuad(diveU));
      lookY = hero.y + hero.h * 0.42;
      lookX = pageW * 0.5;

      maskRadius = lerp(PAGE_RADIUS, HERO_RADIUS, e);
      // Morph mask toward hero
      const mx = lerp(0, (pageW - heroCardW) / 2, e);
      const my = lerp(0, hero.y, e);
      const mw = lerp(pageW, heroCardW, e);
      const mh = lerp(pageH, Math.min(heroCardH, hero.h * 1.05), e);
      maskRect = { x: mx, y: my, w: mw, h: mh };
      showBelow = 1 - e;

      if (t >= 9.97) {
        // Title card hold — slight creep 2%
        const hold = clamp((t - 9.97) / (14.5 - 9.97), 0, 1);
        dist *= 1 - 0.02 * hold;
        diveU = 1;
        maskRadius = HERO_RADIUS;
        maskRect = {
          x: (pageW - 1018) / 2,
          y: hero.y,
          w: 1018,
          h: Math.min(hero.h * 1.05, hero.h * (1018 / Math.max(hero.w, 1))),
        };
        showBelow = 0;
        tilt = (42 * Math.PI) / 180;
        lookY = hero.y + hero.h * 0.4;
      }
    }

    // Camera sits toward page-top (-Y) of look-at, looking down-page (+Y) so text stays upright
    const camX = lookX;
    const camY = lookY - Math.sin(tilt) * dist;
    const camZ = Math.cos(tilt) * dist;

    return {
      lookX,
      lookY,
      camX,
      camY,
      camZ,
      dist,
      tilt,
      scroll,
      diveU,
      maskRadius,
      maskRect,
      showBelow,
      focal: FOCAL,
    };
  }

  /** Project page point (x,y,z) → screen px */
  function project(x, y, z, cam) {
    // Forward toward look-at; right = +X; up = forward × right (page top → screen top)
    const toLookX = cam.lookX - cam.camX;
    const toLookY = cam.lookY - cam.camY;
    const toLookZ = 0 - cam.camZ;
    const len = Math.hypot(toLookX, toLookY, toLookZ) || 1;
    const fx = toLookX / len;
    const fy = toLookY / len;
    const fz = toLookZ / len;
    const rx = 1;
    const ry = 0;
    const rz = 0;
    let ux = fy * rz - fz * ry;
    let uy = fz * rx - fx * rz;
    let uz = fx * ry - fy * rx;
    const ul = Math.hypot(ux, uy, uz) || 1;
    ux /= ul;
    uy /= ul;
    uz /= ul;

    const dx = x - cam.camX;
    const dy = y - cam.camY;
    const dz = z - cam.camZ;
    const cx = dx * rx + dy * ry + dz * rz;
    const cy = dx * ux + dy * uy + dz * uz;
    const cz = dx * fx + dy * fy + dz * fz;
    if (cz <= 1) return { x: W / 2, y: H / 2, depth: 1, behind: true };
    const sx = W / 2 + (cx * cam.focal) / cz;
    const sy = H / 2 - (cy * cam.focal) / cz;
    return { x: sx, y: sy, depth: cz, behind: false };
  }

  function dofBlur(depth, focusDepth) {
    // front: 75*(focus-depth)/depth ; behind: 6*(depth-focus)/depth ; cap 120
    let b;
    if (depth < focusDepth) b = (75 * (focusDepth - depth)) / Math.max(depth, 1);
    else b = (6 * (depth - focusDepth)) / Math.max(depth, 1);
    return clamp(b, 0, 120);
  }

  // ---------- layer animation params ----------
  function layerAnim(layer, t) {
    const kind = layer.kind || "card";
    let lift = 0;
    let stand = 0; // radians, top toward lens
    let opacity = 1;
    const id = layer.id;

    // Keep most lifts tiny by default
    if (kind === "chip" || id.startsWith("hero-chip") || id.startsWith("hero-badge")) {
      // 0.1–1.35: rise 60–80px stand 30°
      const u = smoothstep(0.1, 1.35, t);
      lift = lerp(0, 70, u);
      stand = lerp(0, (30 * Math.PI) / 180, u);
      // 1.35–2.7: chips fly ~200px stand 54°, pass L/R at 2.5
      if (t > 1.35) {
        const u2 = smoothstep(1.35, 2.7, t);
        lift = lerp(70, 200, u2);
        stand = lerp((30 * Math.PI) / 180, (54 * Math.PI) / 180, u2);
      }
    } else if (id === "hero-mockup") {
      const u = smoothstep(0.15, 1.2, t);
      lift = lerp(0, 36, u);
      stand = lerp(0, (18 * Math.PI) / 180, u);
    } else if (id.startsWith("hero-btn")) {
      const u = smoothstep(0.2, 1.0, t);
      lift = lerp(0, 24, u);
      stand = lerp(0, (12 * Math.PI) / 180, u);
    } else if (id.startsWith("feature") || id.startsWith("how") || id.startsWith("problem")) {
      // 1.35–2.7 photos lift 100–130 stand 46° — but keep many tiny
      const delay = (parseInt(id.split("-")[1] || "0", 10) % 3) * 0.12;
      const u = smoothstep(1.35 + delay, 2.7 + delay, t);
      const big = id.startsWith("feature") && parseInt(id.split("-")[1] || "0", 10) < 3;
      lift = lerp(0, big ? 115 : 32, u);
      stand = lerp(0, ((big ? 46 : 16) * Math.PI) / 180, u);
    } else if (id.startsWith("testimonial")) {
      // 5.45–6.3: rises 22→112 stand 30°
      const idx = parseInt(id.split("-")[1] || "0", 10);
      const u = smoothstep(5.45 + idx * 0.08, 6.3 + idx * 0.08, t);
      lift = lerp(22, 112, u) * (t < 5.45 ? 0 : 1);
      if (t < 5.45) lift = 0;
      stand = lerp(0, (30 * Math.PI) / 180, u);
    } else if (id.startsWith("pricing")) {
      const u = smoothstep(6.4, 7.2, t);
      lift = lerp(0, 28, u);
      stand = lerp(0, (14 * Math.PI) / 180, u);
    }

    // Fade into haze when leaving frame mid-flight
    if (t > 3.5 && t < 9.0) {
      // subtle — handled via DOF mostly
    }

    // During dive, fade below-hero content into haze then cut
    return { lift, stand, opacity };
  }

  // Logo tiles — four 32px, grow 140–200, hang outside page top corners
  function logoTiles(t, cam, layout) {
    const tiles = [];
    if (t < 0.1) return tiles;
    const liftU = smoothstep(0.1, 1.35, t);
    const size = lerp(32, lerp(140, 200, 0.5), liftU);
    const pageW = layout.pageWidth;

    // Trail camera 300px down 1.2–2.4 then drift out top
    let trailY = 0;
    if (t >= 1.2 && t < 2.4) trailY = ((t - 1.2) / 1.2) * 300;
    else if (t >= 2.4) trailY = 300;

    const driftOut = smoothstep(2.2, 3.2, t);
    const baseY = cam.lookY - 180 - trailY - driftOut * 400;
    const hang = 80 + liftU * 120;

    const positions = [
      { x: -hang, y: baseY, blur: 0 },
      { x: pageW + hang - size, y: baseY + 40, blur: 0 },
      { x: -hang * 0.6, y: baseY + 220, blur: 8 },
      { x: pageW + hang * 0.5, y: baseY + 280, blur: 12 },
    ];

    // At 5.4 one past left blurred
    if (t > 5.0 && t < 6.5) {
      positions[2].x = cam.lookX - 500;
      positions[2].y = cam.lookY;
      positions[2].blur = 40;
    }

    // Dive: 2 on top corners crisp, 2 huge soft blurs bottom
    if (t >= 9.47) {
      const e = clamp((t - 9.47) / 0.5, 0, 1);
      positions[0] = { x: 80, y: 40, blur: 0, screenPx: true, size: 48 };
      positions[1] = { x: W - 120, y: 50, blur: 2, screenPx: true, size: 52 };
      positions[2] = { x: 40, y: H - 180, blur: 70, screenPx: true, size: 220 };
      positions[3] = { x: W - 260, y: H - 200, blur: 90, screenPx: true, size: 260 };
      // drift during hold
      if (t > 10.6) {
        const d = (t - 10.6) * 4;
        positions[0].x -= d;
        positions[1].x += d;
        positions[2].y += d * 0.5;
        positions[3].y += d * 0.4;
      }
    }

    for (const p of positions) {
      tiles.push({
        ...p,
        size: p.size || size,
        z: 40 + liftU * 80,
      });
    }
    return tiles;
  }

  // ---------- title overlay (DOM, driven by seek — no CSS transitions) ----------
  function setupTitleWords() {
    line1El.innerHTML = "";
    line2El.innerHTML = "";
    config.closingLine.split(/\s+/).forEach((word) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = word;
      line1El.appendChild(s);
    });
    config.italicTail.split(/\s+/).forEach((word) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = word;
      line2El.appendChild(s);
    });
  }

  function applyTitle(t) {
    const words1 = line1El.querySelectorAll(".w");
    const words2 = line2El.querySelectorAll(".w");

    if (t < 10.02) {
      badgeEl.style.display = "none";
    } else {
      badgeEl.style.display = "flex";
      const fade = clamp((t - 10.02) / 0.25, 0, 1);
      badgeEl.style.opacity = String(fade);
    }

    // line1 at 10.12, one word / 0.06s
    words1.forEach((el, i) => {
      const start = 10.12 + i * 0.06;
      const u = clamp((t - start) / 0.34, 0, 1);
      const e = easeOutQuad(u);
      el.style.opacity = String(e);
      el.style.filter = `blur(${(1 - e) * 12}px)`;
      el.style.transform = `translateY(${(1 - e) * 16}px)`;
    });

    // italic at 10.36, one word / 0.05s
    words2.forEach((el, i) => {
      const start = 10.36 + i * 0.05;
      const u = clamp((t - start) / 0.34, 0, 1);
      const e = easeOutQuad(u);
      el.style.opacity = String(e);
      el.style.filter = `blur(${(1 - e) * 12}px)`;
      el.style.transform = `translateY(${(1 - e) * 16}px)`;
    });

    // Position title below badge during card phase — shift down near hero card
    if (t >= 9.97) {
      line1El.style.top = "520px";
      line2El.style.top = "610px";
      badgeEl.style.top = "44px";
    } else {
      line1El.style.top = "74px";
      line2El.style.top = "164px";
    }
  }

  // ---------- draw helpers ----------
  function drawBackground() {
    gl.useProgram(PROG_BG);
    const uRes = gl.getUniformLocation(PROG_BG, "u_res");
    gl.uniform2f(uRes, W, H);
    gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawShadow(corners, size, round, opacity, blurExpand) {
    // Expand corners outward for soft shadow footprint
    const cx = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
    const cy = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;
    const exp = blurExpand || 8;
    const expand = (p) => ({
      x: cx + (p.x - cx) * 1.02 + (p.x - cx > 0 ? exp : -exp) * 0.15,
      y: cy + (p.y - cy) * 1.02 + exp * 0.5,
    });
    const e0 = expand(corners[0]),
      e1 = expand(corners[1]),
      e2 = expand(corners[2]),
      e3 = expand(corners[3]);

    gl.useProgram(PROG_SHADOW);
    gl.uniform2f(gl.getUniformLocation(PROG_SHADOW, "u_res"), W, H);
    gl.uniform2f(gl.getUniformLocation(PROG_SHADOW, "u_p0"), e0.x, e0.y);
    gl.uniform2f(gl.getUniformLocation(PROG_SHADOW, "u_p1"), e1.x, e1.y);
    gl.uniform2f(gl.getUniformLocation(PROG_SHADOW, "u_p2"), e2.x, e2.y);
    gl.uniform2f(gl.getUniformLocation(PROG_SHADOW, "u_p3"), e3.x, e3.y);
    gl.uniform1f(gl.getUniformLocation(PROG_SHADOW, "u_opacity"), opacity);
    gl.uniform1f(gl.getUniformLocation(PROG_SHADOW, "u_round"), round);
    gl.uniform2f(gl.getUniformLocation(PROG_SHADOW, "u_size"), size.w, size.h);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawSprite(tex, corners, opts) {
    const {
      opacity = 1,
      blur = 0,
      round = 0,
      contentSize = { w: 100, h: 100 },
      depth = 1000,
      texSize = { w: 100, h: 100 },
    } = opts;

    gl.useProgram(PROG_SPRITE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(PROG_SPRITE, "u_tex"), 0);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE, "u_res"), W, H);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE, "u_p0"), corners[0].x, corners[0].y);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE, "u_p1"), corners[1].x, corners[1].y);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE, "u_p2"), corners[2].x, corners[2].y);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE, "u_p3"), corners[3].x, corners[3].y);
    gl.uniform1f(gl.getUniformLocation(PROG_SPRITE, "u_opacity"), opacity);
    gl.uniform1f(gl.getUniformLocation(PROG_SPRITE, "u_blurPx"), blur);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE, "u_texSize"), texSize.w, texSize.h);
    gl.uniform1f(gl.getUniformLocation(PROG_SPRITE, "u_round"), round);
    gl.uniform2f(
      gl.getUniformLocation(PROG_SPRITE, "u_contentSize"),
      contentSize.w,
      contentSize.h
    );
    gl.uniform1f(gl.getUniformLocation(PROG_SPRITE, "u_depth"), depth);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /** Corners of a page rectangle lifted by z and stood (rotate about middle, top toward lens) */
  function liftedCorners(x, y, w, h, zLift, stand, cam) {
    // stand: rotate about X through center — top moves toward camera (+Z in page? toward lens)
    // Page plane z=0; lift raises center to zLift. Standing tilts: top gets +dz toward cam, bottom away.
    const cx = x + w / 2;
    const cy = y + h / 2;
    const pts = [
      { lx: -w / 2, ly: -h / 2 }, // TL
      { lx: w / 2, ly: -h / 2 },
      { lx: w / 2, ly: h / 2 },
      { lx: -w / 2, ly: h / 2 },
    ];
    const cos = Math.cos(stand);
    const sin = Math.sin(stand);
    return pts.map((p) => {
      // rotate about X (horizontal axis through center): ly→ly', z→z'
      const ly = p.ly * cos;
      const lz = zLift + p.ly * sin; // top (ly negative in page-down?) wait: page y increases down
      // Top of card has smaller y. "Top toward lens" → smaller y gets +z toward camera.
      // Camera is above (+z) and toward +y. Top toward lens means top rises in z.
      // If ly is relative with -h/2 = top: lz = zLift + (-ly_page? )
      // Using: top (negative local y if y-down... we defined ly=-h/2 as TL)
      // stand positive: TL (ly=-h/2) → lz = zLift - (-h/2)*sin = zLift + (h/2)*sin  if we use lz = zLift - ly*sin
      const lz2 = zLift - p.ly * sin;
      const ly2 = p.ly * cos;
      return project(cx + p.lx, cy + ly2, lz2, cam);
    });
  }

  // ---------- state ----------
  let layout = null;
  let pageTex = null;
  let pageImg = null;
  let logoTex = null;
  let logoImg = null;
  let layerTex = {};
  let layerImg = {};
  let ready = false;
  let lastT = 0;

  async function init() {
    try {
      const cfg = await fetch("../config.json").then((r) => r.json());
      config = {
        brand: cfg.brand || config.brand,
        closingLine: (cfg.title && cfg.title.line1) || cfg.closingLine || config.closingLine,
        italicTail: (cfg.title && cfg.title.line2) || cfg.italicTail || config.italicTail,
      };
      const badgeSpan = badgeEl.querySelector("span");
      if (badgeSpan) badgeSpan.textContent = config.brand;
    } catch (e) {
      console.warn("config.json missing, using defaults", e);
    }
    setupTitleWords();
    const layoutUrl = "../capture/layout.json";
    layout = await fetch(layoutUrl).then((r) => r.json());

    pageImg = await loadImage("../capture/page.png");
    pageTex = texFromImage(pageImg);

    try {
      logoImg = await loadImage("../assets/logo.png");
      logoTex = texFromImage(logoImg);
    } catch (e) {
      console.warn("logo missing", e);
    }

    for (const layer of layout.layers) {
      const file = layer.file || `layers/${layer.id}.png`;
      try {
        const img = await loadImage(`../capture/${file}`);
        layerImg[layer.id] = img;
        layerTex[layer.id] = texFromImage(img);
      } catch (e) {
        console.warn("layer missing", layer.id, e);
      }
    }

    ready = true;
    hud.textContent = "ready — seek(t)";
    window.seek(0);
  }

  function seek(t) {
    t = clamp(+t || 0, 0, DURATION);
    lastT = t;
    if (!ready) {
      hud.textContent = `loading… t=${t.toFixed(2)}`;
      return;
    }

    const cam = cameraAt(t, layout);
    const scale = layout.scale || 2;
    const pageW = layout.pageWidth;
    const pageH = layout.pageHeight;

    // Focus depth: what crosses frame middle
    const mid = project(cam.lookX, cam.lookY, 0, cam);
    const focusDepth = mid.depth;

    gl.viewport(0, 0, W, H);
    gl.clearColor(0.949, 0.953, 0.965, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawBackground();

    // Page shadow
    const pageCornersFlat = [
      project(0, 0, 0, cam),
      project(pageW, 0, 0, cam),
      project(pageW, pageH, 0, cam),
      project(0, pageH, 0, cam),
    ];
    // Soft wide shadow under page
    const shadowOff = { x: 0, y: 18 };
    const shadowCorners = pageCornersFlat.map((p) => ({
      x: p.x + shadowOff.x,
      y: p.y + shadowOff.y,
    }));
    drawShadow(shadowCorners, { w: pageW, h: pageH }, PAGE_RADIUS * scale, 0.18, 28);

    // Page quad (masked during dive)
    const mr = cam.maskRect;
    const pageDrawCorners = [
      project(mr.x, mr.y, 0, cam),
      project(mr.x + mr.w, mr.y, 0, cam),
      project(mr.x + mr.w, mr.y + mr.h, 0, cam),
      project(mr.x, mr.y + mr.h, 0, cam),
    ];
    // UV rect over page texture for mask region
    // Our sprite uses full texture UVs 0..1 — for dive we need sub-rect.
    // Approximate: scale corners already to mask; sample full page with UV mapped to mask.
    // Custom: temporarily draw with UV offset via rebuilding — for simplicity draw full page
    // and rely on corner positions = mask during dive (UV still 0..1 stretches hero region).
    // Better approach: pass uv rect. Extend drawSprite... For dive morph, map mask to tex UVs:
    const uv0 = { u: mr.x / pageW, v: mr.y / pageH };
    // We'll use a quick second path: draw page with UV remap by adjusting via canvas... 
    // Simpler faithful approach: always draw full page corners when diveU==0;
    // when diving, draw hero-sized card using page texture (stretched hero band).

    let pageBlur = dofBlur(pageDrawCorners[0].depth, focusDepth);
    // Razor thin DOF in front — page mostly behind focus mid → small blur
    pageBlur *= 0.35;

    // During dive fade below-hero haze
    let pageOpacity = 1;
    if (cam.diveU > 0) {
      pageOpacity = lerp(1, 1, 1); // card stays
    }

    // Draw page — for dive use masked rect corners but UV of that region:
    drawPageRegion(pageTex, pageImg, mr, cam, pageBlur, pageOpacity, cam.maskRadius * scale, focusDepth);

    // White edge on testimonials during lift
    // Layers: sort by y + lift (lowest first), no depth buffer
    const layers = layout.layers
      .map((L) => {
        const anim = layerAnim(L, t);
        return { L, anim, sortY: L.y - anim.lift * 0.01 };
      })
      .sort((a, b) => a.sortY - b.sortY);

    for (const { L, anim } of layers) {
      const tex = layerTex[L.id];
      const img = layerImg[L.id];
      if (!tex || !img) continue;

      // Skip layers far below mask during dive / fade to haze
      if (cam.diveU > 0.2 && L.y > (layout.hero?.y || 0) + (layout.hero?.h || 400)) {
        const haze = cam.showBelow;
        if (haze < 0.05) continue;
        anim.opacity *= haze;
      }

      const pad = L.pad || 28;
      const z = anim.lift;
      // Shadow: offset (0.10z, 4+0.36z), blur 7+0.5z, 26% opacity
      const shCorners = liftedCorners(L.x, L.y, L.w, L.h, 0, 0, cam).map((p, i) => {
        const base = liftedCorners(L.x, L.y, L.w, L.h, 0, anim.stand * 0.2, cam)[i];
        return {
          x: base.x + 0.1 * z,
          y: base.y + 4 + 0.36 * z,
        };
      });
      drawShadow(
        shCorners,
        { w: L.w, h: L.h },
        16,
        0.26 * anim.opacity,
        7 + 0.5 * z
      );

      const corners = liftedCorners(L.x, L.y, L.w, L.h, z, anim.stand, cam);
      const depth = corners[0].depth;
      let blur = dofBlur(depth, focusDepth);
      // Extra white edge for testimonials
      const round =
        L.kind === "testimonial" || L.id.startsWith("testimonial")
          ? 34 * scale * 0.35
          : 16 * scale * 0.5;

      drawSprite(tex, corners, {
        opacity: anim.opacity,
        blur,
        round,
        contentSize: { w: img.width, h: img.height },
        depth,
        texSize: { w: img.width, h: img.height },
      });
    }

    // Logo tiles
    if (logoTex && logoImg) {
      const tiles = logoTiles(t, cam, layout);
      for (const tile of tiles) {
        let corners;
        const s = tile.size;
        if (tile.screenPx) {
          corners = [
            { x: tile.x, y: tile.y, depth: 800 },
            { x: tile.x + s, y: tile.y, depth: 800 },
            { x: tile.x + s, y: tile.y + s, depth: 800 },
            { x: tile.x, y: tile.y + s, depth: 800 },
          ];
        } else {
          corners = liftedCorners(tile.x, tile.y, s, s, tile.z, 0.15, cam);
        }
        drawSprite(logoTex, corners, {
          opacity: 0.95,
          blur: tile.blur || 0,
          round: 0,
          contentSize: { w: logoImg.width, h: logoImg.height },
          depth: corners[0].depth || 800,
          texSize: { w: logoImg.width, h: logoImg.height },
        });
      }
    }

    applyTitle(t);
    hud.textContent = `t=${t.toFixed(3)}s  scroll=${cam.scroll.toFixed(0)}  dist=${cam.dist.toFixed(0)}  tilt=${((cam.tilt * 180) / Math.PI).toFixed(1)}°`;
  }

  function drawPageRegion(tex, img, rect, cam, blur, opacity, roundPx, focusDepth) {
    const corners = [
      project(rect.x, rect.y, 0, cam),
      project(rect.x + rect.w, rect.y, 0, cam),
      project(rect.x + rect.w, rect.y + rect.h, 0, cam),
      project(rect.x, rect.y + rect.h, 0, cam),
    ];
    const tw = tex._w || img.width;
    const th = tex._h || img.height;
    drawSpriteUV(tex, corners, {
      opacity,
      blur,
      round: roundPx,
      contentSize: { w: rect.w * (layout.scale || 2), h: rect.h * (layout.scale || 2) },
      texSize: { w: tw, h: th },
      uvRect: {
        x: rect.x / layout.pageWidth,
        y: rect.y / layout.pageHeight,
        w: rect.w / layout.pageWidth,
        h: rect.h / layout.pageHeight,
      },
    });
  }

  // Sprite with UV rect
  const PROG_SPRITE_UV = program(
    `#version 300 es
    layout(location=0) in vec2 a_uv;
    uniform vec2 u_p0, u_p1, u_p2, u_p3;
    uniform vec2 u_res;
    uniform vec4 u_uvRect;
    out vec2 v_uv;
    void main(){
      vec2 a = mix(u_p0, u_p1, a_uv.x);
      vec2 b = mix(u_p3, u_p2, a_uv.x);
      vec2 p = mix(a, b, a_uv.y);
      vec2 ndc = vec2((p.x / u_res.x)*2.0 - 1.0, 1.0 - (p.y / u_res.y)*2.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
      v_uv = u_uvRect.xy + a_uv * u_uvRect.zw;
    }`,
    `#version 300 es
    precision highp float;
    in vec2 v_uv;
    uniform sampler2D u_tex;
    uniform float u_opacity;
    uniform float u_blurPx;
    uniform vec2 u_texSize;
    uniform float u_round;
    uniform vec2 u_contentSize;
    out vec4 o;
    const float GOLD = 2.399963229728653;
    vec4 sampleBlur(vec2 uv, float radius){
      if(radius < 0.5) return texture(u_tex, uv);
      float lod = log2(max(radius * 0.35, 1.0));
      vec4 acc = vec4(0.0);
      float wsum = 0.0;
      for(int i=0;i<40;i++){
        float fi = float(i);
        float r = sqrt((fi+0.5)/40.0);
        float a = fi * GOLD;
        vec2 off = vec2(cos(a), sin(a)) * r * radius;
        float w = 1.0 - r*0.35;
        acc += textureLod(u_tex, uv + off / u_texSize, lod) * w;
        wsum += w;
      }
      return acc / wsum;
    }
    float roundMask(vec2 uv){
      // uv here is already page UV — remap to local 0..1 of content via contentSize approximation
      // Use fract of normalized — actually v_uv is in page tex space; for round use a_uv style:
      return 1.0; // corners handled approximately; soft page edge via separate
    }
    void main(){
      vec4 c = sampleBlur(v_uv, u_blurPx);
      float a = c.a * u_opacity;
      // soft page edge: darken alpha near 0/1 of uvRect is hard without local uv —
      o = vec4(c.rgb * a, a);
    }`
  );

  function drawSpriteUV(tex, corners, opts) {
    const {
      opacity = 1,
      blur = 0,
      round = 24,
      contentSize = { w: 100, h: 100 },
      texSize = { w: 100, h: 100 },
      uvRect = { x: 0, y: 0, w: 1, h: 1 },
    } = opts;
    gl.useProgram(PROG_SPRITE_UV);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(PROG_SPRITE_UV, "u_tex"), 0);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE_UV, "u_res"), W, H);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE_UV, "u_p0"), corners[0].x, corners[0].y);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE_UV, "u_p1"), corners[1].x, corners[1].y);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE_UV, "u_p2"), corners[2].x, corners[2].y);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE_UV, "u_p3"), corners[3].x, corners[3].y);
    gl.uniform1f(gl.getUniformLocation(PROG_SPRITE_UV, "u_opacity"), opacity);
    gl.uniform1f(gl.getUniformLocation(PROG_SPRITE_UV, "u_blurPx"), blur);
    gl.uniform2f(gl.getUniformLocation(PROG_SPRITE_UV, "u_texSize"), texSize.w, texSize.h);
    gl.uniform1f(gl.getUniformLocation(PROG_SPRITE_UV, "u_round"), round);
    gl.uniform2f(
      gl.getUniformLocation(PROG_SPRITE_UV, "u_contentSize"),
      contentSize.w,
      contentSize.h
    );
    gl.uniform4f(
      gl.getUniformLocation(PROG_SPRITE_UV, "u_uvRect"),
      uvRect.x,
      uvRect.y,
      uvRect.w,
      uvRect.h
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Soft rounded clip via shadow-like mask is skipped; draw a rounded fade using PROG_SHADOW inverted? 
    // Add corner roundness with a second pass mask — for stills, approximate OK.
  }

  window.seek = seek;
  window.exportFrame = function exportFrame() {
    return canvas.toDataURL("image/png");
  };
  window.getFilmTime = () => lastT;
  window.__filmReady = () => ready;

  init().catch((e) => {
    console.error(e);
    hud.textContent = "error: " + e.message;
  });
})();
