/**
 * Este es el archivo principal de la aplicación servidor.
 */

// Imports de commonjs.
const path = require('path');
const express = require('express');
const session = require('express-session');

// Enrutadores de la carpeta '/routes'.
const indexRouter = require('./routes/index.js');
const userRouter = require('./routes/user.js');
const obraRouter = require('./routes/obra.js');

// Acceso a la base de datos.
const db = require('./database/db.js');

// Define el puerto en una constante.
const PORT = 3000;

// Crea el objeto de la aplicación.
const app = express();


/**
 * Configuración de los valores de la aplicación.
 */

app.set('port', PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');


/**
 * Configuración del middleware.
 */

// Procesa los datos de las peticiones POST y los pone disponibles en `req.body`.
app.use(express.urlencoded({ extended: true }));

// Sirve los archivos estáticos del proyecto.
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware global de sesión.
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'clave secreta en el servidor',
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
    },
}));

// Carga el usuario actual, la ruta activa y los mensajes flash en todas las vistas.
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.currentUser = null;

    if (req.session.user) {
        const user = db.getUser(req.session.user);

        if (user) {
            res.locals.currentUser = user;
        } else {
            delete req.session.user;
        }
    }

    res.locals.flash = {
        error: req.session.error || null,
        success: req.session.success || null,
    };

    delete req.session.error;
    delete req.session.success;

    next();
});


/**
 * Configuración de los enrutadores.
 */

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/obra', obraRouter);


/**
 * Manejo de rutas no encontradas y errores.
 */

app.use((req, res) => {
    res.status(404).render('404', { pageTitle: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
    console.error(err);

    // Asegura que la vista de error tenga los datos que usan los partials,
    // incluso si el fallo ocurrió antes del middleware de usuario/flash.
    res.locals.currentUser = res.locals.currentUser || null;
    res.locals.currentPath = res.locals.currentPath || req.path;
    res.locals.flash = res.locals.flash || { error: null, success: null };

    res.status(500).render('error', { pageTitle: 'Error del servidor' });
});


/**
 * Inicialización de la aplicación servidor.
 */

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
