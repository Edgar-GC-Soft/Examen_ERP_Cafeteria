import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: string;
  salario: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api = 'http://localhost:3000/api/usuarios'; // aqui se apunta al backend

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Record<string, unknown>[]>(this.api).pipe(
      map(usuarios => usuarios.map(u => ({
        id: u['id'] as number,
        nombre: u['nombre'] as string,
        correo: u['correo'] as string,
        passwordHash: (u['password_hash'] ?? u['passwordHash']) as string,
        rol: u['rol'] as string,
        salario: (u['salario'] ?? null) as number | null
      })))
    );
  }

  agregarUsuario(usuario: any): Observable<any> {
    return this.http.post(this.api, usuario);
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}