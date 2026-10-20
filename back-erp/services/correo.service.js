// envia el recibo (con el XML adjunto) usando la API de Resend (https://resend.com)
// si es de PayPal, se llama justo cuando el pago ya fue autorizado y capturado.
// devuelve true/false: si el correo falla, la venta no se cancela
async function enviarRecibo({ cliente, venta, factura, captureId }) {
    const lineas = [
        `Hola ${cliente.nombre}, gracias por tu compra en ERP Cafetería.`,
        '',
        `Folio: ${factura.folio}`,
        `Método de pago: ${venta.metodoPago === 'paypal' ? 'PayPal' : 'Efectivo'}`,
        `Total: $${venta.total.toFixed(2)} MXN`
    ];
    if (venta.metodoPago === 'paypal') {
        lineas.push('', 'Pago autorizado en PayPal', `Orden: ${venta.paypalOrderId}`, `Captura: ${captureId}`);
    }
    lineas.push('', 'Adjuntamos tu comprobante en formato XML.');

    try {
        const respuesta = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.MAIL_FROM,
                // sin dominio verificado, Resend solo deja enviar a tu propio correo: usa MAIL_DESTINO
                to: [process.env.MAIL_DESTINO || cliente.correo],
                subject: `Recibo ${factura.folio}`,
                text: lineas.join('\n'),
                attachments: [{ filename: `${factura.folio}.xml`, content: Buffer.from(factura.xml).toString('base64') }]
            })
        });
        if (!respuesta.ok) {
            throw new Error(await respuesta.text());
        }
        return true;
    } catch (error) {
        console.error('No se pudo enviar el correo:', error.message);
        return false;
    }
}

module.exports = { enviarRecibo };
