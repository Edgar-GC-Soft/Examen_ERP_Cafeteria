import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.api);
  }

  agregarUsuario(usuario: unknown): Observable<unknown> {
    return this.http.post(this.api, usuario);
  }

  actualizarUsuario(id: number, usuario: unknown): Observable<unknown> {
    return this.http.put(`${this.api}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<unknown> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
