import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra, LineaCompra } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private api = 'http://localhost:3000/api/compras';

  constructor(private http: HttpClient) {}

  obtenerCompras(desde?: string, hasta?: string): Observable<Compra[]> {
    const params: Record<string, string> = {};
    if (desde) { params['desde'] = desde; }
    if (hasta) { params['hasta'] = hasta; }
    return this.http.get<Compra[]>(this.api, { params });
  }

  registrarCompra(proveedorId: number, detalle: LineaCompra[]): Observable<unknown> {
    return this.http.post(this.api, { proveedorId, detalle });
  }
}
