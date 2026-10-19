const nodemailer = require('nodemailer');

const transporte = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

// envia el recibo (con el XML adjunto) al cliente.
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
        await transporte.sendMail({
            from: `"ERP Cafetería" <${process.env.MAIL_USER}>`,
            to: cliente.correo,
            bcc: process.env.MAIL_COPIA || undefined, // copia para pruebas
            subject: `Recibo ${factura.folio}`,
            text: lineas.join('\n'),
            attachments: [{ filename: `${factura.folio}.xml`, content: factura.xml, contentType: 'application/xml' }]
        });
        return true;
    } catch (error) {
        console.error('No se pudo enviar el correo:', error.message);
        return false;
    }
}

module.exports = { enviarRecibo };
