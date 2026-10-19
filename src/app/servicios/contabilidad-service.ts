import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltrosContabilidad, Transaccion } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class ContabilidadService {
  private api = 'http://localhost:3000/api/contabilidad';

  constructor(private http: HttpClient) {}

  // quita los filtros vacios
  private limpiar(filtros: FiltrosContabilidad): Record<string, string> {
    return Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor)) as Record<string, string>;
  }

  obtenerTransacciones(filtros: FiltrosContabilidad): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(this.api, { params: this.limpiar(filtros) });
  }

  // el XML llega como archivo (Blob)
  descargarXml(filtros: FiltrosContabilidad): Observable<Blob> {
    return this.http.get(`${this.api}/xml`, { params: this.limpiar(filtros), responseType: 'blob' });
  }
}
