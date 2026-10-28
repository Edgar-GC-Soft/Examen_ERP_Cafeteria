import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaypalService } from '../../servicios/paypal-service';
import { VentaService } from '../../servicios/venta-service';
import { CarritoService } from '../../servicios/carrito-service';
import { DatosFiscales } from '../../modelos/modelos';
import { mensajeError } from '../../util/util';

const RFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;

@Component({
  selector: 'app-checkout',
  imports: [RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  private paypalService = inject(PaypalService);
  private ventaService = inject(VentaService);
  carrito = inject(CarritoService);

  metodo = signal<'efectivo' | 'paypal'>('efectivo');
  mensaje = signal('');
  error = signal('');
  pagado = signal(false);
  cargando = signal(false);

  nombre = signal('');
  rfc = signal('');
  acepto = signal(false); // casilla de terminos y condiciones / aviso de privacidad

  // valida el carrito, los datos fiscales y la casilla (devuelve el error o null)
  private validarDatos(): string | null {
    if (this.carrito.items().length === 0) {
      return 'El carrito está vacío';
    }
    if (this.nombre().trim().length < 3) {
      return 'Escribe el nombre para el comprobante';
    }
    if (!RFC.test(this.rfc().trim().toUpperCase())) {
      return 'El RFC no tiene un formato válido';
    }
    if (!this.acepto()) {
      return 'Debes aceptar los términos y condiciones y el aviso de privacidad';
    }
    return null;
  }

  private datosFiscales(): DatosFiscales {
    return { nombreReceptor: this.nombre().trim(), rfcReceptor: this.rfc().trim().toUpperCase() };
  }

  // pago en efectivo
  confirmarEfectivo(): void {
    // valida los datos antes de registrar la venta
    const problema = this.validarDatos();
    if (problema) {
      this.error.set(problema);
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    // registra la venta y muestra el resultado
    this.ventaService.registrarVentaEfectivo(this.carrito.productos(), this.datosFiscales()).subscribe({
      next: (r) => {
        this.mensaje.set(`Venta registrada con folio ${r.folio}. ` +
          (r.correoEnviado ? 'Te enviamos el comprobante XML por correo.' : 'No se pudo enviar el correo, reenvíalo desde tu historial.'));
        // vacía el carrito cuando la venta se registra correctamente
        this.carrito.vaciar();
        this.pagado.set(true);
        this.cargando.set(false);
      },
      error: (e) => { this.error.set(mensajeError(e)); this.cargando.set(false); }
    });
  }

  // crea la orden en el servidor y redirige a paypal para pagar
  async pagarConPaypal() {
    const problema = this.validarDatos();
    if (problema) {
      this.error.set(problema);
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    try {
      // obtiene la url de pago de la orden creada
      const orden = await firstValueFrom(
        this.paypalService.crearOrden(this.carrito.productos(), this.datosFiscales())
      );
      // paypal regresa a la app cuando se aprueba el pago
      window.location.href = orden.urlPago;
    } catch (e) {
      this.error.set(mensajeError(e, 'No se pudo iniciar el pago'));
      this.cargando.set(false);
    }
  }
}
