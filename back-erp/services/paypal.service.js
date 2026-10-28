const BASE_URL = process.env.PAYPAL_BASE_URL;

// obtiene el token que autoriza las solicitudes a paypal
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
        body: 'grant_type=client_credentials',
        signal: AbortSignal.timeout(15000),
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
        throw new Error('Error de autenticacion PayPal');
    }
    return datos.access_token;
}

// envia una solicitud autenticada a la api de paypal
async function paypalRequest(ruta, metodo, body) {
    const token = await obtenerToken();

    const respuesta = await fetch(`${BASE_URL}${ruta}`, {
        method: metodo,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(15000),
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
        console.error('Error de PayPal:', datos);
        throw new Error('Operacion de PayPal rechazada');
    }
    return datos;
}

module.exports = { paypalRequest };
