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

module.exports = router;