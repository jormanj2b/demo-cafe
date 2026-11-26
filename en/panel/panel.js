'use strict';
(function () {
  var S = window.CAFE_STORE, A = window.ALLERGENS, D = S.data(), dirty = false;
  function $(id) { return document.getElementById(id); }
  // Textos del panel: sin < > ni caracteres de control. Se muestran siempre como texto (textContent), nunca como HTML.
  function clean(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function guard(input, set) {
    input.addEventListener('input', function () {
      if (/[<>]/.test(input.value)) { input.value = input.value.replace(/[<>]/g, ''); toast('The < and > characters aren’t allowed.'); }
      input.setAttribute('aria-invalid', 'false');
      set(clean(input.value)); mark();
    });
  }
  function photoSrc(i) {
    if (typeof i.photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(i.photo)) return i.photo;
    return typeof i.img === 'string' && /^[a-z0-9-]+$/.test(i.img) ? '../../img/' + i.img + '-400.webp' : '';
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function eur(v) { return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function num(s) { var v = parseFloat(String(s).replace(',', '.')); return isFinite(v) ? Math.round(v * 100) / 100 : NaN; }
  function toast(m) { var t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2800); }
  function mark() { dirty = true; $('state').textContent = 'Unsaved changes'; $('state').className = 'state warn'; kpis(); }
  function all() { return D.menu.reduce(function (a, c) { return a.concat(c.items); }, []); }

  function kpis() {
    var items = all(), on = items.filter(function (i) { return !i.off; });
    $('k-items').textContent = on.length;
    $('k-off').textContent = items.length - on.length ? (items.length - on.length) + ' sold out' : '';
    $('k-cats').textContent = D.menu.length;
    $('k-avg').textContent = on.length ? eur(on.reduce(function (s, i) { return s + i.p; }, 0) / on.length) : '—';
    $('k-img').textContent = items.filter(function (i) { return i.img || i.photo; }).length;
  }

  // Foto: se reduce a 400 px y se guarda como JPEG dentro del navegador
  function readPhoto(file, cb) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast('Use a JPG, PNG or WebP photo.'); return; }
    if (file.size > 8e6) { toast('That photo is over 8 MB.'); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = 400, c = document.createElement('canvas'), k = Math.max(s / img.width, s / img.height);
      c.width = s; c.height = s;
      var w = img.width * k, h = img.height * k;
      c.getContext('2d').drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
      URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = function () { toast('Couldn’t read that photo.'); };
    img.src = url;
  }

  function row(c, i) {
    var id = 'it-' + i.id;
    var thumb = el('div', { class: 'thumb' });
    function paintThumb() {
      thumb.textContent = '';
      var src = photoSrc(i);
      if (src) thumb.appendChild(el('img', { src: src, alt: '', width: '64', height: '64' }));
      else thumb.appendChild(el('span', { 'aria-hidden': 'true', text: i.n.slice(0, 1) }));
    }
    paintThumb();
    var file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', id: id + '-f', class: 'sr' });
    file.addEventListener('change', function () {
      if (!file.files[0]) return;
      readPhoto(file.files[0], function (d) { i.photo = d; paintThumb(); mark(); toast('Photo ready. Save to see it on the menu.'); });
    });
    var name = el('input', { id: id + '-n', value: i.n, maxlength: '40', class: 'in-name' });
    guard(name, function (v) { i.n = v; });
    var desc = el('input', { id: id + '-d', value: i.t || '', maxlength: '90', class: 'in-desc', 'aria-label': 'Description for ' + i.n });
    guard(desc, function (v) { i.t = v; });
    var price = el('input', { id: id + '-p', value: i.p.toFixed(2), inputmode: 'decimal', maxlength: '6', class: 'in-price' });
    price.addEventListener('input', function () {
      if (/[^\d.,]/.test(price.value)) { price.value = price.value.replace(/[^\d.,]/g, ''); toast('Prices take numbers and a decimal point only.'); }
      var v = num(price.value), ok = v > 0 && v < 1000;
      price.setAttribute('aria-invalid', String(!ok)); if (ok) { i.p = v; mark(); }
    });
    var sw = el('input', { type: 'checkbox', id: id + '-on', role: 'switch' }); sw.checked = !i.off;
    var swl = el('label', { for: id + '-on', class: 'switch' }, [sw, el('span', { class: 'track', 'aria-hidden': 'true' }), el('span', { class: 'sw-t', text: i.off ? 'Sold out' : 'Available' })]);
    sw.addEventListener('change', function () { i.off = !sw.checked; swl.lastChild.textContent = i.off ? 'Sold out' : 'Available'; tr.classList.toggle('is-off', !!i.off); mark(); });
    var del = el('button', { type: 'button', class: 'icon', 'aria-label': 'Remove ' + i.n + ' from the menu', title: 'Remove' }, [el('span', { 'aria-hidden': 'true', text: '×' })]);
    del.addEventListener('click', function () {
      if (!confirm('Remove “' + i.n + '” from the menu?')) return;
      c.items.splice(c.items.indexOf(i), 1); tr.remove(); mark(); toast('Item removed. Save to apply it.');
    });
    var algs = i.a && i.a.length ? i.a.map(function (k) { return A[k]; }).join(', ') : 'No allergens';
    var tr = el('li', { class: 'row' + (i.off ? ' is-off' : ''), 'data-q': (i.n + ' ' + (i.t || '')).toLowerCase() }, [
      el('label', { for: id + '-f', class: 'photo', title: 'Change photo' }, [thumb, el('span', { class: 'photo-t', text: 'Photo' })]), file,
      el('div', { class: 'cell-main' }, [el('label', { for: id + '-n', class: 'sr', text: 'Name' }), name, desc, el('small', { class: 'algs', text: algs })]),
      el('div', { class: 'cell-price' }, [el('label', { for: id + '-p', class: 'mini', text: 'Price' }), el('span', { class: 'eur-wrap' }, [el('span', { 'aria-hidden': 'true', text: '$' }), price])]),
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
      guard(d, function (v) { h.d = v; }); guard(t, function (v) { h.h = v; });
      hb.appendChild(el('div', { class: 'hour' }, [el('div', { class: 'f' }, [el('label', { for: 'hd' + k, text: 'Days' }), d]), el('div', { class: 'f' }, [el('label', { for: 'ht' + k, text: 'Hours' }), t])]));
    });
    $('note').value = D.note || '';
    kpis();
  }

  guard($('note'), function (v) { D.note = v; });
  $('q').addEventListener('input', function () {
    var q = $('q').value.trim().toLowerCase();
    Array.prototype.forEach.call(document.querySelectorAll('.row'), function (r) { r.hidden = q && r.dataset.q.indexOf(q) < 0; });
  });
  ['n-name', 'n-desc'].forEach(function (id) { $(id).addEventListener('input', function () { var v = $(id).value; if (/[<>]/.test(v)) { $(id).value = v.replace(/[<>]/g, ''); toast('The < and > characters aren’t allowed.'); } }); });
  $('n-price').addEventListener('input', function () { var v = $('n-price').value; if (/[^\d.,]/.test(v)) { $('n-price').value = v.replace(/[^\d.,]/g, ''); toast('Prices take numbers and a decimal point only.'); } });
  $('add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = clean($('n-name').value), p = num($('n-price').value), err = $('n-err'), ds = clean($('n-desc').value);
    var msg = /[<>]/.test(n + ds) ? 'Please leave out the < and > characters.' : n.length < 2 ? 'Enter the item name.' : !(p > 0 && p < 1000) ? 'Enter a valid price, for example 3.50.' : '';
    err.textContent = msg; err.hidden = !msg;
    if (msg) { (/[<>]/.test(ds) && !/[<>]/.test(n) ? $('n-desc') : n.length < 2 || /[<>]/.test(n) ? $('n-name') : $('n-price')).focus(); return; }
    var cat = D.menu.filter(function (c) { return c.cat === $('n-cat').value; })[0];
    cat.items.push({ id: 'n' + Date.now().toString(36), n: n, p: p, a: [], d: [], t: ds });
    e.target.reset(); render(); mark(); toast('“' + n + '” added to ' + cat.cat + '.');
  });
  $('save').addEventListener('click', function () {
    var bad = document.querySelector('input[aria-invalid="true"]');
    if (bad) { bad.focus(); toast(bad.classList.contains('in-price') ? 'One of the prices isn’t valid.' : 'Some text has < or > in it. Remove them to save.'); return; }
    try { S.save(D); } catch (e) { toast('Your browser is out of space. Try smaller photos.'); return; }
    dirty = false; $('state').textContent = 'Saved in this browser'; $('state').className = 'state ok';
    toast('Saved. Open the menu to see your changes.');
  });
  $('reset').addEventListener('click', function () {
    if (!confirm('Go back to the sample data? Your changes will be deleted.')) return;
    S.reset(); D = S.data(); render(); dirty = false; $('state').textContent = 'Sample data'; $('state').className = 'state'; toast('Demo reset.');
  });
  $('preview').addEventListener('click', function (e) { if (dirty && !confirm('You have unsaved changes. View the menu anyway?')) e.preventDefault(); });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // Navegación lateral: marca la sección visible
  var links = document.querySelectorAll('.side-nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) Array.prototype.forEach.call(links, function (a) { a.setAttribute('aria-current', String(a.hash === '#' + x.target.id)); }); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    ['resumen', 'carta', 'horario'].forEach(function (id) { io.observe($(id)); });
  }
  if (S.edited) { $('state').textContent = 'Changes saved'; $('state').className = 'state ok'; }
  render();
})();
