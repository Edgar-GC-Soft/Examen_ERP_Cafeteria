require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verificarToken, permitir } = require('./middleware/auth');
const { manejarErrores } = require('./middleware/errores');

const app = express();
app.use(cors());
app.use(express.json());

// peticion -> middleware de autenticacion -> middleware de autorizacion -> ruta -> respuesta
const cualquiera = [verificarToken, permitir('admin', 'cliente')];
const soloAdmin = [verificarToken, permitir('admin')];

app.use('/api', require('./routes/auth.routes')); // /api/login (publica)

app.use('/api/productos', cualquiera, require('./routes/producto.routes'));
app.use('/api/ventas', cualquiera, require('./routes/venta.routes'));
app.use('/api/paypal', cualquiera, require('./routes/paypal.routes'));

app.use('/api/usuarios', soloAdmin, require('./routes/usuario.routes'));
app.use('/api/proveedores', soloAdmin, require('./routes/proveedor.routes'));
app.use('/api/compras', soloAdmin, require('./routes/compra.routes'));
app.use('/api/contabilidad', soloAdmin, require('./routes/contabilidad.routes'));
app.use('/api/rh', soloAdmin, require('./routes/rh.routes'));
app.use('/api/dashboard', soloAdmin, require('./routes/dashboard.routes'));

app.use(manejarErrores);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
