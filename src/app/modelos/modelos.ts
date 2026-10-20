// Los modelos se crean a mano (no llevan comando)

// ---- autenticacion ----
export interface Credenciales { // datos enviados al backend
  correo: string;
  contrasena: string;
}

export interface RespuestaLogin { // respuesta del backend
  token: string;
  nombre: string;
  correo: string;
  rol: string;
}

export interface UsuarioSesion { // datos que se guardan en el navegador
  nombre: string;
  correo: string;
  rol: string;
}

// ---- catalogos ----
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  salario: number | null;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  costoCompra?: number; // el cliente no recibe el costo de compra
  costoVenta: number;
  stock: number;
  imagen: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
}

// ---- ventas, carrito y PayPal ----
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface ProductoCarrito {
  id: number;
  cantidad: number;
}

export interface DatosFiscales {
  nombreReceptor: string;
  rfcReceptor: string;
}

export interface OrdenPayPal {
  id: string;
  total: number;
  urlPago: string; // pagina de PayPal a la que se redirige al cliente
}

export interface ResultadoPago {
  mensaje: string;
  orderId: string;
  captureId: string;
  estado: string;
  folio: string;
  correoEnviado: boolean;
}

export interface Venta {
  id: number;
  fecha: string;
  cliente: string;
  metodoPago: string;
  subtotal: number;
  iva: number;
  total: number;
  folio: string;
}

// ---- compras ----
export interface LineaCompra {
  productoId: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
}

export interface Compra {
  id: number;
  fecha: string;
  proveedor: string;
  total: number;
}

// ---- contabilidad, RH y dashboard ----
export interface Transaccion {
  id: number;
  fecha: string;
  tipo: string;
  concepto: string;
  origen: string;
  monto: number;
}

export interface FiltrosContabilidad {
  desde?: string;
  hasta?: string;
  tipo?: string;
  origen?: string;
  buscar?: string;
}

export interface Asistencia {
  id: number;
  nombre: string;
  horaLlegada: string;
  horaSalida: string | null;
  horasTrabajadas: number | null;
}

export interface Nomina {
  id: number;
  nombre: string;
  fechaPago: string;
  monto: number;
}

export interface ResumenDashboard {
  ventasHoy: number;
  numVentasHoy: number;
  comprasMes: number;
  numComprasMes: number;
  stockBajo: number;
  ultimoPagoNomina: string | null;
  administradores: number;
}
