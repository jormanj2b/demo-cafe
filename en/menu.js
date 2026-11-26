'use strict';
// Sample menu. a = allergens (codes in ALLERGENS, the FDA's nine major allergens), d = diets: veg, vegan, sg (gluten-free)
window.ALLERGENS = {
  gl: 'Wheat / gluten', la: 'Milk', hu: 'Eggs', pe: 'Fish', cr: 'Shellfish', fc: 'Tree nuts', ca: 'Peanuts', so: 'Soy', se: 'Sesame'
};
// Short codes shown on the badges
window.ALLERGEN_ABBR = { gl: 'WH', la: 'MK', hu: 'EG', pe: 'FI', cr: 'SH', fc: 'TN', ca: 'PN', so: 'SO', se: 'SE' };
window.MENU = [
  { cat: 'Coffee', items: [
    { id: 'esp', n: 'Espresso', p: 3.25, a: [], d: ['veg', 'vegan', 'sg'], t: 'Medium roast, Brazil and Ethiopia.', img: 'espresso' },
    { id: 'cort', n: 'Cortado', p: 4.00, a: ['la'], d: ['veg', 'sg'], t: 'Whole milk or oat milk (+$0.75).', img: 'cortado' },
    { id: 'fw', n: 'Flat white', p: 4.75, a: ['la'], d: ['veg', 'sg'], t: 'Double ristretto with silky steamed milk.', img: 'flatwhite' },
    { id: 'ccl', n: 'Latte', p: 4.95, a: ['la'], d: ['veg', 'sg'], t: 'Served in a glass, 12 oz.', img: 'cafeconleche' },
    { id: 'v60', n: 'Pour-over', p: 5.50, a: [], d: ['veg', 'vegan', 'sg'], t: 'Single-origin beans that change every month.', img: 'v60' }
  ]},
  { cat: 'Breakfast', items: [
    { id: 'tom', n: 'Tomato toast', p: 7.50, a: ['gl'], d: ['veg', 'vegan'], t: 'Sourdough, grated tomato, olive oil and flaky salt.', img: 'hero' },
    { id: 'jam', n: 'Prosciutto toast', p: 11.00, a: ['gl'], d: [], t: 'Grated tomato, cured ham and olive oil.', img: 'jamon' },
    { id: 'cro', n: 'Butter croissant', p: 4.25, a: ['gl', 'la', 'hu'], d: ['veg'], t: 'With house-made orange marmalade.', img: 'croissant' },
    { id: 'sg1', n: 'Gluten-free toast', p: 7.00, a: [], d: ['veg', 'vegan', 'sg'], t: 'Packaged gluten-free bread in its own toaster.', img: 'singluten' },
    { id: 'des', n: 'The Almond Tree breakfast', p: 14.00, a: ['gl', 'la'], d: ['veg'], t: 'Tomato toast, a latte and fresh orange juice.', img: 'desayuno' }
  ]},
  { cat: 'Brunch', items: [
    { id: 'bowl', n: 'Quinoa & chickpea bowl', p: 15.50, a: ['hu', 'se'], d: ['veg', 'sg'], t: 'Spiced chickpeas, avocado, tomato, a soft egg and tahini.', img: 'bowl' },
    { id: 'hue', n: 'Crispy potatoes & eggs', p: 14.50, a: ['hu'], d: ['veg', 'sg'], t: 'Fried eggs over confit potatoes and house ratatouille, smoked paprika.', img: 'huevos' },
    { id: 'tos', n: 'Smoked salmon toast', p: 16.00, a: ['gl', 'pe', 'la'], d: [], t: 'Smoked salmon, cream cheese, dill and honey mustard.', img: 'salmon' }
  ]},
  { cat: 'Sandwiches', items: [
    { id: 'boc', n: 'Cured ham & manchego', p: 13.50, a: ['gl', 'la'], d: [], t: 'Toasted ciabatta, tomato and aged sheep’s cheese.', img: 'bocadillo' },
    { id: 'veg', n: 'Roasted veggie', p: 12.00, a: ['gl', 'se'], d: ['veg', 'vegan'], t: 'Eggplant, red pepper, hummus and arugula.', img: 'verduras' }
  ]},
  { cat: 'Sweets', items: [
    { id: 'tq', n: 'Burnt Basque cheesecake', p: 7.00, a: ['la', 'hu', 'gl'], d: ['veg'], t: 'Creamy inside, caramelized on top. Baked every morning.', img: 'tarta' },
    { id: 'ban', n: 'Banana walnut bread', p: 4.50, a: ['gl', 'hu', 'fc'], d: ['veg'], t: 'Made with very ripe bananas and walnuts.', img: 'bizcocho' },
    { id: 'cho', n: 'Dark chocolate almond bite', p: 3.50, a: ['fc', 'so'], d: ['veg', 'vegan', 'sg'], t: '70% dark chocolate and Marcona almonds.', img: 'bombon' }
  ]},
  { cat: 'Juices', items: [
    { id: 'nar', n: 'Fresh orange juice', p: 6.00, a: [], d: ['veg', 'vegan', 'sg'], t: 'Squeezed to order.', img: 'naranja' },
    { id: 'ver', n: 'Green juice', p: 8.00, a: [], d: ['veg', 'vegan', 'sg'], t: 'Apple, celery, cucumber and ginger.', img: 'verde' }
  ]}
];
