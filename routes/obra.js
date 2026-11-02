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
    res.render('obra', { pageTitle: 'La obra' });
});

router.get('/data', (req, res, next) => {
    const data = db.getSketchData();
    res.set('Cache-Control', 'no-store');
    res.json(data);
});

module.exports = router;
