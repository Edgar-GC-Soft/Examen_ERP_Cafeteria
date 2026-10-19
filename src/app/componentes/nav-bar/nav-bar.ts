import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // aqui se importan las herramientas de rutas de Angular
import { AuthService } from '../../servicios/auth-service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive], // aqui se conectan con nav-bar.html
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar {
  constructor(public authService: AuthService, private router: Router) {}

  // cierra sesion, elimina las credenciales y redirige a login
  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
