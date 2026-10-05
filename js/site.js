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
