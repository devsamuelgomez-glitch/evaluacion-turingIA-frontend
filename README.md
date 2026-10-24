# TechStore Web

Frontend de la tienda de productos tecnológicos **TechStore**, construido a partir del **Wireframe A** del periodo de prueba de Desarrollo de Software de Turing IA.

**Stack:** React 19 · Vite · React Router · CSS con metodología **BEM**

API: repositorio [`evaluacion-turingIA-backend`](https://github.com/devsamuelgomez-glitch/evaluacion-turingIA-backend).

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
| `npm test` | Pruebas con Vitest |
| `npm run test:watch` | Pruebas en modo observación |

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | URL base de la API |

### Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| admin | `admin@techstore.com` | `Admin123!` |
| user | `user@techstore.com` | `User123!` |

En la pantalla de login hay botones que llenan estas credenciales.

## Páginas

| Ruta | Acceso | Contenido |
|---|---|---|
| `/login` | Público | Iniciar sesión / registrarse (la única página pública) |
| `/` | Con sesión | Tienda (Wireframe A) |
| `/admin` | Solo admin | Panel de administración de productos |

- **Login obligatorio:** todas las rutas, salvo `/login`, están dentro de una ruta layout protegida (`ProtectedRoute` + `<Outlet />`). Sin sesión, cualquier URL (incluidas `/admin` o rutas inexistentes) redirige a `/login`. La API también exige el token, así que los datos no se pueden leer sin iniciar sesión.
- **Regreso a la página pedida:** si entras con un enlace directo (por ejemplo `/admin?tab=x`), después del login vuelves ahí. Solo se aceptan rutas internas (se bloquean redirecciones abiertas como `//otro-sitio`), y un usuario sin rol admin que venía de `/admin` va a la tienda. Al cerrar sesión no se guarda la ruta, para que la siguiente persona empiece desde cero.
- **Sesión:** `AuthContext` guarda el token JWT y el usuario en `localStorage`. Al cargar, descarta de inmediato un token malformado o vencido (lee el `exp` del JWT) y valida el resto con `GET /auth/me`. Un temporizador cierra la sesión justo cuando el token expira, y cualquier 401 de la API también la cierra. En esos casos el login muestra "Tu sesión expiró".
- **Roles:** un usuario sin rol admin que abre `/admin` ve un aviso 403.
- **Header:** solo aparece con sesión. Muestra el usuario con su rol, el enlace al panel (solo admin) y "Cerrar sesión", también en el menú móvil.

## Secciones de la tienda (Wireframe A)

| Sección | Componente | Datos |
|---|---|---|
| Barra superior + navegación | `Header` | Sesión del usuario; menú hamburguesa en móvil |
| Hero + 3 beneficios | `Hero` | Estático |
| Grid de 6 productos | `ProductGrid`, `ProductCard` | **API**: `GET /products` y `GET /categories` |
| Galería de 4 categorías | `Gallery` | **API**: `GET /categories` (portada por categoría) |
| 3 testimonios en círculo | `Testimonials`, `ReviewModal` | **API**: `GET /reviews`, `POST /products/:id/reviews` |
| Footer | `Footer` | Estático |

- **Grid de productos:** pestañas de categoría (un dropdown en móvil), "Cargar más", skeletons, transición sin parpadeo entre categorías y precarga de imágenes.
- **Testimonios:** las 3 reseñas más recientes, con la más nueva al centro como en el wireframe. Cualquier usuario puede publicar una reseña desde un modal con selector de estrellas.

## Panel de administración

- Tabla de productos con búsqueda (con debounce), filtro por categoría, orden y paginación, todo con los query params de `GET /products`.
- Crear y editar en un modal: validación en el cliente y errores de la API mostrados en cada campo. La imagen se elige de la biblioteca local (`GET /images`) o con una URL externa, con vista previa.
- Eliminar con un modal de confirmación propio, sin `window.confirm`.
- Avisos (toasts) de éxito y error; resumen de productos, categorías y marcas.
- En móvil la tabla se convierte en tarjetas.

## Pruebas

```bash
npm test
```

38 pruebas con **Vitest**, **jsdom** y **Testing Library**. No necesitan la API: las llamadas se simulan.

| Archivo | Qué cubre |
|---|---|
| `src/utils/utils.test.js` | Validación de formularios, formato de precios, redirección segura después del login (bloquea `//otro-sitio`), lectura del `exp` del JWT, URLs de imágenes |
| `src/services/api.test.js` | Cliente HTTP: header Bearer, query params, errores con detalle por campo, un 401 con sesión cierra la sesión |
| `src/App.test.jsx` | Flujo completo con el router: cualquier URL sin sesión muestra el login, cuentas de prueba, validación, regreso a la página pedida, 403 para `user`, cerrar sesión, token vencido o rechazado y cierre automático al expirar |

Además, durante el desarrollo se probó todo el flujo en Chrome real (login, CRUD del panel, reseñas, móvil).

## Estructura

```
src/
├── components/     # Bloques BEM reutilizables (Header, Modal, StarRating, ProductGrid…)
├── context/        # AuthContext (sesión) y ToastContext (avisos)
├── hooks/          # useProducts, useCategories, useDebouncedValue
├── pages/          # StorePage, LoginPage, AdminPage
├── services/       # Cliente HTTP de la API (token y manejo de 401)
├── styles/         # Variables (paleta), base y formularios
├── utils/          # Validación, formato, imágenes, JWT y redirección segura
├── test/           # Configuración y helpers de pruebas
├── App.jsx         # Rutas
└── main.jsx
```

## Decisiones de diseño

- **BEM:** cada componente es un bloque (`.product-card`), con elementos (`.product-card__price`) y modificadores (`.product-grid__tab--active`). Los estilos viven junto a su componente.
- **Paleta 1** del documento de la prueba como variables CSS en `styles/variables.css`.
- **Mobile first:** puntos de quiebre en 600, 768 y 1024 px, y container queries en la galería.
- **Accesibilidad:** HTML semántico, `aria-*`, modales con foco atrapado y cierre con Esc, selector de estrellas con radios, foco visible y soporte para `prefers-reduced-motion`.
- **Validación doble:** el cliente valida para dar respuesta inmediata; la API siempre valida de nuevo con Zod.
