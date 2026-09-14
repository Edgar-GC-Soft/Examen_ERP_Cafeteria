import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Producto, ProductoService } from '../../servicios/producto-service';

@Component({
  selector: 'app-inventario',
  imports: [FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {
  productos = signal<Producto[]>([]);

  form = {
    id: 0,
    nombre: '',
    descripcion: '',
    costoCompra: 0,
    costoVenta: 0,
    stock: 0,
    imagen: ''
  };

  editando = signal(false);

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (datos) => this.productos.set(datos),
      error: (error) => console.error('Error al obtener productos', error)
    });
  }

  guardar(): void {
    if (this.editando()) {
      this.productoService.actualizarProducto(this.form.id, this.form).subscribe({
        next: () => { this.cargarProductos(); this.limpiarFormulario(); },
        error: (error) => console.error('Error al actualizar producto', error)
      });
    } else {
      this.productoService.agregarProducto(this.form).subscribe({
        next: () => { this.cargarProductos(); this.limpiarFormulario(); },
        error: (error) => console.error('Error al agregar producto', error)
      });
    }
  }

  editar(producto: Producto): void {
    this.form = { ...producto };
    this.editando.set(true);
  }

  eliminar(id: number): void {
    this.productoService.eliminarProducto(id).subscribe({
      next: () => this.cargarProductos(),
      error: (error) => console.error('Error al eliminar producto', error)
    });
  }

  limpiarFormulario(): void {
    this.form = { id: 0, nombre: '', descripcion: '', costoCompra: 0, costoVenta: 0, stock: 0, imagen: '' };
    this.editando.set(false);
  }

  stockBajo(producto: Producto): boolean {
    return producto.stock < 10; // aqui se define el umbral de stock bajo
  }
}