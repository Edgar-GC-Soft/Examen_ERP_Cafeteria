const { consultar, transaccion } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');

function validar(p) {
    if (!p.nombre || !p.nombre.trim()) {
        throw new ErrorHttp(400, 'El nombre es obligatorio');
    }
    if (!(Number(p.costoCompra) > 0) || !(Number(p.costoVenta) > 0)) {
        throw new ErrorHttp(400, 'Los costos deben ser numeros positivos');
    }
    if (!Number.isInteger(Number(p.stock)) || Number(p.stock) < 0) {
        throw new ErrorHttp(400, 'El stock debe ser un entero mayor o igual a 0');
    }
}

// solo productos vigentes; el cliente no ve el costo de compra
function obtenerProductos(rol) {
    const columnas = rol === 'admin'
        ? 'id, nombre, descripcion, costo_compra, costo_venta, stock, imagen'
        : 'id, nombre, descripcion, costo_venta, stock, imagen';
    return consultar(`SELECT ${columnas} FROM productos WHERE fecha_baja IS NULL ORDER BY id`);
}

async function agregarProducto(p) {
    validar(p);
    const resultado = await consultar(
        'INSERT INTO productos (nombre, descripcion, costo_compra, costo_venta, stock, imagen) VALUES (?, ?, ?, ?, ?, ?)',
        [p.nombre.trim(), p.descripcion, p.costoCompra, p.costoVenta, p.stock, p.imagen]
    );
    return resultado.insertId;
}

async function actualizarProducto(id, p) {
    validar(p);
    const [actual] = await consultar('SELECT * FROM productos WHERE id = ? AND fecha_baja IS NULL', [id]);
    if (!actual) {
        throw new ErrorHttp(404, 'Producto no encontrado');
    }
    const cambioPrecio = Number(p.costoCompra) !== actual.costoCompra || Number(p.costoVenta) !== actual.costoVenta;

    if (!cambioPrecio) {
        await consultar(
            'UPDATE productos SET nombre = ?, descripcion = ?, stock = ?, imagen = ? WHERE id = ?',
            [p.nombre.trim(), p.descripcion, p.stock, p.imagen, id]
        );
        return;
    }
    // cambio de precio: la version anterior se conserva con fecha_baja (historial)
    await transaccion(async (con) => {
        await consultar('UPDATE productos SET fecha_baja = NOW(), stock = 0 WHERE id = ?', [id], con);
        await consultar(
            'INSERT INTO productos (nombre, descripcion, costo_compra, costo_venta, stock, imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [p.nombre.trim(), p.descripcion, p.costoCompra, p.costoVenta, p.stock, p.imagen], con
        );
    });
}

// no se borra la fila: asi se conservan las ventas y compras anteriores
async function eliminarProducto(id) {
    await consultar('UPDATE productos SET fecha_baja = NOW() WHERE id = ? AND fecha_baja IS NULL', [id]);
}

module.exports = { obtenerProductos, agregarProducto, actualizarProducto, eliminarProducto };
