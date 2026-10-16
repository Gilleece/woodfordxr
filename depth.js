/* The landing title as a stereo point cloud.
   DEPTHRAY is sampled from the loaded typeface into dots. Each dot gets a depth,
   and is drawn twice: red for the left eye, cyan for the right, offset by its depth,
   so the title is a real anaglyph. It loads flat (white) and then gains depth. */
(function () {
  'use strict';
  var canvas = document.querySelector('canvas.cloud');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var hero = canvas.parentElement;
  var foot = hero.querySelector('.hero-foot');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(pointer: fine)').matches;
  var RED = '255,61,51', CYAN = '25,210,230';
  var W = 0, H = 0, CY = 0, dpr = 1, step = 7, size = 3, FS = 100, HW = 0;
  var px = [], py = [], seed = [];
  var sx = null, sy = null, sd = null, ss = null;
  var yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, depth = reduce.matches ? 1 : 0;
  var t0 = 0, raf = 0, running = false, frames = 0, slow = 0, lastNow = 0;
  var spriteR, spriteC;

  function sprite(rgb) {
    var c = document.createElement('canvas'), r = 24;
    c.width = c.height = r * 2;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, 'rgba(' + rgb + ',1)');
    grd.addColorStop(0.4, 'rgba(' + rgb + ',.9)');
    grd.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    CY = (H - (foot ? foot.offsetHeight : 0)) / 2;
    var word = 'DEPTHRAY', off = document.createElement('canvas'), o = off.getContext('2d');
    var font = function (fs) { return '900 ' + fs + 'px Archivo, "Arial Black", Arial, sans-serif'; };
    o.font = font(100);
    if ('fontStretch' in o) o.fontStretch = 'expanded';
    var w100 = o.measureText(word).width;
    var gutter = Math.max(18, Math.min(W * 0.04, 56));
    var fs = 100 * (W - 2 * gutter) / w100;
    fs = Math.min(fs, CY * 1.6);
    var targetW = fs * w100 / 100;
    FS = fs; HW = targetW / 2;
    step = Math.max(4, Math.min(11, Math.round(fs / 26)));
    off.width = Math.ceil(targetW + step * 4); off.height = Math.ceil(fs * 1.15);
    o = off.getContext('2d');
    o.font = font(fs);
    if ('fontStretch' in o) o.fontStretch = 'expanded';
    o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#fff';
    o.fillText(word, off.width / 2, off.height / 2);
    var data = o.getImageData(0, 0, off.width, off.height).data;
    px = []; py = []; seed = [];
    for (var y = step >> 1; y < off.height; y += step) {
      for (var x = step >> 1; x < off.width; x += step) {
        if (data[(y * off.width + x) * 4 + 3] > 110) {
          px.push(x - off.width / 2); py.push(y - off.height / 2); seed.push(Math.random());
        }
      }
    }
    var n = px.length;
    sx = new Float32Array(n); sy = new Float32Array(n); sd = new Float32Array(n); ss = new Float32Array(n);
    size = step * 0.62;
    spriteR = sprite(RED); spriteC = sprite(CYAN);
  }

  function ease(u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  function frame(now) {
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;
    if (!reduce.matches) {
      depth = Math.max(0, Math.min(1, (t - 0.4) / 2.2));
      if (!fine) { tYaw = 0.1 * Math.sin(t * 0.33); tPitch = 0.06 * Math.sin(t * 0.21); }
      yaw += (tYaw - yaw) * 0.06; pitch += (tPitch - pitch) * 0.06;
    }
    var cy = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var small = Math.min(1, FS / 160), f = Math.max(W, H) * 1.5, amp = FS * (0.09 + 0.07 * small), tt = reduce.matches ? 0 : t * 0.45;
    // the conversion sweeps left to right: dots behind the sweep line have depth
    var band = FS * 1.2, sweep = -HW - band + (2 * HW + 2 * band) * depth, dl;
    var n = px.length, i, x, y, z, x1, z1, y2, z2, sc;
    for (i = 0; i < n; i++) {
      x = px[i]; y = py[i];
      dl = Math.max(0, Math.min(1, (sweep - x) / band)); dl = dl * dl * (3 - 2 * dl);
      z = amp * dl * (0.6 * Math.sin(x * 0.011 + tt) * Math.cos(y * 0.019 - tt * 0.8) + 0.4 * Math.sin((x + y) * 0.0065 - tt * 1.3));
      x1 = x * cy + z * sy_; z1 = -x * sy_ + z * cy;
      y2 = y * cp - z1 * sp; z2 = y * sp + z1 * cp;
      sc = f / (f - z2);
      sx[i] = W / 2 + x1 * sc; sy[i] = CY + y2 * sc;
      sd[i] = z2 * (0.06 + 0.08 * small);
      ss[i] = size * sc * (0.85 + 0.3 * seed[i]);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    var d;
    for (i = 0; i < n; i++) { d = ss[i]; ctx.drawImage(spriteR, sx[i] + sd[i] - d, sy[i] - d, d * 2, d * 2); }
    for (i = 0; i < n; i++) { d = ss[i]; ctx.drawImage(spriteC, sx[i] - sd[i] - d, sy[i] - d, d * 2, d * 2); }
    ctx.globalCompositeOperation = 'source-over';
    // adapt: if frames are slow, thin the cloud
    if (lastNow && now - lastNow > 30 && ++slow > 40 && step < 12) { step += 2; slow = 0; build(); }
    lastNow = now;
    if (running && !reduce.matches) raf = requestAnimationFrame(frame);
    else raf = 0;
  }

  function start() {
    build();
    document.documentElement.classList.add('cloud-on');
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build(); if (reduce.matches) frame(performance.now()); }, 150);
  }, { passive: true });
  if (fine) {
    window.addEventListener('pointermove', function (e) {
      tYaw = (e.clientX / window.innerWidth - 0.5) * 0.7;
      tPitch = (e.clientY / window.innerHeight - 0.5) * -0.4;
    }, { passive: true });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (!running) { running = true; lastNow = 0; raf = requestAnimationFrame(frame); }
  });
  reduce.addEventListener && reduce.addEventListener('change', function () { depth = 1; build(); frame(performance.now()); });

  var ready = (document.fonts && document.fonts.load) ? document.fonts.load('900 100px Archivo') : Promise.resolve();
  var timeout = new Promise(function (r) { setTimeout(r, 2500); });
  Promise.race([ready, timeout]).then(start, start);
})();
