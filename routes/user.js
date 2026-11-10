const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../database/db.js');
const paleta = require('../config/palette.js');
const bcrypt = require('bcryptjs');

const router = express.Router();

const { formidable } = require('formidable');

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Extensiones aceptadas para la foto de perfil.
const EXTENSIONES_FOTO = new Set(['.jpg', '.jpeg', '.png', '.webp']);

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

/**
 * Guardado del perfil.
 *
 * El formulario es multipart/form-data porque incluye la foto
 * de perfil, así que lo procesa formidable en lugar de
 * express.urlencoded (que solo entiende formularios de texto).
 */

router.post('/profile', (req, res, next) => {
    const currentUsername = req.session.user;

    // 1. Configuramos formidable para la foto de perfil
    const form = formidable({
        uploadDir: 'uploads',
        keepExtensions: true, // Conserva .jpg/.png/.webp del archivo original
        allowEmptyFiles: true, // Permite guardar el resto si no se subió foto
        minFileSize: 0,
        maxFileSize: 2 * 1024 * 1024, // 2 MB
        filter: ({ mimetype }) => {
            // Filtramos para que solo acepte imágenes
            const tiposSoportados = new Set(['image/jpeg', 'image/png', 'image/webp']);
            return !mimetype || tiposSoportados.has(mimetype);
        }
    });

    // 2. Procesamos el formulario
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            req.session.error = 'Hubo un problema al procesar tu foto. Revisá que sea JPG, PNG o WebP y no pese más de 2 MB.';
            return res.redirect('/user/profile');
        }

        // Formidable v3 devuelve los campos y archivos como arrays
        const cleanUsername = (fields.username ? fields.username[0] : '').trim();
        const currentPassword = fields.currentPassword ? fields.currentPassword[0] : '';
        const newPassword = fields.newPassword ? fields.newPassword[0] : '';
        const archivoFoto = files.foto ? files.foto[0] : null;

        // Solo se procesa si efectivamente subió un archivo (y pesa más de 0 bytes)
        const subioFoto = Boolean(archivoFoto && archivoFoto.size > 0);

        // Si una validación falla, descartamos el archivo que formidable ya guardó
        const descartarArchivoSubido = () => {
            if (subioFoto) {
                try { fs.rmSync(archivoFoto.filepath, { force: true }); } catch { /* nada */ }
            }
        };

        // 3. Validar formato del nuevo nombre de usuario
        if (!USERNAME_REGEX.test(cleanUsername)) {
            descartarArchivoSubido();
            req.session.error = 'El usuario debe tener entre 3 y 20 caracteres: letras, números o guión bajo.';
            return res.redirect('/user/profile');
        }

        // 4. Verificar si el nombre de usuario ya existe
        if (cleanUsername !== currentUsername && db.userExists(cleanUsername)) {
            descartarArchivoSubido();
            req.session.error = 'Ese nombre de usuario ya está en uso.';
            return res.redirect('/user/profile');
        }

        // 5. Validar la extensión de la foto subida
        if (subioFoto && !EXTENSIONES_FOTO.has(path.extname(archivoFoto.filepath).toLowerCase())) {
            descartarArchivoSubido();
            req.session.error = 'La foto debe ser un archivo JPG, PNG o WebP.';
            return res.redirect('/user/profile');
        }

        // 6. Validar la longitud de la nueva contraseña
        if (newPassword && newPassword.length < 6) {
            descartarArchivoSubido();
            req.session.error = 'La nueva contraseña debe tener al menos 6 caracteres.';
            return res.redirect('/user/profile');
        }

        try {
            // 7. Procesar el cambio de contraseña (si el usuario completó algo)
            if (currentPassword || newPassword) {
                // Si llenó uno pero le faltó el otro
                if (!currentPassword || !newPassword) {
                    descartarArchivoSubido();
                    req.session.error = 'Para cambiar la contraseña, tenés que completar tanto la actual como la nueva.';
                    return res.redirect('/user/profile');
                }

                // Obtenemos la contraseña encriptada actual de la base de datos
                const currentHash = db.getHash(currentUsername);

                // Comparamos lo que ingresó con lo que está guardado
                const match = bcrypt.compareSync(currentPassword, currentHash);
                if (!match) {
                    descartarArchivoSubido();
                    req.session.error = 'La contraseña actual es incorrecta.';
                    return res.redirect('/user/profile');
                }
            }

            // 8. Guardar la foto de perfil nueva (si subió una)
            if (subioFoto) {
                const usuarioActual = db.getUser(currentUsername);
                const fotoVieja = usuarioActual ? usuarioActual.foto : null;

                // Guardamos la ruta pública del archivo subido en la tabla users
                db.updateFoto(currentUsername, '/uploads/' + archivoFoto.newFilename);

                // Borramos del disco la foto anterior para no acumular archivos
                if (fotoVieja) {
                    try { fs.rmSync(path.join('uploads', path.basename(fotoVieja)), { force: true }); } catch { /* nada */ }
                }
            }

            // 9. Si la contraseña se validó bien, la encriptamos y la guardamos
            if (currentPassword && newPassword) {
                const newHash = bcrypt.hashSync(newPassword, 10);
                db.updatePassword(currentUsername, newHash);
            }

            // 10. Actualizamos el nombre de usuario (cambie o no)
            if (cleanUsername !== currentUsername) {
                db.updateUsername(currentUsername, cleanUsername);
                req.session.user = cleanUsername; // Actualizamos la sesión para no desloguearlo
            }

            req.session.success = subioFoto
                ? 'Tus datos y tu foto de perfil se actualizaron correctamente.'
                : 'Tus datos se actualizaron correctamente.';
            res.redirect('/user/profile');

        } catch (error) {
            console.error(error);
            req.session.error = 'No se pudieron guardar los cambios. Intentá de nuevo.';
            res.redirect('/user/profile');
        }
    });
});


/**
 * Carga de la voz.
 *
 * El formulario es urlencoded (solo texto: frase y color), así que
 * los datos llegan en req.body gracias a express.urlencoded.
 * La foto de perfil se administra desde /user/profile.
 */

router.get('/upload', (req, res, next) => {
    res.render('upload', {
        pageTitle: 'Mi voz',
        paleta,
    });
});

router.post('/upload', (req, res, next) => {
    const username = req.session.user;

    const frase = (req.body.frase || '').trim();
    const color = (req.body.color || '').trim();

    // 1. Validar la frase
    if (!frase) {
        req.session.error = 'Escribí una frase para tu voz.';
        return res.redirect('/user/upload');
    }

    if (frase.length > 180) {
        req.session.error = 'La frase no puede superar los 180 caracteres.';
        return res.redirect('/user/upload');
    }

    // 2. Validar que el color pertenezca a la paleta de la obra
    if (!paleta.some((opcion) => opcion.hex === color)) {
        req.session.error = 'Elegí un color de la paleta para tu pez.';
        return res.redirect('/user/upload');
    }

    try {
        // 3. Guardamos la voz del usuario logueado
        db.upsertVoz({ username, frase, color });

        req.session.success = '¡Tu voz fue cargada con éxito! Ya estás nadando en el cardumen.';
        res.redirect('/user/profile');

    } catch (error) {
        console.error(error);
        req.session.error = 'Hubo un error al guardar tu voz. Intentá de nuevo.';
        res.redirect('/user/upload');
    }
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
