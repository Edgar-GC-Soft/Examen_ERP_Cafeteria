import { Component, OnInit, computed, signal } from '@angular/core';
import { Producto } from '../../modelos/modelos';
import { ProductoService } from '../../servicios/producto-service';
import { leerFormulario, mensajeError } from '../../util/util';

@Component({
  selector: 'app-inventario',
  imports: [],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {
  productos = signal<Producto[]>([]);
  editando = signal<Producto | null>(null);
  error = signal('');

  // reporte de productos con existencia baja
  productosBajos = computed(() => this.productos().filter((p) => this.stockBajo(p)));

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (datos) => this.productos.set(datos),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  guardar(evento: Event): void {
    const { formulario, datos } = leerFormulario(evento);
    const producto = {
      nombre: datos['nombre'],
      descripcion: datos['descripcion'],
      costoCompra: Number(datos['costoCompra']),
      costoVenta: Number(datos['costoVenta']),
      stock: Number(datos['stock']),
      imagen: datos['imagen']
    };
    const actual = this.editando();
    const peticion = actual
      ? this.productoService.actualizarProducto(actual.id, producto)
      : this.productoService.agregarProducto(producto);

    peticion.subscribe({
      next: () => { this.cargarProductos(); this.cancelar(formulario); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  editar(producto: Producto): void {
    this.editando.set(producto);
    this.error.set('');
  }

  eliminar(id: number): void {
    this.productoService.eliminarProducto(id).subscribe({
      next: () => this.cargarProductos(),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  cancelar(formulario: HTMLFormElement): void {
    formulario.reset();
    this.editando.set(null);
    this.error.set('');
  }

  stockBajo(producto: Producto): boolean {
    return producto.stock < 10; // aqui se define el umbral de stock bajo
  }
}
