
import { Component, OnInit, signal } from '@angular/core';
import { ProductoCard } from '../producto-card/producto-card'; // aqui se importa el componente producto-card
import { Producto, ProductoService } from '../../servicios/producto-service'; // aqui se importa el servicio

@Component({
  selector: 'app-ventas',
  imports: [ProductoCard], // aqui se conecta con ventas.html
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {
  productos = signal<Producto[]>([]); // aqui ya no hay datos fijos, se llenan desde el backend

  detalle = [
    { producto: 'Café americano', cantidad: 2, subtotal: 90 },
    { producto: 'Pan de elote', cantidad: 1, subtotal: 38 },
  ];

  constructor(private productoService: ProductoService) {} // aqui se inyecta el servicio

  ngOnInit(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (datos) => {
        this.productos.set(datos); // aqui se guardan los productos que llegan del backend
      },
      error: (error) => {
        console.error('Error al obtener productos', error);
      }
    });
  }
}