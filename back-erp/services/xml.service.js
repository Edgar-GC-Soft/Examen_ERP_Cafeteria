// escapa los caracteres especiales para que el XML sea valido
const esc = (texto) => String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// comprobante escolar de una venta (no es un CFDI real)
function comprobante(venta, detalle, factura) {
    const conceptos = detalle.map((d) =>
        `    <Concepto producto="${esc(d.nombre)}" cantidad="${d.cantidad}" precioUnitario="${d.precioUnitario.toFixed(2)}" importe="${(d.cantidad * d.precioUnitario).toFixed(2)}"/>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Comprobante folio="${esc(factura.folio)}" fecha="${esc(venta.fecha)}" moneda="MXN" metodoPago="${esc(venta.metodoPago)}" subtotal="${venta.subtotal.toFixed(2)}" iva="${venta.iva.toFixed(2)}" total="${venta.total.toFixed(2)}">
  <Emisor nombre="ERP Cafetería"/>
  <Receptor nombre="${esc(factura.nombreReceptor)}" rfc="${esc(factura.rfcReceptor)}"/>
  <Conceptos>
${conceptos}
  </Conceptos>
  <Aviso>Comprobante escolar sin validez fiscal</Aviso>
</Comprobante>
`;
}

// exportacion de la contabilidad: todas las transacciones recibidas + el resumen
function reporteFinanciero(transacciones) {
    const suma = (tipo) => transacciones.filter((t) => t.tipo === tipo).reduce((total, t) => total + t.monto, 0);
    const ingresos = suma('Ingreso');
    const egresos = suma('Egreso');
    const filas = transacciones.map((t) =>
        `    <Transaccion id="${t.id}" fecha="${esc(t.fecha)}" tipo="${esc(t.tipo)}" origen="${esc(t.origen)}" concepto="${esc(t.concepto)}" monto="${t.monto.toFixed(2)}"/>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<ReporteFinanciero generado="${new Date().toISOString()}">
  <Resumen ingresos="${ingresos.toFixed(2)}" egresos="${egresos.toFixed(2)}" balance="${(ingresos - egresos).toFixed(2)}"/>
  <Transacciones>
${filas}
  </Transacciones>
</ReporteFinanciero>
`;
}

module.exports = { comprobante, reporteFinanciero };
