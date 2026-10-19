import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResumenDashboard } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = 'http://localhost:3000/api/dashboard';

  constructor(private http: HttpClient) {}

  obtenerResumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(this.api);
  }
}
