import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // aqui se importa el router-outlet
import { NavBar } from './componentes/nav-bar/nav-bar'; // aqui se importa el componente nav-bar
import { AuthService } from './servicios/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NavBar], // aqui se conectan con app.html
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public authService: AuthService) {}
}
