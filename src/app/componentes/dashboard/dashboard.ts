import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth-service';
import { DashboardService } from '../../servicios/dashboard-service';
import { ResumenDashboard } from '../../modelos/modelos';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  resumen = signal<ResumenDashboard | null>(null);
  nombre: string;

  constructor(private dashboardService: DashboardService, authService: AuthService) {
    this.nombre = authService.obtenerUsuario()?.nombre ?? '';
  }

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (datos) => this.resumen.set(datos),
      error: (error) => console.error('Error al obtener el resumen', error)
    });
  }
}
