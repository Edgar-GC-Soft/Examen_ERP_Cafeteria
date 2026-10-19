import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../servicios/auth-service';
import { UsuarioSesion } from '../../modelos/modelos';

@Component({
  imports: [],
  selector: 'app-sin-acceso',
  styleUrl: './sin-acceso.css',
  templateUrl: './sin-acceso.html',
})
export class SinAcceso {
  usuario: UsuarioSesion | null;
  rolTexto: string;
  // mensaje que manda el login cuando las credenciales son incorrectas
  error: string | null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usuario = this.authService.obtenerUsuario();
    this.rolTexto = this.authService.textoRol(this.usuario?.rol);
    this.error = this.route.snapshot.queryParamMap.get('error');
  }

  volver() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
