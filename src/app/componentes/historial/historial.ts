import { Component, OnInit, computed, signal } from '@angular/core';
import { Venta } from '../../modelos/modelos';
import { VentaService } from '../../servicios/venta-service';
import { AuthService } from '../../servicios/auth-service';
import { leerFormulario, mensajeError } from '../../util/util';

@Component({
  selector: 'app-historial',
  imports: [],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  ventas = signal<Venta[]>([]);
  mensaje = signal('');
  esAdmin: boolean;

  total = computed(() => this.ventas().reduce((suma, v) => suma + v.total, 0));

  constructor(private ventaService: VentaService, authService: AuthService) {
    this.esAdmin = authService.obtenerUsuario()?.rol === 'admin';
  }

  ngOnInit(): void {
    this.cargar();
  }

  // el cliente solo recibe sus ventas; el administrador, todas
  cargar(desde?: string, hasta?: string): void {
    this.ventaService.obtenerVentas(desde, hasta).subscribe({
      next: (datos) => this.ventas.set(datos),
      error: (e) => this.mensaje.set(mensajeError(e))
    });
  }

  filtrar(evento: Event): void {
    const { datos } = leerFormulario(evento);
    this.cargar(datos['desde'], datos['hasta']);
  }

  reenviar(id: number): void {
    this.ventaService.reenviarComprobante(id).subscribe({
      next: (r) => this.mensaje.set(r.correoEnviado ? 'Comprobante enviado por correo' : 'No se pudo enviar el correo'),
      error: (e) => this.mensaje.set(mensajeError(e))
    });
  }
}
