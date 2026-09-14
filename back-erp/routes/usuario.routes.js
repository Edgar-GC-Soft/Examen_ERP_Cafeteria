const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuario.service');

// GET: ver todos los usuarios
router.get('/', (req, res) => {
    usuarioService.obtenerUsuarios((error, usuarios) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar usuarios' });
        }
        res.json(usuarios);
    });
});

// POST: agregar un usuario
router.post('/', (req, res) => {
    usuarioService.agregarUsuario(req.body, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al agregar usuario' });
        }
        res.json({ mensaje: 'Usuario agregado', id: resultado.insertId });
    });
});

// DELETE: eliminar un usuario por id
router.delete('/:id', (req, res) => {
    usuarioService.eliminarUsuario(req.params.id, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al eliminar usuario' });
        }
        res.json({ mensaje: 'Usuario eliminado' });
    });
});
// PUT: actualizar un usuario por id
router.put('/:id', (req, res) => {
    usuarioService.actualizarUsuario(req.params.id, req.body, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al actualizar usuario' });
        }
        res.json({ mensaje: 'Usuario actualizado' });
    });
});
module.exports = router;