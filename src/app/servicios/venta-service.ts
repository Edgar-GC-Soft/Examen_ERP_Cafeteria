import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatosFiscales, ProductoCarrito, Venta } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private api = 'http://localhost:3000/api/ventas';

  constructor(private http: HttpClient) {}

  // venta en efectivo (la de PayPal esta en paypal-service)
  registrarVentaEfectivo(productos: ProductoCarrito[], datos: DatosFiscales) {
    return this.http.post<{ mensaje: string; folio: string; total: number; correoEnviado: boolean }>(
      this.api, { productos, ...datos }
    );
  }

  obtenerVentas(desde?: string, hasta?: string): Observable<Venta[]> {
    const params: Record<string, string> = {};
    if (desde) { params['desde'] = desde; }
    if (hasta) { params['hasta'] = hasta; }
    return this.http.get<Venta[]>(this.api, { params });
  }

  // vuelve a enviar el comprobante XML por correo
  reenviarComprobante(id: number) {
    return this.http.post<{ correoEnviado: boolean }>(`${this.api}/${id}/reenviar`, {});
  }
}
