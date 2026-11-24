'use strict';
(function () {
  var A = window.ALLERGENS, MENU = window.MENU;
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
        if (i.img) kids.push(el('img', { class: 'thumb', src: 'img/' + i.img + '-400.webp', width: '400', height: i.img === 'hero' ? '225' : '400', alt: '', loading: 'lazy' }));
        kids.push(el('div', { class: 'item-body' }, [
          el('div', { class: 'item-top' }, [el('h4', { text: i.n }), el('span', { class: 'price', text: eur(i.p) })]),
          el('p', { class: 'desc', text: i.t }),
          tags.length ? el('p', { class: 'tags', text: tags.join(' · ') }) : null,
          algs
        ]));
        kids.push(el('div', { class: 'item-act' }, [qtyEl, add]));
        ul.appendChild(el('li', { class: 'item' + (i.img ? ' has-img' : '') }, kids));
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
  $('send').addEventListener('click', function () {
    var mode = document.querySelector('input[name="modo"]:checked').value;
    var m = parseInt($('mesa').value, 10), nombre = $('nombre').value.trim();
    var okM = mode !== 'mesa' || (m >= 1 && m <= 20), okN = mode !== 'llevar' || nombre.length >= 2;
    $('err-mesa').hidden = okM; $('mesa').setAttribute('aria-invalid', String(!okM));
    $('err-nombre').hidden = okN; $('nombre').setAttribute('aria-invalid', String(!okN));
    if (!okM) { $('mesa').focus(); return; }
    if (!okN) { $('nombre').focus(); return; }
    var txt = ['Pedido Café Almendro', mode === 'mesa' ? 'Mesa ' + m : 'Para llevar: ' + nombre, ''];
    lines().forEach(function (l) { txt.push(l.q + ' × ' + l.i.n + ' — ' + eur(l.i.p * l.q)); });
    txt.push('', 'Total: ' + eur(sum()));
    var nota = $('nota').value.trim(); if (nota) txt.push('Nota: ' + nota);
    window.open('https://wa.me/?text=' + encodeURIComponent(txt.join('\n')), '_blank', 'noopener');
  });

  render(); updateBar();
})();
