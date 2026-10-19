const express = require('express');
const router = express.Router();
const rhService = require('../services/rh.service');

router.get('/asistencias', async (req, res) => {
    res.json(await rhService.obtenerAsistencias());
});

router.post('/llegada', async (req, res) => {
    await rhService.registrarLlegada(req.usuario.id);
    res.status(201).json({ mensaje: 'Llegada registrada' });
});

router.post('/salida', async (req, res) => {
    await rhService.registrarSalida(req.usuario.id);
    res.json({ mensaje: 'Salida registrada' });
});

router.get('/nominas', async (req, res) => {
    res.json(await rhService.obtenerNominas(req.query.desde, req.query.hasta));
});

router.post('/nominas', async (req, res) => {
    const id = await rhService.pagarNomina(req.body);
    res.status(201).json({ mensaje: 'Pago de nómina registrado', id });
});

module.exports = router;
