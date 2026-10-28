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
    // evita recargar la pagina al enviar el formulario
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const datos = new FormData(form);

    const credenciales: Credenciales = {
      correo: datos.get('correo') as string,
      contrasena: datos.get('contrasena') as string,
    };

    this.cargando.set(true);

    // envia las credenciales y guarda la sesion si son validas
    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        this.authService.guardarSesion(respuesta);

        // muestra un saludo con el rol del usuario
        this.bienvenida.set(`Hola ${respuesta.nombre}, ${this.authService.textoRol(respuesta.rol)}`);

        // dirige al usuario a la pantalla de su rol
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
