const authService = require('../services/auth.service');

// POST /api/login
async function login(req, res) {
    const { correo, contrasena } = req.body || {};
    res.json(await authService.login(correo, contrasena));
}

module.exports = { login };
