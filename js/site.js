// Small progressive enhancements. Every section is readable without this script.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  // Theme: follows the system until the visitor picks one.
  var themeBtn = $('#theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      themeBtn.setAttribute('aria-label', 'Switch to ' + (next === 'dark' ? 'light' : 'dark') + ' theme');
    });
  }

  // Copy buttons (emails, install command, citations).
  function copyText(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn, .cite-btn');
    if (btn) copyText(btn.dataset.copy || btn.dataset.cite || '', btn);
  });

  // Career route: a tab list with arrow-key support.
  $$('[data-route]').forEach(function (route) {
    var tabs = $$('[role="tab"]', route);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (j === undefined) return;
        e.preventDefault();
        select(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
    var current = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
    if (current) {
      var line = current.closest('ol');
      line.scrollLeft = line.scrollWidth;
    }
  });

  // Gallery lightbox.
  var lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    $$('.gal-item').forEach(function (b) {
      b.addEventListener('click', function () {
        var img = $('img', lb);
        img.src = b.dataset.src; img.alt = b.dataset.caption;
        $('.lb-cap', lb).textContent = b.dataset.caption;
        lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  // Citations chart: cumulative line, labelled at both ends; hover or focus a year for detail.
  $$('[data-cites]').forEach(function (box) {
    var rows;
    try { rows = JSON.parse($('.cites-data', box).textContent); } catch (e) { return; }
    if (!rows || !rows.length) return;
    var plot = $('.cites-plot', box), tip = $('.cites-tip', box);
    var NS = 'http://www.w3.org/2000/svg';
    var H = 200, m = { t: 26, r: 22, b: 26, l: 22 }, ih = H - m.t - m.b;
    // Citations from before the first charted year start the line, so it ends at Scholar's total.
    var cum = parseInt(box.dataset.start, 10) || 0;
    rows = rows.map(function (r) { cum += r.citations; return { year: r.year, v: r.citations, c: cum }; });
    function el(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }
    function hideTip() {
      tip.hidden = true;
      $$('.on', plot).forEach(function (n) { n.classList.remove('on'); });
      $$('.guide', plot).forEach(function (n) { n.setAttribute('opacity', 0); });
    }
    function draw() {
      var W = Math.max(280, Math.round(plot.clientWidth)), iw = W - m.l - m.r;
      plot.textContent = '';
      var max = rows[rows.length - 1].c || 1;
      var x = function (i) { return m.l + (rows.length === 1 ? iw / 2 : iw * i / (rows.length - 1)); };
      var y = function (v) { return m.t + ih - (v / max) * ih; };
      var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Cumulative citations by year' }, plot);
      el('line', { 'class': 'base', x1: m.l, x2: W - m.r, y1: y(0), y2: y(0) }, svg);
      var pts = rows.map(function (r, i) { return x(i) + ',' + y(r.c); });
      el('path', { 'class': 'area', d: 'M' + x(0) + ',' + y(0) + 'L' + pts.join('L') + 'L' + x(rows.length - 1) + ',' + y(0) + 'Z' }, svg);
      el('path', { 'class': 'ln', d: 'M' + pts.join('L') }, svg);
      var guides = [], dots = [];
      rows.forEach(function (r, i) {
        el('text', { 'class': 'axis', x: x(i), y: H - 6, 'text-anchor': 'middle' }, svg).textContent = "'" + String(r.year).slice(2);
        guides.push(el('line', { 'class': 'guide', x1: x(i), x2: x(i), y1: m.t - 6, y2: y(0), opacity: 0 }, svg));
      });
      rows.forEach(function (r, i) { dots.push(el('circle', { 'class': 'dot', cx: x(i), cy: y(r.c), r: 4.5 }, svg)); });
      var first = rows[0], last = rows[rows.length - 1];
      el('text', { 'class': 'val', x: x(0), y: y(first.c) - 10, 'text-anchor': 'start' }, svg).textContent = first.c;
      el('text', { 'class': 'val', x: x(rows.length - 1), y: y(last.c) - 10, 'text-anchor': 'end' }, svg).textContent = last.c;
      var band = rows.length > 1 ? iw / (rows.length - 1) : iw;
      rows.forEach(function (r, i) {
        var hit = el('rect', { 'class': 'hit', x: x(i) - band / 2, y: 0, width: band, height: H, tabindex: 0,
          'aria-label': r.year + ': ' + r.c + ' cumulative citations, ' + r.v + ' that year' }, svg);
        function show() {
          hideTip();
          dots[i].classList.add('on'); guides[i].setAttribute('opacity', 1);
          var pr = plot.getBoundingClientRect(), br = box.getBoundingClientRect(), k = pr.width / W;
          tip.textContent = r.c + ' by end of ' + r.year;
          var sub = document.createElement('span');
          sub.textContent = '+' + r.v + ' in ' + r.year;
          tip.appendChild(sub);
          var left = pr.left - br.left + x(i) * k;
          tip.style.left = Math.min(Math.max(left, 70), br.width - 70) + 'px';
          tip.style.top = (pr.top - br.top + y(r.c) * k - 12) + 'px';
          tip.hidden = false;
        }
        hit.addEventListener('mouseenter', show);
        hit.addEventListener('focus', show);
        hit.addEventListener('click', show);
        hit.addEventListener('mouseleave', hideTip);
        hit.addEventListener('blur', hideTip);
      });
    }
    plot.removeAttribute('aria-hidden');
    draw();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { hideTip(); draw(); }, 150); });
  });

  // Contact form: submit in place when possible, fall back to a normal POST.
  var form = $('#contact-form');
  if (form && window.fetch) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('.form-status', form);
      var btn = $('button[type="submit"]', form);
      btn.disabled = true; status.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset(); status.textContent = 'Thanks. Your message was sent, and I will reply by email.';
        })
        .catch(function () {
          status.textContent = 'The message could not be sent. Please email me directly at the address on the left.';
        })
        .then(function () { btn.disabled = false; });
    });
  }

  // Highlight the nav link for the section in view (home page only).
  var navLinks = $$('.nav a[href^="./#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    navLinks.forEach(function (a) { var s = document.getElementById(a.hash.slice(1)); if (s) map[s.id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-here'); });
        if (map[en.target.id]) map[en.target.id].classList.add('is-here');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  // Publications filters: research line, free-text search, #E style deep links.
  var chips = $$('.fchip');
  if (chips.length) {
    var search = $('#pub-search');
    var count = $('#pub-count');
    var items = $$('.pub-groups .pub');
    var line = 'all';
    function apply() {
      var q = (search.value || '').trim().toLowerCase();
      var shown = 0;
      items.forEach(function (li) {
        var ok = (line === 'all' || li.dataset.line === line) && (!q || li.textContent.toLowerCase().indexOf(q) !== -1);
        li.hidden = !ok;
        if (ok) shown++;
      });
      $$('[data-group]').forEach(function (g) {
        var vis = $$('.pub', g).filter(function (li) { return !li.hidden; }).length;
        g.hidden = vis === 0;
      });
      count.textContent = shown + ' of ' + items.length + ' shown';
      $('#pub-empty').hidden = shown !== 0;
    }
    function setLine(l) {
      line = l;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.line === l); });
      apply();
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        setLine(c.dataset.line);
        try { history.replaceState(null, '', c.dataset.line === 'all' ? location.pathname : '#' + c.dataset.line); } catch (e) {}
      });
    });
    search.addEventListener('input', apply);
    var h = location.hash.slice(1);
    setLine(chips.some(function (c) { return c.dataset.line === h; }) ? h : 'all');
  }
})();

// Home hero: an electric bus network. Buses run their routes, drain their batteries and
// recharge at depots (the bolts). Purely decorative; a still frame is drawn when motion is reduced.
(function () {
  'use strict';
  var canvas = document.querySelector('.hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Routes on a 24 x 8 grid, drawn with 45-degree bends like a transit map.
  var ROUTES = [
    { c: '--line-E', pts: [[13.2, 7], [15.2, 7], [17.2, 5], [20.5, 5], [23, 2.5], [25, 2.5]], depot: 0 },
    { c: '--line-F', pts: [[14, 0.8], [16.5, 0.8], [19.7, 4], [21.2, 4], [23.7, 6.5], [25, 6.5]], depot: 0 },
    { c: '--line-I', pts: [[13.6, 3.6], [15.4, 3.6], [17, 2], [19.5, 2]], depot: 0 }
  ];
  var routes = [], buses = [], colors = {}, W = 0, H = 0, running = false, last = 0;
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    ['--line-E', '--line-F', '--line-I', '--ink', '--bg', '--surface', '--accent'].forEach(function (k) { colors[k] = cs.getPropertyValue(k).trim(); });
  }
  function layout() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var gx = W / 24, gy = H / 8.5;
    routes = ROUTES.map(function (rt) {
      var pts = rt.pts.map(function (p) { return [p[0] * gx, (p[1] + 0.5) * gy]; });
      var segs = [], len = 0;
      for (var i = 1; i < pts.length; i++) {
        var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], l = Math.hypot(dx, dy);
        segs.push({ a: pts[i - 1], b: pts[i], l: l, s: len }); len += l;
      }
      return { c: rt.c, pts: pts, segs: segs, len: len, depot: rt.depot };
    });
    if (!buses.length) {
      routes.forEach(function (rt, ri) {
        buses.push({ r: ri, d: rt.len * 0.15, dir: 1, soc: 0.9, wait: 0 });
        if (rt.len > W * 0.3) buses.push({ r: ri, d: rt.len * 0.7, dir: -1, soc: 0.5, wait: 0 });
      });
    }
  }
  function at(rt, d) {
    d = Math.max(0, Math.min(rt.len, d));
    for (var i = 0; i < rt.segs.length; i++) {
      var s = rt.segs[i];
      if (d <= s.s + s.l || i === rt.segs.length - 1) {
        var t = s.l ? (d - s.s) / s.l : 0;
        return { x: s.a[0] + (s.b[0] - s.a[0]) * t, y: s.a[1] + (s.b[1] - s.a[1]) * t, ang: Math.atan2(s.b[1] - s.a[1], s.b[0] - s.a[0]) };
      }
    }
  }
  function bolt(x, y, s, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + 0.15 * s, y - 0.5 * s); ctx.lineTo(x - 0.25 * s, y + 0.08 * s); ctx.lineTo(x + 0.02 * s, y + 0.08 * s);
    ctx.lineTo(x - 0.12 * s, y + 0.5 * s); ctx.lineTo(x + 0.28 * s, y - 0.1 * s); ctx.lineTo(x + 0.02 * s, y - 0.1 * s);
    ctx.closePath(); ctx.fill();
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    routes.forEach(function (rt) {
      ctx.strokeStyle = colors[rt.c]; ctx.lineWidth = 7; ctx.globalAlpha = 0.85;
      ctx.beginPath(); rt.pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
      ctx.globalAlpha = 1;
      rt.pts.forEach(function (p, i) {
        ctx.fillStyle = colors['--surface']; ctx.strokeStyle = colors['--ink']; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(p[0], p[1], i === rt.depot ? 11 : 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (i === rt.depot) bolt(p[0], p[1], 14, colors[rt.c]);
      });
    });
    buses.forEach(function (b) {
      var rt = routes[b.r], p = at(rt, b.d);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang + (b.dir < 0 ? Math.PI : 0));
      ctx.fillStyle = colors['--ink'];
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-11, -6, 22, 12, 3) : ctx.rect(-11, -6, 22, 12); ctx.fill();
      ctx.fillStyle = colors[rt.c]; ctx.fillRect(-8, -3, 16 * b.soc, 6);
      ctx.restore();
      if (b.wait > 0) {
        var pulse = (t / 600) % 1;
        ctx.strokeStyle = colors[rt.c]; ctx.globalAlpha = 1 - pulse; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 12 + pulse * 16, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
    });
  }
  function step(dt) {
    buses.forEach(function (b) {
      var rt = routes[b.r], depotD = rt.depot === 0 ? 0 : rt.len;
      if (b.wait > 0) { b.wait -= dt; b.soc = Math.min(1, b.soc + dt / 1800); if (b.wait <= 0) b.dir = depotD === 0 ? 1 : -1; return; }
      b.d += b.dir * dt * 0.028; b.soc = Math.max(0.08, b.soc - dt / 26000);
      if (b.d <= 0 || b.d >= rt.len) {
        b.d = Math.max(0, Math.min(rt.len, b.d));
        if (Math.abs(b.d - depotD) < 1) b.wait = 1600; else b.dir *= -1;
      }
    });
  }
  function frame(t) {
    if (!running) return;
    var dt = Math.min(64, t - (last || t)); last = t;
    step(dt); draw(t);
    requestAnimationFrame(frame);
  }
  function start() { if (running || reduce.matches) return; running = true; last = 0; requestAnimationFrame(frame); }
  function stop() { running = false; }
  readColors(); layout(); draw(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(canvas);
  } else start();
  var rz;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); draw(0); }, 120); });
  new MutationObserver(function () { readColors(); draw(0); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readColors(); draw(0); });
  reduce.addEventListener('change', function () { reduce.matches ? (stop(), draw(0)) : start(); });
})();
