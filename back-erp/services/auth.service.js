const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { consultar } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');

// valida al usuario y crea el token de sesion
async function login(correo, contrasena) {
    if (!correo || !contrasena) {
        throw new ErrorHttp(400, 'Correo y contraseña son obligatorios');
    }
    const [usuario] = await consultar('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    // el mismo mensaje para correo o contraseña incorrectos
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.passwordHash))) {
        throw new ErrorHttp(401, 'Credenciales incorrectas');
    }
    // crear el token de sesion
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
}

module.exports = { login };
