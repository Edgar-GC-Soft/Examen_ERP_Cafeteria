const BASE_URL = process.env.PAYPAL_BASE_URL;

// obtener el token de acceso
async function obtenerToken() {
    const clientID = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    const credenciales = Buffer.from(`${clientID}:${secret}`).toString('base64');

    const respuesta = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credenciales}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
        throw new Error('Error de autenticacion PayPal');
    }
    return datos.access_token;
}

// enviar peticiones a PayPal
async function paypalRequest(ruta, metodo, body) {
    const token = await obtenerToken();

    const respuesta = await fetch(`${BASE_URL}${ruta}`, {
        method: metodo,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
        console.error('Error de PayPal:', datos);
        throw new Error('Operacion de PayPal rechazada');
    }
    return datos;
}

module.exports = { paypalRequest };
