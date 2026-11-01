# Océano de Voces

Sitio web artístico colaborativo para el trabajo práctico de la facultad. Cada persona registrada tiene un pez dentro de un cardumen; cuando carga su voz (foto, frase y color), su pez puede iluminarse y mostrar su historia en la obra.

## Estado actual

Esta etapa resuelve la **estructura de navegación, los endpoints y el estilo base con Tailwind CSS**. El login, el registro y la edición de usuario/mail están funcionando. La carga completa de la voz (foto, frase y color) y el sketch en p5.js quedan para la próxima etapa.

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
| GET | `/obra` | Página de la obra (por ahora, placeholder del sketch). |
| GET | `/obra/data` | JSON con todos los usuarios registrados y sus voces. |

### Privadas (`/user`, requieren sesión)

| Método | Ruta | Función |
|---|---|---|
| GET | `/user` | Índice de usuario con accesos a perfil, voz y obra. |
| GET | `/user/profile` | Datos de la cuenta y estado de la voz. |
| POST | `/user/profile` | Actualiza usuario y mail. |
| GET | `/user/upload` | Formulario de carga/edición de la voz. |
| POST | `/user/upload` | Ruta preparada; la carga completa se implementa en la próxima etapa. |
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
- La foto de perfil es obligatoria.
- El mail se muestra en la obra, con opción de ocultarlo.
- Una frase de hasta 180 caracteres.
- La obra es pública; para cargar o editar la voz hay que iniciar sesión.
- El ciclo de la obra iluminará un pez cada 10 segundos.

## Rama de trabajo

El desarrollo de esta etapa está en la rama `feature/estructura-navegacion`.
