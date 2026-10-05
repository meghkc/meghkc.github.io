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

  // Citations chart: per-year bars or a cumulative line, drawn as SVG on one shared scale.
  $$('[data-cites]').forEach(function (box) {
    var rows;
    try { rows = JSON.parse($('.cites-data', box).textContent); } catch (e) { return; }
    if (!rows || !rows.length) return;
    var plot = $('.cites-plot', box), tip = $('.cites-tip', box), seg = $('.seg', box);
    var NS = 'http://www.w3.org/2000/svg';
    var W, H = 220, m = { t: 24, r: 8, b: 26, l: 34 }, iw, ih = H - m.t - m.b, mode = 'year';
    var cum = 0;
    rows = rows.map(function (r) { cum += r.citations; return { year: r.year, v: r.citations, c: cum }; });
    function el(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }
    function niceMax(v) {
      var mag = Math.pow(10, Math.floor(Math.log10(Math.max(v / 4, 1))));
      var step = [1, 2, 5, 10].map(function (f) { return f * mag; }).filter(function (x) { return x * 4 >= v; })[0];
      return { max: Math.ceil(v / step) * step, step: step };
    }
    function hideTip() { tip.hidden = true; plot.classList.remove('is-hovering'); $$('.on', plot).forEach(function (n) { n.classList.remove('on'); }); $$('.hover-col', plot).forEach(function (n) { n.setAttribute('opacity', 0); }); }
    function draw(md) {
      mode = md || mode;
      W = Math.max(280, Math.round(plot.clientWidth)); iw = W - m.l - m.r;
      plot.textContent = '';
      var key = mode === 'cum' ? 'c' : 'v';
      var sc = niceMax(Math.max.apply(null, rows.map(function (r) { return r[key]; })));
      var y = function (v) { return m.t + ih - (v / sc.max) * ih; };
      var band = iw / rows.length;
      var x = function (i) { return m.l + band * i + band / 2; };
      var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Citations by year' }, plot);
      for (var t = 0; t <= sc.max; t += sc.step) {
        el('line', { 'class': 'grid', x1: m.l, x2: W - m.r, y1: y(t), y2: y(t) }, svg);
        el('text', { 'class': 'axis', x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end' }, svg).textContent = t;
      }
      var cols = [];
      rows.forEach(function (r, i) {
        el('text', { 'class': 'axis', x: x(i), y: H - 6, 'text-anchor': 'middle' }, svg).textContent = r.year;
        cols.push(el('rect', { 'class': 'hover-col', x: m.l + band * i, y: m.t, width: band, height: ih, opacity: 0 }, svg));
      });
      var marks = [];
      if (mode === 'cum') {
        var pts = rows.map(function (r, i) { return x(i) + ',' + y(r.c); });
        el('path', { 'class': 'area', d: 'M' + x(0) + ',' + y(0) + 'L' + pts.join('L') + 'L' + x(rows.length - 1) + ',' + y(0) + 'Z' }, svg);
        el('path', { 'class': 'ln', d: 'M' + pts.join('L') }, svg);
        rows.forEach(function (r, i) { marks.push(el('circle', { 'class': 'dot', cx: x(i), cy: y(r.c), r: 4.5 }, svg)); });
      } else {
        var bw = Math.min(40, band * 0.62), rad = 4;
        rows.forEach(function (r, i) {
          var x0 = x(i) - bw / 2, y0 = y(r.v), h = y(0) - y0, rr = Math.min(rad, h);
          var d = 'M' + x0 + ',' + y(0) + 'V' + (y0 + rr) + 'Q' + x0 + ',' + y0 + ' ' + (x0 + rr) + ',' + y0 +
            'H' + (x0 + bw - rr) + 'Q' + (x0 + bw) + ',' + y0 + ' ' + (x0 + bw) + ',' + (y0 + rr) + 'V' + y(0) + 'Z';
          marks.push(el('path', { 'class': 'bar', d: d }, svg));
        });
      }
      var last = rows[rows.length - 1];
      el('text', { 'class': 'val', x: x(rows.length - 1), y: y(last[key]) - 9, 'text-anchor': 'middle' }, svg).textContent = last[key];
      rows.forEach(function (r, i) {
        var hit = el('rect', { 'class': 'hit', x: m.l + band * i, y: 0, width: band, height: H, tabindex: 0,
          'aria-label': r.year + ': ' + r.v + ' citations, ' + r.c + ' cumulative' }, svg);
        function show() {
          hideTip();
          plot.classList.add('is-hovering'); marks[i].classList.add('on'); cols[i].setAttribute('opacity', 1);
          var pr = plot.getBoundingClientRect(), br = box.getBoundingClientRect(), k = pr.width / W;
          tip.innerHTML = '';
          tip.appendChild(document.createTextNode(mode === 'cum' ? r.c + ' total by ' + r.year : r.v + ' citations in ' + r.year));
          var sub = document.createElement('span');
          sub.textContent = mode === 'cum' ? '+' + r.v + ' that year' : r.c + ' cumulative';
          tip.appendChild(sub);
          tip.style.left = (pr.left - br.left + x(i) * k) + 'px';
          tip.style.top = (pr.top - br.top + y(r[key]) * k - 10) + 'px';
          tip.hidden = false;
        }
        hit.addEventListener('mouseenter', show);
        hit.addEventListener('focus', show);
        hit.addEventListener('click', show);
        hit.addEventListener('mouseleave', hideTip);
        hit.addEventListener('blur', hideTip);
      });
    }
    seg.hidden = false;
    plot.removeAttribute('aria-hidden');
    $$('.seg-btn', seg).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.seg-btn', seg).forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
        hideTip(); draw(b.dataset.mode);
      });
    });
    draw('year');
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
