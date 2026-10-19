const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

// POST /api/login (publica)
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body || {};
    res.json(await authService.login(correo, contrasena));
});

module.exports = router;
