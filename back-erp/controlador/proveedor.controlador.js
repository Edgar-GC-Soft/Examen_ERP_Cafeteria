const proveedorService = require('../services/proveedor.service');

async function obtenerProveedores(req, res) {
    res.json(await proveedorService.obtenerProveedores());
}

async function agregarProveedor(req, res) {
    const id = await proveedorService.agregarProveedor(req.body);
    res.status(201).json({ mensaje: 'Proveedor agregado', id });
}

async function actualizarProveedor(req, res) {
    await proveedorService.actualizarProveedor(req.params.id, req.body);
    res.json({ mensaje: 'Proveedor actualizado' });
}

module.exports = { obtenerProveedores, agregarProveedor, actualizarProveedor };
