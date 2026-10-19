const jwt = require('jsonwebtoken');
const { ErrorHttp } = require('./errores');

// middleware de autenticacion: revisa el token JWT
function verificarToken(req, res, next) {
    const encabezado = req.headers.authorization || '';
    const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null;
    if (!token) {
        throw new ErrorHttp(401, 'Sesion no iniciada');
    }
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET); // { id, rol }
        next();
    } catch {
        throw new ErrorHttp(401, 'Sesion invalida o vencida');
    }
}

// middleware de autorizacion: permitir('admin') o permitir('admin', 'cliente')
function permitir(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            throw new ErrorHttp(403, 'No tienes permiso para esta operacion');
        }
        next();
    };
}

module.exports = { verificarToken, permitir };
