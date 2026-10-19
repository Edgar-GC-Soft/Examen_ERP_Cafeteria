import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asistencia, Nomina } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class RhService {
  private api = 'http://localhost:3000/api/rh';

  constructor(private http: HttpClient) {}

  obtenerAsistencias(): Observable<Asistencia[]> {
    return this.http.get<Asistencia[]>(`${this.api}/asistencias`);
  }

  registrarLlegada(): Observable<unknown> {
    return this.http.post(`${this.api}/llegada`, {});
  }

  registrarSalida(): Observable<unknown> {
    return this.http.post(`${this.api}/salida`, {});
  }

  obtenerNominas(): Observable<Nomina[]> {
    return this.http.get<Nomina[]>(`${this.api}/nominas`);
  }

  pagarNomina(administradorId: number, monto: number): Observable<unknown> {
    return this.http.post(`${this.api}/nominas`, { administradorId, monto });
  }
}
