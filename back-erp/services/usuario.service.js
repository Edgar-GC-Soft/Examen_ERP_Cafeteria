const db = require('../config/db');

function obtenerUsuarios(callback) {
    const sql = 'SELECT * FROM usuarios';
    db.query(sql, (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados);
    });
}

function agregarUsuario(usuario, callback) {
    const sql = `INSERT INTO usuarios (nombre, correo, password_hash, rol, salario)
                 VALUES (?, ?, ?, ?, ?)`;
    const valores = [
        usuario.nombre,
        usuario.correo,
        usuario.passwordHash,
        usuario.rol,
        usuario.salario
    ];
    db.query(sql, valores, (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function eliminarUsuario(id, callback) {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    db.query(sql, [id], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function actualizarUsuario(id, usuario, callback) {
    const sql = `UPDATE usuarios SET nombre = ?, correo = ?, password_hash = ?, rol = ?, salario = ? WHERE id = ?`;
    const valores = [
        usuario.nombre,
        usuario.correo,
        usuario.passwordHash,
        usuario.rol,
        usuario.salario,
        id
    ];
    db.query(sql, valores, (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

module.exports = {
    obtenerUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario
};