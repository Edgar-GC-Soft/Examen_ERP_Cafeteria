const authService = require('../services/auth.service');

// POST /api/login
async function login(req, res) {
    // valida las credenciales y devuelve los datos de sesion
    const { correo, contrasena } = req.body || {};
    res.json(await authService.login(correo, contrasena));
}

module.exports = { login };
