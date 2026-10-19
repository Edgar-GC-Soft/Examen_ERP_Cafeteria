const { consultar } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');

function validar(p) {
    if (!p.nombre || !p.nombre.trim()) {
        throw new ErrorHttp(400, 'El nombre del proveedor es obligatorio');
    }
    if (p.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.correo)) {
        throw new ErrorHttp(400, 'El correo no es valido');
    }
}

function obtenerProveedores() {
    return consultar('SELECT * FROM proveedores ORDER BY nombre');
}

async function agregarProveedor(p) {
    validar(p);
    const r = await consultar(
        'INSERT INTO proveedores (nombre, contacto, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?)',
        [p.nombre.trim(), p.contacto, p.telefono, p.correo, p.direccion]
    );
    return r.insertId;
}

async function actualizarProveedor(id, p) {
    validar(p);
    await consultar(
        'UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, correo = ?, direccion = ? WHERE id = ?',
        [p.nombre.trim(), p.contacto, p.telefono, p.correo, p.direccion, id]
    );
}

module.exports = { obtenerProveedores, agregarProveedor, actualizarProveedor };
