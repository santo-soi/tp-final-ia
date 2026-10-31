const express = require('express');
const db = require('../database/db.js');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('obra', { pageTitle: 'Obra Colectiva' });
});

router.get('/data', (req, res, next) => {
    const data = db.getSketchData();
    console.log('*** Sketch DATA:', data);  // Log para comprobar que el formato esté correcto.
    res.send(data);
});

module.exports = router;
