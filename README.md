# Océano de Voces

Sitio web artístico y colaborativo desarrollado por Juan Francisco Santillán y Santino Iosipescu como trabajo práctico integrador de la materia Informática Aplicada I, Cátedra Samaruga, de la carrera [Artes Multimediales](https://multimedia.una.edu.ar/) de la [Universidad Nacional de las Artes (UNA)](https://una.edu.ar/). 

La propuesta consiste en un espacio virtual, llamado "Océano de Voces". Allí, se despliega un campo de particulas que construirá una visual única a través de un algoritmo generativo con ruido de Perlin, y sobre el que el público podrá intervenir.
Cada persona que se registre, creará un pez que nadará sobre ese mar de partículas. Además, podrán darles voz, cargando una frase y color desde la página "Mi Voz". Finalmente, se mostrará ese cárdumen de colaboradores que, cada 10 segundos, iluminará un pez de quien haya ingresado su voz, pintándolo del color elegido previamente y exponiendo en una viñeta junto a su foto de perfil (si la cargó), la frase que haya escrito.

## Información técnica para correr el sitio

### Requisitos

- Node.js 18 o superior.
- npm.
- Tailwindcss.

### Instalación y ejecución

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

### Scripts

| Script | Función |
|---|---|
| `npm start` | Compila Tailwind y levanta el servidor. |
| `npm run dev` | Compila Tailwind y levanta el servidor con `nodemon`. |
| `npm run build:css` | Genera `public/css/style.css` en modo minificado. |
| `npm run watch:css` | Recompila Tailwind al detectar cambios. |

### Mapa de navegación

#### Públicas

| Método | Ruta | Función |
|---|---|---|
| GET | `/` | Portada con descripción, accesos a login, registro y obra. |
| GET | `/about` | Información del proyecto. |
| GET | `/signup` | Formulario de registro. |
| POST | `/signup` | Crea la cuenta y redirige al login. |
| GET | `/login` | Formulario de ingreso. |
| POST | `/login` | Autentica y redirige a `/user`. |
| GET | `/obra` | Página de la obra con el sketch de p5.js (un pez por usuario). |
| GET | `/obra/data` | JSON con todos los usuarios registrados y sus voces. |

#### Privadas (`/user`, requieren sesión)

| Método | Ruta | Función |
|---|---|---|
| GET | `/user` | Índice de usuario con accesos a perfil, voz y obra. |
| GET | `/user/profile` | Datos de la cuenta (usuario, contraseña y foto) y estado de la voz. |
| POST | `/user/profile` | Actualiza usuario, contraseña y foto de perfil (multipart, vía formidable). |
| GET | `/user/upload` | Formulario de carga/edición de la voz. |
| POST | `/user/upload` | Guarda la voz del usuario logueado: frase y color. |
| POST | `/user/profile/delete-voz` | Borra la voz del usuario. |
| GET | `/user/logout` | Cierra la sesión. |

### Navegación

Todas las páginas comparten un header y un footer con enlaces. El header cambia según la sesión:

- **Visitante:** El Océano · Bio · Ingresar · Registrarme.
- **Usuario logueado:** El Oceáno · Bio · Mi voz · Perfil · Salir.

Las páginas privadas tienen un enlace “← Volver a mi espacio”. La portada, el login y el registro enlazan entre sí, y la obra se puede alcanzar desde la portada, el índice de usuario y el footer.

### Estructura

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
- Cada 10 segundos, se elegirá aleatoriamente la voz de un usuario, pintando su pez del color elegido y mostrándola en una viñeta (`vineta-frase`) durante 6 segundos.

## Rama de trabajo

Fuimos trabajando en distintas ramas sin un criterio específico para, a medido que avanzabamos, juntar los cambios en main.
