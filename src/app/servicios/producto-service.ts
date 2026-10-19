import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private api = 'http://localhost:3000/api/productos'; // aqui se apunta al backend

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.api);
  }

  agregarProducto(producto: Partial<Producto>): Observable<unknown> {
    return this.http.post(this.api, producto);
  }

  actualizarProducto(id: number, producto: Partial<Producto>): Observable<unknown> {
    return this.http.put(`${this.api}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<unknown> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
