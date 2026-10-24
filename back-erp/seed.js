// Crea 2 usuarios de ejemplo con la contraseña cifrada. Uso: node seed.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { consultar } = require('./config/db');

const usuarios = [
    { nombre: 'admin', correo: 'administrador@cafeteria.com', contrasena: 'admin123', rol: 'admin', salario: 9500 },
    { nombre: 'Edgarcliente', correo: 'a23300758@ceti.mx', contrasena: 'test123', rol: 'cliente', salario: null },
    { nombre: 'Ruben', correo: 'cliente@cafeteria.com', contrasena: 'cliente123', rol: 'cliente', salario: null },
    { nombre: 'Edgaradmin', correo: 'egutierrezcorona@gmail.com', contrasena: 'admin123', rol: 'admin', salario: 9999 }
];

async function sembrar() {
    async function sembrar() {
    for (const u of usuarios) {
        const hash = await bcrypt.hash(u.contrasena, 10);
        const [existe] = await consultar('SELECT id FROM usuarios WHERE correo = ?', [u.correo]);
        if (existe) {
            // ya existe: se actualiza (conserva sus ventas)
            await consultar(
                'UPDATE usuarios SET nombre = ?, password_hash = ?, rol = ?, salario = ? WHERE id = ?',
                [u.nombre, hash, u.rol, u.salario, existe.id]
            );
        } else {
            await consultar(
                'INSERT INTO usuarios (nombre, correo, password_hash, rol, salario) VALUES (?, ?, ?, ?, ?)',
                [u.nombre, u.correo, hash, u.rol, u.salario]
            );
        }
        console.log(`Usuario listo: ${u.correo} (${u.rol})`);
    }
    process.exit(0);
}
}

sembrar().catch((error) => { console.error(error); process.exit(1); });
