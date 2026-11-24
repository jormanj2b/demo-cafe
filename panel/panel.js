'use strict';
(function () {
  var S = window.CAFE_STORE, A = window.ALLERGENS, D = S.data(), dirty = false;
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function eur(v) { return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  function num(s) { var v = parseFloat(String(s).replace(',', '.')); return isFinite(v) ? Math.round(v * 100) / 100 : NaN; }
  function toast(m) { var t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2800); }
  function mark() { dirty = true; $('state').textContent = 'Cambios sin guardar'; $('state').className = 'state warn'; kpis(); }
  function all() { return D.menu.reduce(function (a, c) { return a.concat(c.items); }, []); }

  function kpis() {
    var items = all(), on = items.filter(function (i) { return !i.off; });
    $('k-items').textContent = on.length;
    $('k-off').textContent = items.length - on.length ? (items.length - on.length) + ' agotado(s)' : '';
    $('k-cats').textContent = D.menu.length;
    $('k-avg').textContent = on.length ? eur(on.reduce(function (s, i) { return s + i.p; }, 0) / on.length) : '—';
    $('k-img').textContent = items.filter(function (i) { return i.img || i.photo; }).length;
  }

  // Foto: se reduce a 400 px y se guarda como JPEG dentro del navegador
  function readPhoto(file, cb) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast('Usa una foto JPG, PNG o WebP.'); return; }
    if (file.size > 8e6) { toast('La foto pesa más de 8 MB.'); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = 400, c = document.createElement('canvas'), k = Math.max(s / img.width, s / img.height);
      c.width = s; c.height = s;
      var w = img.width * k, h = img.height * k;
      c.getContext('2d').drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
      URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = function () { toast('No se pudo leer la foto.'); };
    img.src = url;
  }

  function row(c, i) {
    var id = 'it-' + i.id;
    var thumb = el('div', { class: 'thumb' });
    function paintThumb() {
      thumb.textContent = '';
      var src = i.photo || (i.img ? '../img/' + i.img + '-400.webp' : '');
      if (src) thumb.appendChild(el('img', { src: src, alt: '', width: '64', height: '64' }));
      else thumb.appendChild(el('span', { 'aria-hidden': 'true', text: i.n.slice(0, 1) }));
    }
    paintThumb();
    var file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', id: id + '-f', class: 'sr' });
    file.addEventListener('change', function () {
      if (!file.files[0]) return;
      readPhoto(file.files[0], function (d) { i.photo = d; paintThumb(); mark(); toast('Foto lista. Guarda para verla en la carta.'); });
    });
    var name = el('input', { id: id + '-n', value: i.n, maxlength: '40', class: 'in-name' });
    name.addEventListener('input', function () { i.n = name.value; mark(); });
    var desc = el('input', { id: id + '-d', value: i.t || '', maxlength: '90', class: 'in-desc', 'aria-label': 'Descripción de ' + i.n });
    desc.addEventListener('input', function () { i.t = desc.value; mark(); });
    var price = el('input', { id: id + '-p', value: i.p.toFixed(2).replace('.', ','), inputmode: 'decimal', maxlength: '6', class: 'in-price' });
    price.addEventListener('input', function () {
      var v = num(price.value), ok = v > 0 && v < 1000;
      price.setAttribute('aria-invalid', String(!ok)); if (ok) { i.p = v; mark(); }
    });
    var sw = el('input', { type: 'checkbox', id: id + '-on', role: 'switch' }); sw.checked = !i.off;
    var swl = el('label', { for: id + '-on', class: 'switch' }, [sw, el('span', { class: 'track', 'aria-hidden': 'true' }), el('span', { class: 'sw-t', text: i.off ? 'Agotado' : 'Disponible' })]);
    sw.addEventListener('change', function () { i.off = !sw.checked; swl.lastChild.textContent = i.off ? 'Agotado' : 'Disponible'; tr.classList.toggle('is-off', !!i.off); mark(); });
    var del = el('button', { type: 'button', class: 'icon', 'aria-label': 'Quitar ' + i.n + ' de la carta', title: 'Quitar' }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    del.addEventListener('click', function () {
      if (!confirm('¿Quitar «' + i.n + '» de la carta?')) return;
      c.items.splice(c.items.indexOf(i), 1); tr.remove(); mark(); toast('Plato quitado. Guarda para aplicarlo.');
    });
    var algs = i.a && i.a.length ? i.a.map(function (k) { return A[k]; }).join(', ') : 'Sin alérgenos';
    var tr = el('li', { class: 'row' + (i.off ? ' is-off' : ''), 'data-q': (i.n + ' ' + (i.t || '')).toLowerCase() }, [
      el('label', { for: id + '-f', class: 'photo', title: 'Cambiar foto' }, [thumb, el('span', { class: 'photo-t', text: 'Foto' })]), file,
      el('div', { class: 'cell-main' }, [el('label', { for: id + '-n', class: 'sr', text: 'Nombre' }), name, desc, el('small', { class: 'algs', text: algs })]),
      el('div', { class: 'cell-price' }, [el('label', { for: id + '-p', class: 'mini', text: 'Precio' }), el('span', { class: 'eur-wrap' }, [price, el('span', { 'aria-hidden': 'true', text: '€' })])]),
      swl, del
    ]);
    return tr;
  }

  function render() {
    var box = $('cats'); box.textContent = '';
    var sel = $('n-cat'); sel.textContent = '';
    D.menu.forEach(function (c) {
      sel.appendChild(el('option', { text: c.cat }));
      var ul = el('ul', { class: 'rows' });
      c.items.forEach(function (i) { ul.appendChild(row(c, i)); });
      box.appendChild(el('div', { class: 'cat' }, [el('h3', { text: c.cat }, [el('span', { class: 'count', text: ' · ' + c.items.length })]), ul]));
    });
    var hb = $('hours'); hb.textContent = '';
    D.hours.forEach(function (h, k) {
      var d = el('input', { id: 'hd' + k, value: h.d, maxlength: '20' }), t = el('input', { id: 'ht' + k, value: h.h, maxlength: '20' });
      d.addEventListener('input', function () { h.d = d.value; mark(); });
      t.addEventListener('input', function () { h.h = t.value; mark(); });
      hb.appendChild(el('div', { class: 'hour' }, [el('div', { class: 'f' }, [el('label', { for: 'hd' + k, text: 'Días' }), d]), el('div', { class: 'f' }, [el('label', { for: 'ht' + k, text: 'Horario' }), t])]));
    });
    $('note').value = D.note || '';
    kpis();
  }

  $('note').addEventListener('input', function () { D.note = $('note').value.trim(); mark(); });
  $('q').addEventListener('input', function () {
    var q = $('q').value.trim().toLowerCase();
    Array.prototype.forEach.call(document.querySelectorAll('.row'), function (r) { r.hidden = q && r.dataset.q.indexOf(q) < 0; });
  });
  $('add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('n-name').value.trim(), p = num($('n-price').value), err = $('n-err');
    var msg = n.length < 2 ? 'Escribe el nombre del plato.' : !(p > 0 && p < 1000) ? 'Escribe un precio válido, por ejemplo 3,50.' : '';
    err.textContent = msg; err.hidden = !msg;
    if (msg) { (n.length < 2 ? $('n-name') : $('n-price')).focus(); return; }
    var cat = D.menu.filter(function (c) { return c.cat === $('n-cat').value; })[0];
    cat.items.push({ id: 'n' + Date.now().toString(36), n: n, p: p, a: [], d: [], t: $('n-desc').value.trim() });
    e.target.reset(); render(); mark(); toast('«' + n + '» añadido en ' + cat.cat + '.');
  });
  $('save').addEventListener('click', function () {
    var bad = document.querySelector('.in-price[aria-invalid="true"]');
    if (bad) { bad.focus(); toast('Hay un precio que no es válido.'); return; }
    try { S.save(D); } catch (e) { toast('No hay espacio en el navegador. Prueba con fotos más pequeñas.'); return; }
    dirty = false; $('state').textContent = 'Guardado en este navegador'; $('state').className = 'state ok';
    toast('Guardado. Abre la carta para ver los cambios.');
  });
  $('reset').addEventListener('click', function () {
    if (!confirm('¿Volver a los datos de ejemplo? Se borran tus cambios.')) return;
    S.reset(); D = S.data(); render(); dirty = false; $('state').textContent = 'Datos de ejemplo'; $('state').className = 'state'; toast('Demo restablecida.');
  });
  $('preview').addEventListener('click', function (e) { if (dirty && !confirm('Tienes cambios sin guardar. ¿Ver la carta igualmente?')) e.preventDefault(); });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // Navegación lateral: marca la sección visible
  var links = document.querySelectorAll('.side-nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) Array.prototype.forEach.call(links, function (a) { a.setAttribute('aria-current', String(a.hash === '#' + x.target.id)); }); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    ['resumen', 'carta', 'horario'].forEach(function (id) { io.observe($(id)); });
  }
  if (S.edited) { $('state').textContent = 'Con cambios guardados'; $('state').className = 'state ok'; }
  render();
})();
