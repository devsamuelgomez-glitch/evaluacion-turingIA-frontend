# TechStore Web

Frontend de la tienda de productos tecnológicos **TechStore**, construido a partir del **Wireframe A** del periodo de prueba de Desarrollo de Software de Turing IA.

**Stack:** React 19 · Vite · CSS con metodología **BEM**

API: repositorio `techstore-api`.

## Requisitos

- Node.js 20+ y npm
- La API de TechStore corriendo (por defecto en `http://localhost:4000/api`)

## Instalación y ejecución

```bash
npm install
cp .env.example .env        # en Windows: copy .env.example .env
npm run dev                 # http://localhost:5173
```

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | URL base de la API |

## Secciones (Wireframe A)

| Sección | Componente | Datos |
|---|---|---|
| Barra superior + navegación | `Header` | Estático, menú hamburguesa en móvil |
| Hero + 3 beneficios | `Hero` | Estático |
| Grid de 6 productos | `ProductGrid`, `ProductCard` | **API**: `GET /products` y `GET /categories` |
| Galería de 4 categorías | `Gallery` | Estático |
| 3 testimonios en círculo | `Testimonials` | Estático (se conectará a reseñas) |
| Footer | `Footer` | Estático |

### Sección conectada a la API

`ProductGrid` consume la API mediante `src/services/api.js` y el hook `src/hooks/useProducts.js`:

- **Pestañas de categoría**: se generan desde `GET /categories` y filtran los productos.
- **Cargar más**: pide la siguiente página y la agrega a la lista.
- Estados de carga (skeletons), error (con botón de reintento) y lista vacía.
- Las peticiones se cancelan con `AbortController` si el usuario cambia de categoría antes de que terminen.

## Estructura

```
src/
├── components/     # Un folder por bloque BEM (JSX + CSS)
├── hooks/          # useProducts
├── services/       # Cliente HTTP de la API
├── styles/         # Variables (paleta) y estilos base
├── App.jsx
└── main.jsx
```

## Decisiones de diseño

- **BEM**: cada componente es un bloque (`.product-card`), con elementos (`.product-card__price`) y modificadores (`.product-grid__tab--active`). Los estilos viven junto a su componente.
- **Paleta 1** del documento de la prueba como variables CSS en `styles/variables.css`.
- **Mobile first**: puntos de quiebre en 600px, 768px y 960px.
- **HTML semántico y accesible**: `header`, `nav`, `main`, `section` con `aria-labelledby`, `article`, `figure`/`blockquote`, `role="tablist"` en los filtros y foco visible.
