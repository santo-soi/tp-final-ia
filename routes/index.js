const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db.js');

const router = express.Router();

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * En app.js se insertan estas rutas en '/' 
 * con la expresión:
 *
 * app.use("/", indexRouter);
 *
 * En este caso, las rutas de este archivo son
 * relativas a la ruta raíz, ver el caso de user.js
 * que es distinto.
 */


router.get('/', (req, res, next) => {
    // Página principal del sitio.
    res.render('index', { pageTitle: 'Inicio' });
});


/**
 * About
 */

router.get('/about', (req, res, next) => {
    // Información sobre el sitio.
    res.render('about', { pageTitle: 'El proyecto' });
});


/**
 * Middleware para login y signup con get y post.
 * Comprueba que el usuario no esté logueado para poder
 * acceder a las rutas.
 */
function notlogged(req, res, next) {
    // Si el usuario no está logueado, continúa.
    if (!req.session.user) {
        next();
    } else {
        res.redirect('/user');
    }
}


/**
 * Signup
 */

router.get('/signup', notlogged, (req, res, next) => {
    // Enviar el formulario.
    res.render('signup', { pageTitle: 'Registrarse' });
});

router.post('/signup', notlogged, (req, res, next) => {
    const {
        username = '',
        password = '',
        confirmPassword = '',
    } = req.body;

    const cleanUsername = username.trim();

    if (!USERNAME_REGEX.test(cleanUsername)) {
        req.session.error = 'El usuario debe tener entre 3 y 20 caracteres: letras, números o guión bajo.';
        return res.redirect('/signup');
    }

    if (password.length < 8) {
        req.session.error = 'La contraseña debe tener al menos 8 caracteres.';
        return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
        req.session.error = 'Las contraseñas no coinciden.';
        return res.redirect('/signup');
    }

    if (db.userExists(cleanUsername)) {
        req.session.error = 'Ese nombre de usuario ya está en uso.';
        return res.redirect('/signup');
    }

    const hash = bcrypt.hashSync(password, 10);
    // Pasamos solo username y hash
    db.addUser(cleanUsername, hash); 

    req.session.success = 'Tu cuenta fue creada. Ahora podés ingresar.';
    res.redirect('/login');
});


/**
 * Login
 */

function authenticate(username, password) {
    if (!db.userExists(username)) return false;

    const hash = db.getHash(username);
    return bcrypt.compareSync(password, hash);
}

router.get('/login', notlogged, (req, res, next) => {
    res.render('login', { pageTitle: 'Ingresar' });
});

router.post('/login', notlogged, (req, res, next) => {
    const { username = '', password = '' } = req.body;
    const cleanUsername = username.trim();
    const ok = authenticate(cleanUsername, password);

    if (!ok) {
        req.session.error = 'Usuario o contraseña incorrectos.';
        return res.redirect('/login');
    }

    req.session.regenerate(() => {
        req.session.user = cleanUsername;
        req.session.success = `Bienvenide, ${cleanUsername}.`;
        res.redirect('/user');
    });
});


module.exports = router;
