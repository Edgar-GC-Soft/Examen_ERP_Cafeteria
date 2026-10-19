const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuario.service');

// todas estas rutas son solo para admin (se protege en server.js)
router.get('/', async (req, res) => {
    res.json(await usuarioService.obtenerUsuarios());
});

router.post('/', async (req, res) => {
    const id = await usuarioService.agregarUsuario(req.body);
    res.status(201).json({ mensaje: 'Usuario agregado', id });
});

router.put('/:id', async (req, res) => {
    await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.json({ mensaje: 'Usuario actualizado' });
});

router.delete('/:id', async (req, res) => {
    await usuarioService.eliminarUsuario(req.params.id, req.usuario.id);
    res.json({ mensaje: 'Usuario eliminado' });
});

module.exports = router;
