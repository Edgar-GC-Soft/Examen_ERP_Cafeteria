const usuarioService = require('../services/usuario.service');

async function obtenerUsuarios(req, res) {
    res.json(await usuarioService.obtenerUsuarios());
}

async function agregarUsuario(req, res) {
    const id = await usuarioService.agregarUsuario(req.body);
    res.status(201).json({ mensaje: 'Usuario agregado', id });
}

async function actualizarUsuario(req, res) {
    await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.json({ mensaje: 'Usuario actualizado' });
}

async function eliminarUsuario(req, res) {
    await usuarioService.eliminarUsuario(req.params.id, req.usuario.id);
    res.json({ mensaje: 'Usuario eliminado' });
}

module.exports = { obtenerUsuarios, agregarUsuario, actualizarUsuario, eliminarUsuario };
