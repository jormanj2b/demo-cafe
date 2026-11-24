# Café Almendro · demo de portafolio

Carta digital con QR por mesa, filtros de dieta y alérgenos (UE 1169/2011) y pedido por WhatsApp.

**Sitio en vivo:** https://jormanj2b.github.io/demo-cafe/

Café Almendro es un negocio **ficticio**. Este repositorio es una pieza de portafolio de **Jorman Bravo · Desarrollo web** ([portafolio](https://jormanj2b.github.io/)), no el sitio de una empresa real. Las direcciones, personas, precios y testimonios son de ejemplo, y las fotos están generadas para la demo.

## Qué incluye

- HTML, CSS y JavaScript sin frameworks ni dependencias externas (carga rápida y fácil de mantener).
- Diseño pensado primero para el celular, accesible con teclado y lector de pantalla.
- SEO en la página: título y descripción, Open Graph, datos estructurados (JSON-LD), `sitemap.xml` y `robots.txt`.
- Fuentes e imágenes servidas desde el propio sitio (WebP en varios tamaños), sin rastreadores.
- Política de seguridad de contenido (CSP) y ningún dato enviado a terceros.

## Publicación

GitHub Pages desde la rama `main`. Para un cliente real se conecta su dominio, se cambian los datos de ejemplo y se añade el número de WhatsApp o el servicio de formularios que use el negocio.

© 2026 Jorman Bravo. Código de muestra para portafolio.

## Panel de demostración

`panel/` es un panel de administración de ejemplo: cambia nombres, precios, descripciones, fotos, disponibilidad, horario y un aviso de portada. No hay cuentas ni servidor: los cambios se guardan en `localStorage` (clave `almendro-demo-v1`) y la carta los aplica al abrirla en el mismo navegador (`store.js`). En un encargo real se conecta a una base de datos con acceso por usuario.
