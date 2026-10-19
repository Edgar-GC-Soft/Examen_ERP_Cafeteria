import {
  Component, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, inject,
  NgZone, signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaypalService } from '../../servicios/paypal-service';
import { VentaService } from '../../servicios/venta-service';
import { CarritoService } from '../../servicios/carrito-service';
import { DatosFiscales } from '../../modelos/modelos';
import { mensajeError } from '../../util/util';

declare const paypal: any;

const RFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // permite usar la etiqueta <paypal-button> del SDK
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements AfterViewInit {
  private paypalService = inject(PaypalService);
  private ventaService = inject(VentaService);
  private zone = inject(NgZone);
  carrito = inject(CarritoService);

  metodo = signal<'efectivo' | 'paypal'>('efectivo');
  mensaje = signal('Preparando PayPal...');
  error = signal('');
  pagado = signal(false);

  nombre = signal('');
  rfc = signal('');

  // valida los datos fiscales antes de pagar (devuelve el error o null)
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
    return null;
  }

  private datosFiscales(): DatosFiscales {
    return { nombreReceptor: this.nombre().trim(), rfcReceptor: this.rfc().trim().toUpperCase() };
  }

  // pago en efectivo
  confirmarEfectivo(): void {
    const problema = this.validarDatos();
    if (problema) {
      this.error.set(problema);
      return;
    }
    this.error.set('');
    this.ventaService.registrarVentaEfectivo(this.carrito.productos(), this.datosFiscales()).subscribe({
      next: (r) => {
        this.mensaje.set(`Venta registrada con folio ${r.folio}. ` +
          (r.correoEnviado ? 'Te enviamos el comprobante XML por correo.' : 'No se pudo enviar el correo, reenvíalo desde tu historial.'));
        this.carrito.vaciar();
        this.pagado.set(true);
      },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  // pago con PayPal
  async ngAfterViewInit() {
    try {
      const sdk = await paypal.createInstance({
        clientId: 'TU_CLIENT_ID_SANDBOX',
        components: ['paypal-payments'],
        pageType: 'checkout'
      });

      const metodos = await sdk.findEligibleMethods({
        currencyCode: 'MXN'
      });

      if (!metodos.isEligible('paypal')) {
        this.mensaje.set('PayPal no está disponible');
        return;
      }

      const sesion = sdk.createPayPalOneTimePaymentSession({
        onApprove: async (data: { orderId: string }) => {
          try {
            const resultado = await firstValueFrom(
              this.paypalService.capturarOrden(data.orderId)
            );
            this.zone.run(() => {
              // el backend ya envio el correo con el recibo y el XML
              this.mensaje.set(`${resultado.mensaje}. Folio ${resultado.folio}. ` +
                (resultado.correoEnviado ? 'Te enviamos el recibo y el XML por correo.' : 'No se pudo enviar el correo, reenvíalo desde tu historial.'));
              this.carrito.vaciar();
              this.pagado.set(true);
            });
          } catch {
            this.zone.run(() => {
              this.mensaje.set('Pago pendiente de verificación');
            });
          }
        },
        onCancel: () => {
          this.zone.run(() => {
            this.mensaje.set('Pago cancelado');
          });
        },
        onError: () => {
          this.zone.run(() => {
            this.mensaje.set('Error al procesar el pago');
          });
        }
      });

      const boton = document.querySelector('paypal-button');
      boton?.removeAttribute('hidden');

      boton?.addEventListener('click', async () => {
        // los datos del comprobante se validan antes de abrir PayPal
        const problema = this.validarDatos();
        if (problema) {
          this.zone.run(() => this.error.set(problema));
          return;
        }
        this.zone.run(() => this.error.set(''));
        try {
          await sesion.start(
            { presentationMode: 'auto' },
            firstValueFrom(
              this.paypalService.crearOrden(this.carrito.productos(), this.datosFiscales())
            ).then(orden => ({ orderId: orden.id }))
          );
        } catch {
          this.zone.run(() => {
            this.mensaje.set('No se pudo iniciar el pago');
          });
        }
      });

      this.mensaje.set('Selecciona PayPal para pagar');
    } catch {
      this.mensaje.set('No se pudo cargar PayPal');
    }
  }
}
