const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'erp'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error de conexion:', error);
        return;
    }
    console.log('Conectado a MySQL');
});

module.exports = conexion;