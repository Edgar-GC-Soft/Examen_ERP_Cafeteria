// error con codigo HTTP: throw new ErrorHttp(400, 'mensaje')
class ErrorHttp extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

// Express 5 manda aqui cualquier error (tambien los de funciones async)
function manejarErrores(error, req, res, next) {
    if (error.status) {
        return res.status(error.status).json({ mensaje: error.message });
    }
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensaje: 'Ese dato ya esta registrado' });
    }
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ mensaje: 'No se puede eliminar: tiene registros asociados' });
    }
    console.error(error);
    res.status(500).json({ mensaje: 'Error del servidor' });
}

module.exports = { ErrorHttp, manejarErrores };
