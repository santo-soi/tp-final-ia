# Océano de Voces

Sitio web artístico colaborativo para el trabajo práctico de la facultad. Cada persona registrada tiene un pez dentro de un cardumen; cuando carga su voz (frase y color), su pez se pinta y, al hacer clic en el océano, su voz se muestra en una viñeta junto a su foto de perfil.

## Estado actual

La **estructura de navegación, los endpoints y el estilo base con Tailwind CSS** están funcionando, al igual que el login, el registro y la edición de usuario, contraseña y foto de perfil (`/user/profile`). La carga de la voz (`/user/upload`) guarda frase y color. La obra (`/obra`) genera un pez por cada usuario registrado en el sketch de p5.js.

## Requisitos

- Node.js 18 o superior.
- npm.

## Instalación y ejecución

```bash
npm install
npm run build:css
npm start
```

El servidor queda disponible en `http://localhost:3000`.

Para desarrollo con recarga automática:

```bash
npm run dev
```

Para recompilar Tailwind mientras se editan las vistas:

```bash
npm run watch:css
```

## Scripts

| Script | Función |
|---|---|
| `npm start` | Compila Tailwind y levanta el servidor. |
| `npm run dev` | Compila Tailwind y levanta el servidor con `nodemon`. |
| `npm run build:css` | Genera `public/css/style.css` en modo minificado. |
| `npm run watch:css` | Recompila Tailwind al detectar cambios. |

## Mapa de navegación

### Públicas

| Método | Ruta | Función |
|---|---|---|
| GET | `/` | Portada con descripción, accesos a login, registro y obra. |
| GET | `/about` | Información del proyecto y decisiones. |
| GET | `/signup` | Formulario de registro. |
| POST | `/signup` | Crea la cuenta y redirige al login. |
| GET | `/login` | Formulario de ingreso. |
| POST | `/login` | Autentica y redirige a `/user`. |
| GET | `/obra` | Página de la obra con el sketch de p5.js (un pez por usuario). |
| GET | `/obra/data` | JSON con todos los usuarios registrados y sus voces. |

### Privadas (`/user`, requieren sesión)

| Método | Ruta | Función |
|---|---|---|
| GET | `/user` | Índice de usuario con accesos a perfil, voz y obra. |
| GET | `/user/profile` | Datos de la cuenta (usuario, contraseña y foto) y estado de la voz. |
| POST | `/user/profile` | Actualiza usuario, contraseña y foto de perfil (multipart, vía formidable). |
| GET | `/user/upload` | Formulario de carga/edición de la voz. |
| POST | `/user/upload` | Guarda la voz del usuario logueado: frase y color. |
| POST | `/user/profile/delete-voz` | Borra la voz del usuario. |
| GET | `/user/logout` | Cierra la sesión. |

## Navegación

Todas las páginas comparten un header y un footer con enlaces. El header cambia según la sesión:

- **Visitante:** La obra · El proyecto · Ingresar · Registrarme.
- **Usuario logueado:** La obra · El proyecto · Mi espacio · Mi voz · Perfil · Salir.

Las páginas privadas tienen un enlace “← Volver a mi espacio”. La portada, el login y el registro enlazan entre sí, y la obra se puede alcanzar desde la portada, el índice de usuario y el footer.

## Estructura

```
app.js
config/
  palette.js
database/
  db.js
  create_users.sql
  create_voces.sql
routes/
  index.js
  user.js
  obra.js
views/
  partials/
    head.ejs
    header.ejs
    flash.ejs
    foot.ejs
  index.ejs
  about.ejs
  login.ejs
  signup.ejs
  user.ejs
  profile.ejs
  upload.ejs
  obra.ejs
  404.ejs
  error.ejs
public/
  css/
    input.css
    style.css
tailwind.config.js
```

## Decisiones de diseño

- Un pez por cada usuario registrado, aunque todavía no haya cargado su voz.
- El username es el nombre visible en la obra y se puede cambiar desde el perfil.
- La foto de perfil se sube desde `/user/profile` y es opcional; se guarda en la tabla `users`.
- La voz (frase y color) se carga desde `/user/upload`; se guarda en la tabla `voces`.
- Una frase de hasta 180 caracteres y un color de la paleta (`config/palette.js`).
- El pez se pinta con el color elegido si el usuario cargó su voz; si no, permanece blanco.
- La obra es pública; para cargar o editar la voz hay que iniciar sesión.
- Al hacer clic en el canvas, la voz del pez con voz más cercano se muestra en una viñeta (`vineta-frase`) durante 6 segundos.

## Rama de trabajo

El desarrollo de esta etapa está en la rama `estructura-navegacion`.
