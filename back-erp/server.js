const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const productoRoutes = require('./routes/producto.routes');
const usuarioRoutes = require('./routes/usuario.routes');

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.listen(3000, () => {
    console.log('Servidor ejecutandose en http://localhost:3000');
});