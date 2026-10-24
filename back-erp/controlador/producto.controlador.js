const productoService = require('../services/producto.service');

async function obtenerProductos(req, res) {
    res.json(await productoService.obtenerProductos(req.usuario.rol));
}

async function agregarProducto(req, res) {
    const id = await productoService.agregarProducto(req.body);
    res.status(201).json({ mensaje: 'Producto agregado', id });
}

async function actualizarProducto(req, res) {
    await productoService.actualizarProducto(req.params.id, req.body);
    res.json({ mensaje: 'Producto actualizado' });
}

async function eliminarProducto(req, res) {
    await productoService.eliminarProducto(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
}

module.exports = { obtenerProductos, agregarProducto, actualizarProducto, eliminarProducto };
