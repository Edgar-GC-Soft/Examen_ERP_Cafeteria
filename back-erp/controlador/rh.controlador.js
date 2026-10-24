const rhService = require('../services/rh.service');

async function obtenerAsistencias(req, res) {
    res.json(await rhService.obtenerAsistencias());
}

async function registrarLlegada(req, res) {
    await rhService.registrarLlegada(req.usuario.id);
    res.status(201).json({ mensaje: 'Llegada registrada' });
}

async function registrarSalida(req, res) {
    await rhService.registrarSalida(req.usuario.id);
    res.json({ mensaje: 'Salida registrada' });
}

async function obtenerNominas(req, res) {
    res.json(await rhService.obtenerNominas(req.query.desde, req.query.hasta));
}

async function pagarNomina(req, res) {
    const id = await rhService.pagarNomina(req.body);
    res.status(201).json({ mensaje: 'Pago de nómina registrado', id });
}

module.exports = { obtenerAsistencias, registrarLlegada, registrarSalida, obtenerNominas, pagarNomina };
