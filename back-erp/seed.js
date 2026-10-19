// Crea 2 usuarios de ejemplo con la contraseña cifrada. Uso: node seed.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { consultar } = require('./config/db');

const usuarios = [
    { nombre: 'Edgar', correo: 'administrador@cafeteria.com', contrasena: 'admin123', rol: 'admin', salario: 9500 },
    { nombre: 'Edgar', correo: 'a23300758@ceti.mx', contrasena: 'test123', rol: 'cliente', salario: null },
    { nombre: 'Ruben', correo: 'cliente@cafeteria.com', contrasena: 'cliente123', rol: 'cliente', salario: null }
];

async function sembrar() {
    for (const u of usuarios) {
        const hash = await bcrypt.hash(u.contrasena, 10);
        await consultar('DELETE FROM usuarios WHERE correo = ?', [u.correo]); // para poder correrlo varias veces
        await consultar(
            'INSERT INTO usuarios (nombre, correo, password_hash, rol, salario) VALUES (?, ?, ?, ?, ?)',
            [u.nombre, u.correo, hash, u.rol, u.salario]
        );
        console.log(`Usuario listo: ${u.correo} (${u.rol})`);
    }
    process.exit(0);
}

sembrar().catch((error) => { console.error(error); process.exit(1); });
