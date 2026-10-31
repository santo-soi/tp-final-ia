const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db.js');

const router = express.Router();


/**
 * En app.js se insertan estas rutas en '/'
 * con la expresión:
 *
 * app.use("/", indexRouter);
 *
 * En este caso, las rutas de este archivo son
 * relativas a la ruta raíz, ver el caso de users.js
 * que es distinto.
 */


router.get('/', (req, res, next) => {
    // Página principal del sitio.
    res.render('index', { pageTitle: 'Página principal' });
});


/**
 * About
 */

router.get('/about', (req, res, next) => {
    // Información sobre el sitio.
    res.render('about', { pageTitle: 'About' });
});


/**
 * Middleware para login y signup con get y post.
 * Comprueba que el usuario no esté logueado para poder
 * acceder a las rutas.
 */
function notlogged(req, res, next) {
    // Si el usuario no está logueado, continúa.
    if(!req.session.user) {
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
    const { username, email, password } = req.body;

    if(db.userExists(username)) {
        res.send('Error: El nombre de usuario ya existe');
        return
    }

    const hash = bcrypt.hashSync(password, 10);
    db.addUser(username, email, hash);

    // Recibir y procesa los datos del formulario, redirecciona al logueo.
    res.redirect('/login');
});


/**
 * Login
 */

function authenticate(username, password) {
    if (!db.userExists(username)) return false
    const hash = db.getHash(username);
    const ok = bcrypt.compareSync(password, hash);
    if (ok) return true
    else return false
}

router.get('/login', notlogged, (req, res, next) => {
    res.render('login', { pageTitle: 'Logueo' });
});

router.post('/login', notlogged, (req, res, next) => {
    const { username, password } = req.body;
    const ok = authenticate(username, password);

    if(ok) {
        req.session.regenerate(() => {
            req.session.user = username;
            req.session.success = `Autenticado como ${username}`;
            res.redirect('/user');
        });
    } else {
        req.session.error = 'La autenticación falló, revise su nombre de usuario y contraseña';
        res.redirect('/login');
    }

    // Log para ver los datos de la base de datos *** BORRAR.
    db.log();
});


module.exports = router;
