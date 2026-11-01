const express = require('express');
const router = express.Router();

/**
 * En app.js se insertan estas rutas en '/users'
 * con la expresión:
 *
 * app.use("/users", userRouter);
 *
 * Las rutas desde este archivo son relativas a
 * '/user', por lo tanto, '/' en este archivo
 * es '/user' en el servidor y '/profile' en este
 * archivo es '/user/profile' en el servidor.
 */

/**
 * Middleware de enrutador
 *
 * Middleware para restringir el acceso a las páginas
 * cuando el usuario no está logueado. Se aplica en cadena
 * en las rutas que lo requieran dentro la sección /user.
 */

function restricted(req, res, next) {
    if (req.session.user) {
        // Le pasa el control al próximo middleware que muestra la página de usuario.
        next();
    } else {
        // Guarda un mensaje de error en la sesión y redirecciona a la ruta /login que es pública.
        // Puede ser otra ruta como _home_ u otra página de error.
        // No llama a next() por lo que genera una respuesta y corta la cadena de middlewares.
        req.session.error = 'Acceso denegado!';
        res.redirect('/login');
    }
}

router.use(restricted);


/**
 * Página principal de usuario/a.
 */

router.get('/', (req, res, next) => {
    console.log("*** req.session: ", req.session);
    res.render('user', { pageTitle: 'Usuario' });
});


/**
 * Página de perfil de usuario/a.
 */

router.get('/profile', (req, res, next) => {
    res.render('profile', { pageTitle: 'Perfil' });
});


/**
 * Logout
 */

router.get('/logout', (req, res, next) => {
    // Destruye los datos de la sesión que se regeneran para la próxima petición.
    // El usuario queda deslogueado y se lo redirecciona a la página principal.
    req.session.destroy(() => {
        res.redirect('/');
    });
});


module.exports = router;
