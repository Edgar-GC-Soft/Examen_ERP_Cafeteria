import { Component, OnInit, computed, signal } from '@angular/core';
import { FiltrosContabilidad, Transaccion } from '../../modelos/modelos';
import { ContabilidadService } from '../../servicios/contabilidad-service';
import { leerFormulario, mensajeError } from '../../util/util';

@Component({
  selector: 'app-contabilidad',
  imports: [],
  templateUrl: './contabilidad.html',
  styleUrl: './contabilidad.css'
})
export class Contabilidad implements OnInit {
  transacciones = signal<Transaccion[]>([]);
  filtros = signal<FiltrosContabilidad>({});
  error = signal('');

  // totales y reporte financiero (ventas, compras y nomina)
  ingresos = computed(() => this.sumar('Ingreso'));
  egresos = computed(() => this.sumar('Egreso'));
  balance = computed(() => this.ingresos() - this.egresos());
  porOrigen = computed(() =>
    ['Venta', 'Compra', 'Nómina'].map((origen) => ({
      origen,
      total: this.transacciones().filter((t) => t.origen === origen).reduce((suma, t) => suma + t.monto, 0)
    }))
  );

  // grafica de barras: el ancho depende del monto mas grande
  maximo = computed(() => Math.max(this.ingresos(), this.egresos(), 1));

  constructor(private contabilidadService: ContabilidadService) {}

  ngOnInit(): void {
    this.cargar();
  }

  private sumar(tipo: string): number {
    return this.transacciones().filter((t) => t.tipo === tipo).reduce((suma, t) => suma + t.monto, 0);
  }

  cargar(): void {
    this.contabilidadService.obtenerTransacciones(this.filtros()).subscribe({
      next: (datos) => this.transacciones.set(datos),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  // filtros por fecha, tipo u origen + busqueda de una transaccion
  filtrar(evento: Event): void {
    const { datos } = leerFormulario(evento);
    this.filtros.set(datos);
    this.cargar();
  }

  limpiar(formulario: HTMLFormElement): void {
    formulario.reset();
    this.filtros.set({});
    this.cargar();
  }

  // descarga el XML con los datos (respeta los filtros activos)
  descargarXml(): void {
    this.contabilidadService.descargarXml(this.filtros()).subscribe({
      next: (archivo) => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'reporte-financiero.xml';
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  // reporte en PDF: se abre el dialogo de impresion y se elige "Guardar como PDF"
  exportarPdf(): void {
    window.print();
  }
}
