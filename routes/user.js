const express = require('express');
const db = require('../database/db.js');
const paleta = require('../config/palette.js');
const bcrypt = require('bcryptjs');

const router = express.Router();

const { formidable } = require('formidable');

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

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
    const { username = '', currentPassword = '', newPassword = '' } = req.body;

    const cleanUsername = username.trim();

    // 1. Validar formato del nuevo nombre de usuario
    if (!USERNAME_REGEX.test(cleanUsername)) {
        req.session.error = 'El usuario debe tener entre 3 y 20 caracteres: letras, números o guión bajo.';
        return res.redirect('/user/profile');
    }

    // 2. Verificar si el nombre de usuario ya existe
    if (cleanUsername !== currentUsername && db.userExists(cleanUsername)) {
        req.session.error = 'Ese nombre de usuario ya está en uso.';
        return res.redirect('/user/profile');
    }

    try {
        // 3. Procesar el cambio de contraseña (si el usuario completó algo)
        if (currentPassword || newPassword) {
            // Si llenó uno pero le faltó el otro
            if (!currentPassword || !newPassword) {
                req.session.error = 'Para cambiar la contraseña, tenés que completar tanto la actual como la nueva.';
                return res.redirect('/user/profile');
            }

            // Obtenemos la contraseña encriptada actual de la base de datos
            const currentHash = db.getHash(currentUsername);
            
            // Comparamos lo que ingresó con lo que está guardado
            const match = bcrypt.compareSync(currentPassword, currentHash);
            if (!match) {
                req.session.error = 'La contraseña actual es incorrecta.';
                return res.redirect('/user/profile');
            }

            // Si es correcta, encriptamos la nueva y la guardamos
            const newHash = bcrypt.hashSync(newPassword, 10);
            db.updatePassword(currentUsername, newHash); 
        }

        // 4. Actualizamos el nombre de usuario (cambie o no)
        if (cleanUsername !== currentUsername) {
            db.updateUsername(currentUsername, cleanUsername);
            req.session.user = cleanUsername; // Actualizamos la sesión para no desloguearlo
        }

        req.session.success = 'Tus datos se actualizaron correctamente.';
        res.redirect('/user/profile');

    } catch (error) {
        console.error(error);
        req.session.error = 'No se pudieron guardar los cambios. Intentá de nuevo.';
        res.redirect('/user/profile');
    }
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
    // 1. Configuramos formidable según la guía de la cátedra
    const form = formidable({
        uploadDir: 'uploads',
        allowEmptyFiles: true, // Permite guardar la voz aunque no suba foto
        minFileSize: 0,
        filter: ({ mimetype }) => {
            // Filtramos para que solo acepte imágenes
            const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
            return !mimetype || supportedTypes.has(mimetype);
        }
    });

    // 2. Procesamos el formulario
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            req.session.error = 'Hubo un error al procesar tu imagen. Intentá de nuevo.';
            return res.redirect('/user/upload');
        }

        const username = req.session.user;
        
        // Formidable devuelve arrays en 'fields', tomamos el primer elemento
        const frase = fields.frase ? fields.frase[0].trim() : '';
        const color = fields.color ? fields.color[0] : '';

        // 1. Consultamos los datos actuales del usuario en la base de datos
        const usuarioActual = db.getUser(username);

        // 2. Por defecto, mantenemos la foto que ya tenía guardada
        let fotoPath = usuarioActual ? usuarioActual.foto : null;

        // 3. Si efectivamente subió un archivo nuevo (y pesa más de 0 bytes), pisamos la variable
        if (files.foto && files.foto[0].size > 0) {
            fotoPath = '/uploads/' + files.foto[0].newFilename;
        }

        try {
            // 3. Guardamos todo en la tabla 'voces' usando tu función
            db.upsertVoz({
                username: username,
                frase: frase,
                color: color,
                foto: fotoPath,
            });

            req.session.success = '¡Tu voz fue cargada con éxito! Ya estás nadando en el cardumen.';
            res.redirect('/user/profile');

        } catch (error) {
            console.error(error);
            req.session.error = 'Hubo un error al guardar tu voz.';
            res.redirect('/user/upload');
        }
    });
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
