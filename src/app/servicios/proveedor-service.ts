import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private api = 'http://localhost:3000/api/proveedores';

  constructor(private http: HttpClient) {}

  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.api);
  }

  agregarProveedor(proveedor: Partial<Proveedor>): Observable<unknown> {
    return this.http.post(this.api, proveedor);
  }

  actualizarProveedor(id: number, proveedor: Partial<Proveedor>): Observable<unknown> {
    return this.http.put(`${this.api}/${id}`, proveedor);
  }
}
