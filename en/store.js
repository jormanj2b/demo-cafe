'use strict';
/* Panel demo data (English version). Everything lives in this browser's localStorage: no server, no accounts. */
(function () {
  var KEY = 'almendro-demo-en-v1';
  var BASE_HOURS = [{ d: 'Mon–Fri', h: '8 AM–4 PM' }, { d: 'Sat–Sun', h: '9 AM–3 PM' }];
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.menu)) return s; } catch (e) {}
    return null;
  }
  var saved = load();
  var BASE_MENU = clone(window.MENU || []);
  window.CAFE_STORE = {
    key: KEY,
    edited: !!saved,
    data: function () { return saved ? clone(saved) : { menu: clone(BASE_MENU), hours: clone(BASE_HOURS), note: '' }; },
    save: function (d) { d.t = Date.now(); localStorage.setItem(KEY, JSON.stringify(d)); saved = d; this.edited = true; },
    reset: function () { localStorage.removeItem(KEY); saved = null; this.edited = false; }
  };
  if (document.body.hasAttribute('data-panel') || !saved) return;
  // On the menu: apply the panel's changes and hide sold-out items
  window.MENU = saved.menu.map(function (c) { return { cat: c.cat, items: c.items.filter(function (i) { return !i.off; }) }; });
  document.addEventListener('DOMContentLoaded', function () {
    var h = document.querySelector('.hours');
    if (h && saved.hours) { h.textContent = ''; saved.hours.forEach(function (x) { var s = document.createElement('span'); s.textContent = x.d + ' ' + x.h; h.appendChild(s); }); }
    var bar = document.createElement('div'); bar.className = 'edited-bar'; bar.setAttribute('role', 'status');
    var t = document.createElement('span'); t.textContent = 'You’re seeing the menu with the changes you made in the demo dashboard.';
    var a = document.createElement('a'); a.href = 'panel/'; a.textContent = 'Back to the dashboard';
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Show the original';
    b.addEventListener('click', function () { window.CAFE_STORE.reset(); location.reload(); });
    bar.appendChild(t); bar.appendChild(a); bar.appendChild(b);
    var top = document.querySelector('.top'); top.parentNode.insertBefore(bar, top);
    if (saved.note) { var n = document.createElement('p'); n.className = 'notice'; n.textContent = saved.note; var it = document.querySelector('.intro-text h1'); if (it) it.parentNode.insertBefore(n, it); }
  });
})();
