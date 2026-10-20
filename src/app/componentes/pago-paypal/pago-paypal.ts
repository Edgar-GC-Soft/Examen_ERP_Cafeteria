import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaypalService } from '../../servicios/paypal-service';
import { CarritoService } from '../../servicios/carrito-service';
import { mensajeError } from '../../util/util';

// PayPal regresa aqui despues de que el cliente aprueba el pago: /pago-paypal?token=ID_DE_ORDEN
@Component({
  selector: 'app-pago-paypal',
  imports: [RouterLink],
  templateUrl: './pago-paypal.html',
  styleUrl: './pago-paypal.css'
})
export class PagoPaypal implements OnInit {
  private route = inject(ActivatedRoute);
  private paypalService = inject(PaypalService);
  private carrito = inject(CarritoService);

  procesando = signal(true);
  exito = signal(false);
  mensaje = signal('');

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('token');
    if (!orderId) {
      this.procesando.set(false);
      this.mensaje.set('No se recibió la orden de PayPal');
      return;
    }
    // el backend captura el pago, verifica estado e importe y envia el correo con el recibo y el XML
    this.paypalService.capturarOrden(orderId).subscribe({
      next: (r) => {
        this.mensaje.set(`${r.mensaje}. Folio ${r.folio}. ` +
          (r.correoEnviado ? 'Te enviamos el recibo y el XML por correo.' : 'No se pudo enviar el correo, reenvíalo desde tu historial.'));
        this.carrito.vaciar();
        this.exito.set(true);
        this.procesando.set(false);
      },
      error: (e) => {
        this.mensaje.set(mensajeError(e, 'Pago pendiente de verificación'));
        this.procesando.set(false);
      }
    });
  }
}
