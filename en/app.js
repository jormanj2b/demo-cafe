'use strict';
(function () {
  var A = window.ALLERGENS, AB = window.ALLERGEN_ABBR || {}, MENU = window.MENU;
  function abbr(k) { return AB[k] || k.toUpperCase(); }
  function $(id) { return document.getElementById(id); }
  // Field validation helps people type valid data. The real protection is that
  // everything users type is shown with textContent, never as HTML.
  var NAME_RE = /^\p{L}(?:[\p{L}\p{M}]|['’ -](?=\p{L}))*$/u;
  function clean(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function cleanLong(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); }
  function nameMsg(v, min, max, empty) {
    if (!v) return empty;
    if (/[^\p{L}\p{M}\d '’-]/u.test(v)) return 'Use letters, spaces, apostrophes and hyphens only (no symbols like < > / ; =).';
    if (/\d/.test(v)) return 'Names can’t contain numbers.';
    if (!NAME_RE.test(v)) return 'Use letters, spaces, apostrophes and hyphens only.';
    if (v.length < min) return 'Enter at least ' + min + ' letters.';
    if (v.length > max) return max + ' characters max.';
    return '';
  }
  function phoneMsg(v, min, short) {
    if (/(?!^\+)\D/.test(v)) return 'Phone numbers use digits only (and + at the start for a country code).';
    var d = v.replace(/\D/g, '');
    if (d.length < min) return short;
    if (d.length > 15) return 'Too many digits. Check the number.';
    return '';
  }
  function textMsg(v, max) {
    if (/[<>]/.test(v)) return 'Please leave out the < and > characters.';
    if (max && v.length > max) return max + ' characters max.';
    return '';
  }
  function isCharMsg(m) { return /numbers|letters, spaces|digits only|only accepts|characters\./.test(m); }
  // Valida al escribir solo si hay un carácter no permitido (o si el campo ya estaba marcado), y siempre al salir del campo
  function live(input, rule, show) {
    input.addEventListener('input', function () { var m = rule(input.value); if (input.getAttribute('aria-invalid') === 'true' || isCharMsg(m)) show(m); });
    input.addEventListener('blur', function () { if (input.value) show(rule(input.value)); });
  }
  // Filtro al escribir o pegar: quita lo que no corresponde al tipo de campo y lo avisa.
  var FILTERS = {
    name: [/[^\p{L}\p{M} '’-]/gu, 'This field only accepts letters, spaces, apostrophes and hyphens.'],
    digits: [/\D/g, 'This field only accepts numbers.'],
    phone: [/(?!^\+)\D/g, 'Phone numbers only accept digits (and + at the start for a country code).'],
    user: [/[^A-Za-z0-9._-]/g, 'Usernames use plain letters, numbers, dots and hyphens only.'],
    text: [/[<>]/g, 'The < and > characters aren’t allowed.']
  };
  function filter(input, kind, show) {
    input.addEventListener('input', function () {
      var k = typeof kind === 'function' ? kind() : kind, f = FILTERS[k];
      if (!f) return;
      var v = input.value, c = v.replace(f[0], '');
      if (c === v) return;
      var pos = Math.max(0, (input.selectionStart || c.length) - (v.length - c.length));
      input.value = c;
      try { input.setSelectionRange(pos, pos); } catch (e) {}
      if (show) show(f[1]);
    });
  }
  // Campos type=number: bloquea e, E, +, -, punto y coma (el navegador sí los deja escribir)
  function digitsOnlyNumber(input) {
    input.addEventListener('keydown', function (e) { if (['e', 'E', '+', '-', '.', ','].indexOf(e.key) > -1) e.preventDefault(); });
    input.addEventListener('paste', function (e) { var t = (e.clipboardData || window.clipboardData).getData('text'); if (/\D/.test(t)) e.preventDefault(); });
  }
  // Fotos: solo las de la carta o las que el panel guarda como JPEG/PNG/WebP en el navegador
  function photoSrc(i) {
    if (typeof i.photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(i.photo)) return i.photo;
    return typeof i.img === 'string' && /^[a-z0-9-]+$/.test(i.img) ? '../img/' + i.img + '-400.webp' : '';
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
  function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, ''); }

  // Table from the QR code (?table=7). Only 1 to 20 is accepted.
  var qs = new URLSearchParams(location.search), mesaParam = parseInt(qs.get('table') || qs.get('mesa'), 10);
  var mesa = mesaParam >= 1 && mesaParam <= 20 ? mesaParam : null;
  if (mesa) { var pill = $('table-pill'); pill.textContent = 'Table ' + mesa; pill.hidden = false; $('mesa').value = String(mesa); }

  var filters = { diet: {}, hide: {} };
  var cart = {};
  var byId = {};
  MENU.forEach(function (c) { c.items.forEach(function (i) { byId[i.id] = i; }); });

  // Categorías
  var cats = $('cats');
  MENU.forEach(function (c) { cats.appendChild(el('a', { href: '#c-' + slug(c.cat), text: c.cat })); });

  // Filtro de alérgenos
  var grid = $('alg-grid');
  Object.keys(A).forEach(function (k) {
    var id = 'alg-' + k;
    var input = el('input', { type: 'checkbox', id: id, value: k });
    grid.appendChild(el('label', { for: id, class: 'alg-opt' }, [input, el('span', { class: 'alg alg-' + k, 'aria-hidden': 'true', text: abbr(k) }), el('span', { text: A[k] })]));
    input.addEventListener('change', function () { filters.hide[k] = input.checked; render(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on)); filters.diet[b.dataset.diet] = on; render();
    });
  });

  function visible(i) {
    for (var d in filters.diet) if (filters.diet[d] && i.d.indexOf(d) < 0) return false;
    for (var h in filters.hide) if (filters.hide[h] && i.a.indexOf(h) >= 0) return false;
    return true;
  }

  var list = $('menu-list');
  function render() {
    list.textContent = '';
    var shown = 0, total = 0;
    MENU.forEach(function (c) {
      var items = c.items.filter(visible); total += c.items.length; shown += items.length;
      var sec = el('section', { class: 'cat', id: 'c-' + slug(c.cat), 'aria-labelledby': 'h-' + slug(c.cat) }, [el('h3', { id: 'h-' + slug(c.cat), text: c.cat })]);
      if (!items.length) sec.appendChild(el('p', { class: 'empty', text: 'Nothing in this section matches your filters.' }));
      var ul = el('ul', { class: 'items' });
      items.forEach(function (i) {
        var algs = el('ul', { class: 'algs', 'aria-label': i.a.length ? 'Allergens: ' + i.a.map(function (k) { return A[k]; }).join(', ') : 'No declared allergens' });
        i.a.forEach(function (k) { algs.appendChild(el('li', { class: 'alg alg-' + k, title: A[k], text: abbr(k) })); });
        var tags = i.d.map(function (d) { return { veg: 'Vegetarian', vegan: 'Vegan', sg: 'Gluten-free' }[d]; }).filter(Boolean);
        var qty = cart[i.id] || 0;
        var qtyEl = el('span', { class: 'qty', 'aria-live': 'polite', text: qty ? '×' + qty : '' });
        var add = el('button', { type: 'button', class: 'add', 'aria-label': 'Add ' + i.n + ' to your order' }, [el('span', { 'aria-hidden': 'true', text: '+' })]);
        add.addEventListener('click', function () { cart[i.id] = (cart[i.id] || 0) + 1; qtyEl.textContent = '×' + cart[i.id]; updateBar(); });
        var kids = [];
        if (photoSrc(i)) kids.push(el('img', { class: 'thumb', src: photoSrc(i), width: '400', height: i.img === 'hero' ? '225' : '400', alt: '', loading: 'lazy' }));
        kids.push(el('div', { class: 'item-body' }, [
          el('div', { class: 'item-top' }, [el('h4', { text: i.n }), el('span', { class: 'price', text: eur(i.p) })]),
          el('p', { class: 'desc', text: i.t }),
          tags.length ? el('p', { class: 'tags', text: tags.join(' · ') }) : null,
          algs
        ]));
        kids.push(el('div', { class: 'item-act' }, [qtyEl, add]));
        ul.appendChild(el('li', { class: 'item' + (i.photo || i.img ? ' has-img' : '') }, kids));
      });
      sec.appendChild(ul); list.appendChild(sec);
    });
    var hidden = Object.keys(filters.hide).filter(function (k) { return filters.hide[k]; }).length;
    $('alg-count').textContent = hidden ? '(' + hidden + ')' : '';
    $('result').textContent = shown === total ? '' : 'Showing ' + shown + ' of ' + total + ' items.';
  }

  function lines() { return Object.keys(cart).filter(function (k) { return cart[k] > 0; }).map(function (k) { return { i: byId[k], q: cart[k] }; }); }
  function sum() { return lines().reduce(function (s, l) { return s + l.i.p * l.q; }, 0); }
  function updateBar() {
    var n = lines().reduce(function (s, l) { return s + l.q; }, 0);
    $('order-bar').hidden = !n;
    $('order-count').textContent = n + (n === 1 ? ' item' : ' items') + ' · View order';
    $('order-total').textContent = eur(sum());
  }

  var sheet = $('sheet');
  function renderLines() {
    var ul = $('lines'); ul.textContent = '';
    lines().forEach(function (l) {
      var minus = el('button', { type: 'button', class: 'qbtn', 'aria-label': 'Remove one ' + l.i.n, text: '−' });
      var plus = el('button', { type: 'button', class: 'qbtn', 'aria-label': 'Add one more ' + l.i.n, text: '+' });
      minus.addEventListener('click', function () { cart[l.i.id]--; changed(); });
      plus.addEventListener('click', function () { cart[l.i.id]++; changed(); });
      ul.appendChild(el('li', null, [el('span', { class: 'ln', text: l.i.n }), el('span', { class: 'qctl' }, [minus, el('span', { text: String(l.q), 'aria-live': 'polite' }), plus]), el('span', { class: 'lp', text: eur(l.i.p * l.q) })]));
    });
    $('sheet-total').textContent = eur(sum());
    if (!lines().length) sheet.close();
  }
  function changed() { updateBar(); renderLines(); render(); }
  $('open-order').addEventListener('click', function () { renderLines(); sheet.showModal(); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });

  Array.prototype.forEach.call(document.querySelectorAll('input[name="modo"]'), function (r) {
    r.addEventListener('change', function () { var m = r.value === 'mesa'; $('f-mesa').hidden = !m; $('f-nombre').hidden = m; });
  });
  // Order rules: table is digits only, name is letters only, note has no < >
  var rulesOrder = {
    mesa: function (v) { v = clean(v); return /\D/.test(v) ? 'Table numbers go from 1 to 20.' : (+v >= 1 && +v <= 20 ? '' : 'Enter your table number (1 to 20).'); },
    nombre: function (v) { return nameMsg(clean(v), 2, 40, 'Enter a name so we can call you when it’s ready.'); },
    nota: function (v) { return textMsg(clean(v), 120); }
  };
  $('nombre').setAttribute('pattern', "\\p{L}(?:[\\p{L}\\p{M}]|[' ’\\-](?=\\p{L}))*"); $('nombre').setAttribute('spellcheck', 'false');
  var notaErr = el('p', { class: 'error', id: 'err-nota', hidden: '' }); $('nota').parentNode.appendChild(notaErr);
  function showOrder(k, msg) {
    var e = $('err-' + k); e.textContent = msg; e.hidden = !msg; e.setAttribute('aria-live', 'polite');
    $(k).setAttribute('aria-invalid', String(!!msg)); if (msg) $(k).setAttribute('aria-describedby', 'err-' + k); else $(k).removeAttribute('aria-describedby');
    return !msg;
  }
  var KIND = { mesa: 'digits', nombre: 'name', nota: 'text' };
  Object.keys(rulesOrder).forEach(function (k) { live($(k), rulesOrder[k], function (m) { showOrder(k, m); }); filter($(k), KIND[k], function (m) { showOrder(k, m); }); });
  $('send').addEventListener('click', function () {
    var mode = document.querySelector('input[name="modo"]:checked').value;
    ['mesa', 'nombre', 'nota'].forEach(function (k) { $(k).value = clean($(k).value); });
    var m = parseInt($('mesa').value, 10), nombre = $('nombre').value;
    var okM = mode !== 'mesa' || showOrder('mesa', rulesOrder.mesa($('mesa').value));
    var okN = mode !== 'llevar' || showOrder('nombre', rulesOrder.nombre(nombre));
    var okT = showOrder('nota', rulesOrder.nota($('nota').value));
    if (!okM) { $('mesa').focus(); return; }
    if (!okN) { $('nombre').focus(); return; }
    if (!okT) { $('nota').focus(); return; }
    var txt = ['Almond Tree Café order', mode === 'mesa' ? 'Table ' + m : 'Pickup: ' + nombre, ''];
    lines().forEach(function (l) { txt.push(l.q + ' × ' + l.i.n + ' — ' + eur(l.i.p * l.q)); });
    txt.push('', 'Total: ' + eur(sum()));
    var nota = $('nota').value; if (nota) txt.push('Note: ' + nota);
    window.open('https://wa.me/?text=' + encodeURIComponent(txt.join('\n')), '_blank', 'noopener');
  });

  render(); updateBar();
})();
