const express = require('express');
const db = require('../database/db.js');
const paleta = require('../config/palette.js');

const router = express.Router();

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/**
 * En app.js se insertan estas rutas en '/user'
 * con la expresión:
 *
 * app.use("/user", userRouter);
 *
 * Las rutas desde este archivo son relativas a
 * '/user', por lo tanto, '/' en este archivo
 * es '/user' en el servidor y '/profile' en este
 * archivo es '/user/profile' en el servidor.
 */


/**
 * Middleware de enrutador
 *
 * Restringe el acceso a las páginas cuando el usuario
 * no está logueado. Se aplica en cadena en las rutas
 * que lo requieran dentro de la sección /user.
 */

function restricted(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Para entrar a tu espacio necesitás iniciar sesión.';
        res.redirect('/login');
    }
}

router.use(restricted);


/**
 * Página principal de usuario/a.
 */

router.get('/', (req, res, next) => {
    res.render('user', { pageTitle: 'Mi espacio' });
});


/**
 * Página de perfil de usuario/a.
 */

router.get('/profile', (req, res, next) => {
    res.render('profile', { pageTitle: 'Mi perfil' });
});

router.post('/profile', (req, res, next) => {
    const currentUsername = req.session.user;
    const { username = '', email = '' } = req.body;

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!USERNAME_REGEX.test(cleanUsername)) {
        req.session.error = 'El usuario debe tener entre 3 y 20 caracteres: letras, números o guión bajo.';
        return res.redirect('/user/profile');
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
        req.session.error = 'Ingresá un correo electrónico válido.';
        return res.redirect('/user/profile');
    }

    if (cleanUsername !== currentUsername && db.userExists(cleanUsername)) {
        req.session.error = 'Ese nombre de usuario ya está en uso.';
        return res.redirect('/user/profile');
    }

    try {
        db.updateUser(currentUsername, cleanUsername, cleanEmail);
        req.session.user = cleanUsername;
        req.session.success = 'Tus datos se actualizaron.';
    } catch (error) {
        console.error(error);
        req.session.error = 'No se pudieron guardar los cambios. Intentá de nuevo.';
    }

    res.redirect('/user/profile');
});


/**
 * Carga de la voz.
 * Por ahora la ruta existe y redirige; la funcionalidad
 * completa (foto, frase y color) se implementa en la próxima etapa.
 */

router.get('/upload', (req, res, next) => {
    res.render('upload', {
        pageTitle: 'Mi voz',
        paleta,
    });
});

router.post('/upload', (req, res, next) => {
    req.session.success = 'La carga de tu voz va a estar disponible en la próxima etapa.';
    res.redirect('/user/profile');
});


/**
 * Borrado de la voz.
 */

router.post('/profile/delete-voz', (req, res, next) => {
    db.deleteVoz(req.session.user);
    req.session.success = 'Tu voz fue eliminada. Tu pez vuelve a quedar blanco.';
    res.redirect('/user/profile');
});


/**
 * Logout
 */

router.get('/logout', (req, res, next) => {
    // Destruye los datos de la sesión y redirige a la página principal.
    req.session.destroy(() => {
        res.redirect('/');
    });
});


module.exports = router;
