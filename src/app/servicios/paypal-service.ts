import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatosFiscales, OrdenPayPal, ProductoCarrito, ResultadoPago } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private api = 'http://localhost:3000/api/paypal';

  constructor(private http: HttpClient) {}

  // envia los productos al backend (el backend calcula el total con los precios de la BD)
  crearOrden(productos: ProductoCarrito[], datos: DatosFiscales) {
    return this.http.post<OrdenPayPal>(`${this.api}/orden`, { productos, ...datos });
  }

  capturarOrden(orderId: string) {
    return this.http.post<ResultadoPago>(`${this.api}/capturar/${orderId}`, {});
  }
}
