import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoCard } from '../producto-card/producto-card'; // aqui se importa el componente producto-card
import { Producto } from '../../modelos/modelos';
import { ProductoService } from '../../servicios/producto-service'; // aqui se importa el servicio
import { CarritoService } from '../../servicios/carrito-service';

@Component({
  selector: 'app-ventas',
  imports: [ProductoCard], // aqui se conecta con ventas.html
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {
  productos = signal<Producto[]>([]); // se llenan desde el backend

  constructor(
    private productoService: ProductoService, // aqui se inyecta el servicio
    public carrito: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (datos) => this.productos.set(datos), // aqui se guardan los productos que llegan del backend
      error: (error) => console.error('Error al obtener productos', error)
    });
  }

  irAPagar(): void {
    this.router.navigate(['/checkout']);
  }
}
