'use strict';
(function () {
  var A = window.ALLERGENS, MENU = window.MENU;
  function $(id) { return document.getElementById(id); }
  // Validación de campos: ayuda a quien escribe y evita datos raros. La protección de verdad es que
  // todo lo que escribe el usuario se muestra con textContent, nunca como HTML.
  var NAME_RE = /^\p{L}(?:[\p{L}\p{M}]|['’ -](?=\p{L}))*$/u;
  function clean(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function cleanLong(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); }
  function nameMsg(v, min, max, empty) {
    if (!v) return empty;
    if (/[^\p{L}\p{M}\d '’-]/u.test(v)) return 'Usa solo letras, espacios, apóstrofes y guiones (sin símbolos como < > / ; =).';
    if (/\d/.test(v)) return 'El nombre no puede llevar números.';
    if (!NAME_RE.test(v)) return 'Usa solo letras, espacios, apóstrofes y guiones.';
    if (v.length < min) return 'Escribe al menos ' + min + ' letras.';
    if (v.length > max) return 'Máximo ' + max + ' caracteres.';
    return '';
  }
  function phoneMsg(v, min, short) {
    if (/(?!^\+)\D/.test(v)) return 'El teléfono solo lleva números (y + al inicio para el código de país).';
    var d = v.replace(/\D/g, '');
    if (d.length < min) return short;
    if (d.length > 15) return 'Sobran dígitos: revisa el número.';
    return '';
  }
  function textMsg(v, max) {
    if (/[<>]/.test(v)) return 'Sin los signos < y >, por favor.';
    if (max && v.length > max) return 'Máximo ' + max + ' caracteres.';
    return '';
  }
  function isCharMsg(m) { return /números|Usa solo|solo lleva|solo acepta|signos/.test(m); }
  // Valida al escribir solo si hay un carácter no permitido (o si el campo ya estaba marcado), y siempre al salir del campo
  function live(input, rule, show) {
    input.addEventListener('input', function () { var m = rule(input.value); if (input.getAttribute('aria-invalid') === 'true' || isCharMsg(m)) show(m); });
    input.addEventListener('blur', function () { if (input.value) show(rule(input.value)); });
  }
  // Filtro al escribir o pegar: quita lo que no corresponde al tipo de campo y lo avisa.
  var FILTERS = {
    name: [/[^\p{L}\p{M} '’-]/gu, 'Este campo solo acepta letras, espacios, apóstrofes y guiones.'],
    digits: [/\D/g, 'Este campo solo acepta números.'],
    phone: [/(?!^\+)\D/g, 'El teléfono solo acepta números (y + al inicio para el código de país).'],
    user: [/[^A-Za-z0-9._-]/g, 'El usuario solo lleva letras sin acentos, números, puntos y guiones.'],
    text: [/[<>]/g, 'Los signos < y > no están permitidos.']
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
    return typeof i.img === 'string' && /^[a-z0-9-]+$/.test(i.img) ? 'img/' + i.img + '-400.webp' : '';
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function eur(v) { return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, ''); }

  // Mesa desde el QR (?mesa=7). Solo se aceptan números del 1 al 20.
  var mesaParam = parseInt(new URLSearchParams(location.search).get('mesa'), 10);
  var mesa = mesaParam >= 1 && mesaParam <= 20 ? mesaParam : null;
  if (mesa) { var pill = $('table-pill'); pill.textContent = 'Mesa ' + mesa; pill.hidden = false; $('mesa').value = String(mesa); }

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
    grid.appendChild(el('label', { for: id, class: 'alg-opt' }, [input, el('span', { class: 'alg alg-' + k, 'aria-hidden': 'true', text: k.toUpperCase() }), el('span', { text: A[k] })]));
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
      if (!items.length) sec.appendChild(el('p', { class: 'empty', text: 'Nada en esta sección con los filtros elegidos.' }));
      var ul = el('ul', { class: 'items' });
      items.forEach(function (i) {
        var algs = el('ul', { class: 'algs', 'aria-label': i.a.length ? 'Alérgenos: ' + i.a.map(function (k) { return A[k]; }).join(', ') : 'Sin alérgenos declarados' });
        i.a.forEach(function (k) { algs.appendChild(el('li', { class: 'alg alg-' + k, title: A[k], text: k.toUpperCase() })); });
        var tags = i.d.map(function (d) { return { veg: 'Vegetariano', vegan: 'Vegano', sg: 'Sin gluten' }[d]; }).filter(Boolean);
        var qty = cart[i.id] || 0;
        var qtyEl = el('span', { class: 'qty', 'aria-live': 'polite', text: qty ? '×' + qty : '' });
        var add = el('button', { type: 'button', class: 'add', 'aria-label': 'Añadir ' + i.n + ' al pedido' }, [el('span', { 'aria-hidden': 'true', text: '+' })]);
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
    $('result').textContent = shown === total ? '' : 'Mostrando ' + shown + ' de ' + total + ' platos.';
  }

  function lines() { return Object.keys(cart).filter(function (k) { return cart[k] > 0; }).map(function (k) { return { i: byId[k], q: cart[k] }; }); }
  function sum() { return lines().reduce(function (s, l) { return s + l.i.p * l.q; }, 0); }
  function updateBar() {
    var n = lines().reduce(function (s, l) { return s + l.q; }, 0);
    $('order-bar').hidden = !n;
    $('order-count').textContent = n + (n === 1 ? ' producto' : ' productos') + ' · Ver pedido';
    $('order-total').textContent = eur(sum());
  }

  var sheet = $('sheet');
  function renderLines() {
    var ul = $('lines'); ul.textContent = '';
    lines().forEach(function (l) {
      var minus = el('button', { type: 'button', class: 'qbtn', 'aria-label': 'Quitar uno de ' + l.i.n, text: '−' });
      var plus = el('button', { type: 'button', class: 'qbtn', 'aria-label': 'Añadir uno de ' + l.i.n, text: '+' });
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
  // Reglas del pedido: mesa solo números, nombre solo letras, nota sin < >
  var rulesOrder = {
    mesa: function (v) { v = clean(v); return /\D/.test(v) ? 'La mesa es un número del 1 al 20.' : (+v >= 1 && +v <= 20 ? '' : 'Indica el número de mesa (1 a 20).'); },
    nombre: function (v) { return nameMsg(clean(v), 2, 40, 'Escribe un nombre para llamarte.'); },
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
    var txt = ['Pedido Café Almendro', mode === 'mesa' ? 'Mesa ' + m : 'Para llevar: ' + nombre, ''];
    lines().forEach(function (l) { txt.push(l.q + ' × ' + l.i.n + ' — ' + eur(l.i.p * l.q)); });
    txt.push('', 'Total: ' + eur(sum()));
    var nota = $('nota').value; if (nota) txt.push('Nota: ' + nota);
    window.open('https://wa.me/?text=' + encodeURIComponent(txt.join('\n')), '_blank', 'noopener');
  });

  render(); updateBar();
})();
