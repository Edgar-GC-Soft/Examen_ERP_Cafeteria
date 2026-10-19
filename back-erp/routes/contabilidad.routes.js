const express = require('express');
const router = express.Router();
const contabilidadService = require('../services/contabilidad.service');
const xmlService = require('../services/xml.service');

// GET /api/contabilidad?desde=&hasta=&tipo=&origen=&buscar=
router.get('/', async (req, res) => {
    res.json(await contabilidadService.obtenerTransacciones(req.query));
});

// GET /api/contabilidad/xml: descarga el XML con los datos (acepta los mismos filtros)
router.get('/xml', async (req, res) => {
    const transacciones = await contabilidadService.obtenerTransacciones(req.query);
    res.type('application/xml')
        .set('Content-Disposition', 'attachment; filename="reporte-financiero.xml"')
        .send(xmlService.reporteFinanciero(transacciones));
});

module.exports = router;
