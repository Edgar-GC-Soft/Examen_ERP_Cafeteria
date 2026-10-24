const express = require('express');
const router = express.Router();
const controlador = require('../controlador/usuario.controlador');

// todas estas rutas son solo para admin (se protege en server.js)
router.get('/', controlador.obtenerUsuarios);
router.post('/', controlador.agregarUsuario);
router.put('/:id', controlador.actualizarUsuario);
router.delete('/:id', controlador.eliminarUsuario);

module.exports = router;
