import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  costoCompra: number;
  costoVenta: number;
  stock: number;
  imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private api = 'http://localhost:3000/api/productos'; // aqui se apunta al backend

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Record<string, unknown>[]>(this.api).pipe(
      map(productos => productos.map(producto => ({
        id: producto['id'] as number,
        nombre: producto['nombre'] as string,
        descripcion: producto['descripcion'] as string,
        costoCompra: (producto['costo_compra'] ?? producto['costoCompra']) as number,
        costoVenta: (producto['costo_venta'] ?? producto['costoVenta']) as number,
        stock: producto['stock'] as number,
        imagen: producto['imagen'] as string
      })))
    );
  }

  agregarProducto(producto: any): Observable<any> {
    return this.http.post(this.api, producto); // aqui se hace la peticion POST
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`); // aqui se hace la peticion DELETE
  }
}