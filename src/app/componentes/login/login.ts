import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth-service';
import { Credenciales } from '../../modelos/modelos';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  cargando = signal(false);
  bienvenida = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const datos = new FormData(form);

    const credenciales: Credenciales = {
      correo: datos.get('correo') as string,
      contrasena: datos.get('contrasena') as string,
    };

    this.cargando.set(true);

    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        // guardar el token y los datos del usuario
        this.authService.guardarSesion(respuesta);

        // mensaje para el tipo de persona que entra: "Hola Edgar, administrador"
        this.bienvenida.set(`Hola ${respuesta.nombre}, ${this.authService.textoRol(respuesta.rol)}`);

        // el administrador va al dashboard y el cliente a la tienda
        setTimeout(() => this.router.navigate([this.authService.rutaInicial(respuesta.rol)]), 1300);
      },
      error: (error) => {
        this.cargando.set(false);
        let mensaje = 'Error en el inicio de sesión. Por favor, inténtelo de nuevo más tarde.';
        if (error.status === 401) {
          mensaje = 'Usuario o contraseña incorrectos';
        } else if (error.status === 0) {
          mensaje = 'No se pudo conectar con el servidor';
        }
        this.router.navigate(['/sin-acceso'], { queryParams: { error: mensaje } });
      },
    });
  }
}
