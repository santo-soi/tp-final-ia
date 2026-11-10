const express = require('express');
const db = require('../database/db.js');

const router = express.Router();

/**
 * En app.js se inserta este enrutador en '/obra'.
 *
 * GET /obra      -> página de la obra.
 * GET /obra/data -> datos JSON para el sketch de p5.js.
 */

router.get('/', (req, res, next) => {
    // Los usuarios registrados se envían a la vista y de ahí al sketch de p5.js.
    const usuarios = db.getSketchData();

    // Se serializa como string JSON seguro para embeber en un <script>
    // (se escapan los '<' para que una frase no pueda cerrar el tag).
    const usuariosObra = JSON.stringify(usuarios).replace(/</g, '\\u003c');

    res.render('obra', { pageTitle: 'La obra', usuariosObra });
});

router.get('/data', (req, res, next) => {
    const data = db.getSketchData();
    res.set('Cache-Control', 'no-store');
    res.json(data);
});

module.exports = router;
