'use strict';
/* Datos de la demo del panel. Todo vive en localStorage de este navegador: no hay servidor ni cuentas. */
(function () {
  var KEY = 'almendro-demo-v1';
  var BASE_HOURS = [{ d: 'Lun–Vie', h: '8:00–16:00' }, { d: 'Sáb–Dom', h: '9:00–15:00' }];
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
  // En la carta: aplica los cambios del panel y oculta lo marcado como agotado
  window.MENU = saved.menu.map(function (c) { return { cat: c.cat, items: c.items.filter(function (i) { return !i.off; }) }; });
  document.addEventListener('DOMContentLoaded', function () {
    var h = document.querySelector('.hours');
    if (h && saved.hours) { h.textContent = ''; saved.hours.forEach(function (x) { var s = document.createElement('span'); s.textContent = x.d + ' ' + x.h; h.appendChild(s); }); }
    var bar = document.createElement('div'); bar.className = 'edited-bar'; bar.setAttribute('role', 'status');
    var t = document.createElement('span'); t.textContent = 'Estás viendo la carta con los cambios que hiciste en el panel de demostración.';
    var a = document.createElement('a'); a.href = 'panel/'; a.textContent = 'Volver al panel';
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Ver la original';
    b.addEventListener('click', function () { window.CAFE_STORE.reset(); location.reload(); });
    bar.appendChild(t); bar.appendChild(a); bar.appendChild(b);
    var top = document.querySelector('.top'); top.parentNode.insertBefore(bar, top);
    if (saved.note) { var n = document.createElement('p'); n.className = 'notice'; n.textContent = saved.note; var it = document.querySelector('.intro-text h1'); if (it) it.parentNode.insertBefore(n, it); }
  });
})();
