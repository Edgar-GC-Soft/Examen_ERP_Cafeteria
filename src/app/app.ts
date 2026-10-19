import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // aqui se importa el router-outlet
import { NavBar } from './componentes/nav-bar/nav-bar'; // aqui se importa el componente nav-bar
import { AuthService } from './servicios/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar], // aqui se conectan con app.html
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public authService: AuthService) {}
}
