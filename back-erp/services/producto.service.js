const db = require('../config/db');

function obtenerProductos(callback) {
    const sql = 'SELECT * FROM productos';
    db.query(sql, (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados);
    });
}

function agregarProducto(producto, callback) {
    const sql = `INSERT INTO productos (nombre, descripcion, costo_compra, costo_venta, stock, imagen)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const valores = [
        producto.nombre,
        producto.descripcion,
        producto.costoCompra,
        producto.costoVenta,
        producto.stock,
        producto.imagen
    ];
    db.query(sql, valores, (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function eliminarProducto(id, callback) {
    const sql = 'DELETE FROM productos WHERE id = ?';
    db.query(sql, [id], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

function actualizarProducto(id, producto, callback) {
    const sql = `UPDATE productos SET nombre = ?, descripcion = ?, costo_compra = ?, costo_venta = ?, stock = ?, imagen = ? WHERE id = ?`;
    const valores = [
        producto.nombre,
        producto.descripcion,
        producto.costoCompra,
        producto.costoVenta,
        producto.stock,
        producto.imagen,
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
    obtenerProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
};