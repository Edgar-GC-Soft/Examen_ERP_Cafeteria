const { consultar, transaccion } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');

function obtenerAsistencias() {
    return consultar(
        `SELECT a.id, u.nombre, a.hora_llegada, a.hora_salida,
                ROUND(TIMESTAMPDIFF(MINUTE, a.hora_llegada, a.hora_salida) / 60, 2) AS horas_trabajadas
         FROM asistencias a JOIN usuarios u ON u.id = a.administrador_id
         ORDER BY a.hora_llegada DESC LIMIT 30`
    );
}

async function registrarLlegada(administradorId) {
    const [abierta] = await consultar(
        'SELECT id FROM asistencias WHERE administrador_id = ? AND hora_salida IS NULL', [administradorId]
    );
    if (abierta) {
        throw new ErrorHttp(409, 'Ya registraste tu llegada, falta la salida');
    }
    await consultar('INSERT INTO asistencias (administrador_id, hora_llegada) VALUES (?, NOW())', [administradorId]);
}

async function registrarSalida(administradorId) {
    const r = await consultar(
        'UPDATE asistencias SET hora_salida = NOW() WHERE administrador_id = ? AND hora_salida IS NULL',
        [administradorId]
    );
    if (r.affectedRows === 0) {
        throw new ErrorHttp(409, 'Primero debes registrar tu llegada');
    }
}

// historial / reporte de nomina (fechas opcionales)
function obtenerNominas(desde, hasta) {
    return consultar(
        `SELECT n.id, u.nombre, n.fecha_pago, n.monto
         FROM nominas n JOIN usuarios u ON u.id = n.administrador_id
         WHERE DATE(n.fecha_pago) >= COALESCE(?, '1000-01-01') AND DATE(n.fecha_pago) <= COALESCE(?, '9999-12-31')
         ORDER BY n.fecha_pago DESC`,
        [desde || null, hasta || null]
    );
}

async function pagarNomina({ administradorId, monto }) {
    if (!(Number(monto) > 0)) {
        throw new ErrorHttp(400, 'El monto debe ser un numero positivo');
    }
    return transaccion(async (con) => {
        const [admin] = await consultar("SELECT nombre FROM usuarios WHERE id = ? AND rol = 'admin'", [administradorId], con);
        if (!admin) {
            throw new ErrorHttp(400, 'Administrador no encontrado');
        }
        const nomina = await consultar('INSERT INTO nominas (administrador_id, monto) VALUES (?, ?)', [administradorId, monto], con);
        // el pago de nomina genera un egreso
        await consultar(
            "INSERT INTO transacciones (tipo, concepto, monto, origen, nomina_id) VALUES ('Egreso', ?, ?, 'Nómina', ?)",
            [`Nómina de ${admin.nombre}`, monto, nomina.insertId], con
        );
        return nomina.insertId;
    });
}

module.exports = { obtenerAsistencias, registrarLlegada, registrarSalida, obtenerNominas, pagarNomina };
