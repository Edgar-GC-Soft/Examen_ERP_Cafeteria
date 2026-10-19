const bcrypt = require('bcrypt');
const { consultar } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');

const ROLES = ['admin', 'cliente']; // solo 2 roles

function validar(usuario, esNuevo) {
    if (!usuario.nombre || !usuario.nombre.trim()) {
        throw new ErrorHttp(400, 'El nombre es obligatorio');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.correo || '')) {
        throw new ErrorHttp(400, 'El correo no es valido');
    }
    if (!ROLES.includes(usuario.rol)) {
        throw new ErrorHttp(400, 'El rol debe ser admin o cliente');
    }
    if (usuario.salario !== null && usuario.salario !== undefined && usuario.salario !== '') {
        if (isNaN(usuario.salario) || Number(usuario.salario) < 0) {
            throw new ErrorHttp(400, 'El salario no puede ser negativo');
        }
    }
    if ((esNuevo || usuario.contrasena) && (usuario.contrasena || '').length < 6) {
        throw new ErrorHttp(400, 'La contraseña debe tener al menos 6 caracteres');
    }
}

// nunca se manda el hash al frontend
function obtenerUsuarios() {
    return consultar('SELECT id, nombre, correo, rol, salario FROM usuarios ORDER BY id');
}

async function agregarUsuario(usuario) {
    validar(usuario, true);
    const hash = await bcrypt.hash(usuario.contrasena, 10);
    const resultado = await consultar(
        'INSERT INTO usuarios (nombre, correo, password_hash, rol, salario) VALUES (?, ?, ?, ?, ?)',
        [usuario.nombre.trim(), usuario.correo, hash, usuario.rol, usuario.salario || null]
    );
    return resultado.insertId;
}

async function actualizarUsuario(id, usuario) {
    validar(usuario, false);
    const valores = [usuario.nombre.trim(), usuario.correo, usuario.rol, usuario.salario || null];
    let sql = 'UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, salario = ?';
    if (usuario.contrasena) { // solo se cambia la contraseña si se escribio una nueva
        sql += ', password_hash = ?';
        valores.push(await bcrypt.hash(usuario.contrasena, 10));
    }
    await consultar(sql + ' WHERE id = ?', [...valores, id]);
}

async function eliminarUsuario(id, solicitanteId) {
    if (Number(id) === solicitanteId) {
        throw new ErrorHttp(400, 'No puedes eliminar tu propio usuario');
    }
    await consultar('DELETE FROM usuarios WHERE id = ?', [id]);
}

module.exports = { obtenerUsuarios, agregarUsuario, actualizarUsuario, eliminarUsuario };
