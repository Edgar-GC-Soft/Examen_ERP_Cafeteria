import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Credenciales, RespuestaLogin, UsuarioSesion } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiServerUrl = 'http://localhost:3000/api';

  // usuario con sesion iniciada (el menu se actualiza solo cuando cambia)
  sesion = signal<UsuarioSesion | null>(this.leerUsuario());

  constructor(private http: HttpClient) {}

  // localStorage solo existe en el navegador
  private get almacen(): Storage | null {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  }

  // enviar credenciales al backend
  login(credenciales: Credenciales): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${this.apiServerUrl}/login`, credenciales);
  }

  // sesion
  guardarSesion(respuesta: RespuestaLogin): void {
    const usuario = { nombre: respuesta.nombre, correo: respuesta.correo, rol: respuesta.rol };
    this.almacen?.setItem('token', respuesta.token);
    this.almacen?.setItem('usuario', JSON.stringify(usuario));
    this.sesion.set(usuario);
  }

  obtenerToken(): string | null {
    return this.almacen?.getItem('token') ?? null;
  }

  private leerUsuario(): UsuarioSesion | null {
    const datos = this.almacen?.getItem('usuario');
    return datos ? JSON.parse(datos) : null;
  }

  obtenerUsuario(): UsuarioSesion | null {
    return this.leerUsuario();
  }

  // elimina las credenciales
  cerrarSesion(): void {
    this.almacen?.removeItem('token');
    this.almacen?.removeItem('usuario');
    this.sesion.set(null);
  }

  // lee el contenido del JWT: { id, rol, iat, exp }
  private decodificarToken(token: string): { id: number; rol: string; exp: number } | null {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // true si hay token y todavia no ha expirado
  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) {
      return false;
    }
    const datos = this.decodificarToken(token);
    if (!datos || datos.exp * 1000 < Date.now()) {
      this.cerrarSesion(); // token invalido o vencido
      return false;
    }
    return true;
  }

  // rol
  obtenerRol(): string | null {
    const token = this.obtenerToken();
    return token ? (this.decodificarToken(token)?.rol ?? null) : null;
  }

  tieneRol(rolesPermitidos: string[]): boolean {
    const rol = this.obtenerRol();
    return rol !== null && rolesPermitidos.includes(rol);
  }

  // texto para los mensajes: admin -> administrador
  textoRol(rol: string | null | undefined): string {
    return rol === 'admin' ? 'administrador' : (rol ?? '');
  }

  // pantalla a la que se manda cada rol al iniciar sesion
  rutaInicial(rol: string): string {
    return rol === 'admin' ? '/dashboard' : '/ventas';
  }
}
