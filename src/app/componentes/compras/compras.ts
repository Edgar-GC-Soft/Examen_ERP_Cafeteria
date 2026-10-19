import { Component, OnInit, computed, signal } from '@angular/core';
import { Compra, LineaCompra, Producto, Proveedor } from '../../modelos/modelos';
import { CompraService } from '../../servicios/compra-service';
import { ProductoService } from '../../servicios/producto-service';
import { ProveedorService } from '../../servicios/proveedor-service';
import { leerFormulario, mensajeError } from '../../util/util';

@Component({
  selector: 'app-compras',
  imports: [],
  templateUrl: './compras.html',
  styleUrl: './compras.css'
})
export class Compras implements OnInit {
  proveedores = signal<Proveedor[]>([]);
  productos = signal<Producto[]>([]);
  detalle = signal<LineaCompra[]>([]); // productos de la compra que se esta armando
  compras = signal<Compra[]>([]); // reporte de compras
  error = signal('');
  mensaje = signal('');

  // el total sale de cantidades x costos del detalle
  total = computed(() =>
    this.detalle().reduce((suma, l) => suma + Math.round(l.cantidad * l.costoUnitario * 100), 0) / 100
  );
  totalReporte = computed(() => this.compras().reduce((suma, c) => suma + c.total, 0));

  constructor(
    private compraService: CompraService,
    private productoService: ProductoService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit(): void {
    this.proveedorService.obtenerProveedores().subscribe((datos) => this.proveedores.set(datos));
    this.productoService.obtenerProductos().subscribe((datos) => this.productos.set(datos));
    this.cargarCompras();
  }

  cargarCompras(desde?: string, hasta?: string): void {
    this.compraService.obtenerCompras(desde, hasta).subscribe((datos) => this.compras.set(datos));
  }

  agregarLinea(evento: Event): void {
    const { formulario, datos } = leerFormulario(evento);
    const producto = this.productos().find((p) => p.id === Number(datos['productoId']));
    if (!producto) {
      return;
    }
    this.detalle.update((lista) => [...lista, {
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: Number(datos['cantidad']),
      costoUnitario: Number(datos['costoUnitario'])
    }]);
    formulario.reset();
  }

  quitarLinea(indice: number): void {
    this.detalle.update((lista) => lista.filter((_, i) => i !== indice));
  }

  registrar(proveedorId: string): void {
    this.error.set('');
    this.mensaje.set('');
    if (!proveedorId) {
      this.error.set('Selecciona un proveedor');
      return;
    }
    if (this.detalle().length === 0) {
      this.error.set('Agrega al menos un producto a la compra');
      return;
    }
    this.compraService.registrarCompra(Number(proveedorId), this.detalle()).subscribe({
      next: () => {
        this.mensaje.set('Compra registrada, el stock se actualizó');
        this.detalle.set([]);
        this.cargarCompras();
      },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  filtrar(evento: Event): void {
    const { datos } = leerFormulario(evento);
    this.cargarCompras(datos['desde'], datos['hasta']);
  }
}
