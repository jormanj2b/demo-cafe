'use strict';
// Carta de ejemplo. a = alérgenos (códigos de ALLERGENS), d = dietas: veg, vegan, sg
window.ALLERGENS = {
  gl: 'Gluten', cr: 'Crustáceos', hu: 'Huevo', pe: 'Pescado', ca: 'Cacahuetes', so: 'Soja', la: 'Lácteos',
  fc: 'Frutos de cáscara', ap: 'Apio', mo: 'Mostaza', se: 'Sésamo', su: 'Sulfitos', al: 'Altramuces', ml: 'Moluscos'
};
window.MENU = [
  { cat: 'Cafés', items: [
    { id: 'esp', n: 'Espresso', p: 1.6, a: [], d: ['veg', 'vegan', 'sg'], t: 'Tueste medio, Brasil y Etiopía.' },
    { id: 'cort', n: 'Cortado', p: 1.8, a: ['la'], d: ['veg', 'sg'], t: 'Con leche entera o bebida de avena (+0,30 €).' },
    { id: 'fw', n: 'Flat white', p: 2.9, a: ['la'], d: ['veg', 'sg'], t: 'Doble ristretto y leche texturizada.', img: 'flatwhite' },
    { id: 'ccl', n: 'Café con leche', p: 2.2, a: ['la'], d: ['veg', 'sg'], t: 'En vaso, como se toma aquí.' },
    { id: 'v60', n: 'Filtro V60', p: 3.4, a: [], d: ['veg', 'vegan', 'sg'], t: 'Café de origen que cambia cada mes.' }
  ]},
  { cat: 'Desayunos', items: [
    { id: 'tom', n: 'Tostada con tomate', p: 2.8, a: ['gl'], d: ['veg', 'vegan'], t: 'Masa madre, tomate rallado, AOVE de Estepa y sal.', img: 'hero' },
    { id: 'jam', n: 'Tostada con jamón', p: 4.9, a: ['gl'], d: [], t: 'Tomate, jamón ibérico de cebo y aceite.' },
    { id: 'cro', n: 'Croissant de mantequilla', p: 2.4, a: ['gl', 'la', 'hu'], d: ['veg'], t: 'Con mermelada de naranja amarga casera.', img: 'croissant' },
    { id: 'sg1', n: 'Tostada sin gluten', p: 3.2, a: [], d: ['veg', 'vegan', 'sg'], t: 'Pan sin gluten envasado, tostadora aparte.' },
    { id: 'des', n: 'Desayuno Almendro', p: 6.5, a: ['gl', 'la'], d: ['veg'], t: 'Tostada con tomate, café con leche y zumo de naranja.' }
  ]},
  { cat: 'Brunch', items: [
    { id: 'bowl', n: 'Bowl de quinoa y garbanzos', p: 9.5, a: ['hu', 'se'], d: ['veg', 'sg'], t: 'Garbanzos especiados, aguacate, tomate, huevo a baja temperatura y tahini.', img: 'bowl' },
    { id: 'hue', n: 'Huevos rotos con pisto', p: 8.9, a: ['hu'], d: ['veg', 'sg'], t: 'Pisto de la casa, patata confitada y pimentón de la Vera.' },
    { id: 'tos', n: 'Tosta de salmón', p: 10.5, a: ['gl', 'pe', 'la', 'mo'], d: [], t: 'Salmón ahumado, queso fresco, eneldo y mostaza a la miel.' }
  ]},
  { cat: 'Bocadillos', items: [
    { id: 'boc', n: 'Bocadillo de ibérico y manchego', p: 6.8, a: ['gl', 'la'], d: [], t: 'Pan de cristal tostado, tomate y queso curado.', img: 'bocadillo' },
    { id: 'veg', n: 'Bocadillo de verduras asadas', p: 5.9, a: ['gl', 'se'], d: ['veg', 'vegan'], t: 'Berenjena, pimiento rojo, hummus y rúcula.' }
  ]},
  { cat: 'Dulces', items: [
    { id: 'tq', n: 'Tarta de queso al horno', p: 4.5, a: ['la', 'hu', 'gl'], d: ['veg'], t: 'Cremosa por dentro y tostada por fuera. La hacemos cada mañana.', img: 'tarta' },
    { id: 'ban', n: 'Bizcocho de plátano y nuez', p: 3.2, a: ['gl', 'hu', 'fc'], d: ['veg'], t: 'Con plátano muy maduro y nueces.' },
    { id: 'cho', n: 'Bombón de chocolate y almendra', p: 2.6, a: ['fc', 'so'], d: ['veg', 'vegan', 'sg'], t: 'Chocolate 70 % y almendra marcona.' }
  ]},
  { cat: 'Zumos', items: [
    { id: 'nar', n: 'Zumo de naranja natural', p: 3.0, a: [], d: ['veg', 'vegan', 'sg'], t: 'Exprimido al momento.' },
    { id: 'ver', n: 'Zumo verde', p: 3.8, a: ['ap'], d: ['veg', 'vegan', 'sg'], t: 'Manzana, apio, pepino y jengibre.' }
  ]}
];
