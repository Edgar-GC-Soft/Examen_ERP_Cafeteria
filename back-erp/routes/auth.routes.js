const express = require('express');
const router = express.Router();
const controlador = require('../controlador/auth.controlador');

// POST /api/login (publica)
router.post('/login', controlador.login);

module.exports = router;
