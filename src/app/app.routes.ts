import { Routes } from '@angular/router';
import { Login } from './componentes/login/login';
import { SinAcceso } from './componentes/sin-acceso/sin-acceso';
import { Dashboard } from './componentes/dashboard/dashboard';
import { Usuarios } from './componentes/usuarios/usuarios';
import { Inventario } from './componentes/inventario/inventario';
import { Proveedores } from './componentes/proveedores/proveedores';
import { Compras } from './componentes/compras/compras';
import { Ventas } from './componentes/ventas/ventas';
import { Checkout } from './componentes/checkout/checkout';
import { Historial } from './componentes/historial/historial';
import { Contabilidad } from './componentes/contabilidad/contabilidad';
import { Rh } from './componentes/rh/rh';
import { authGuard } from './guard/auth-guard';
import { roleGuard } from './guard/role-guard';

export const routes: Routes = [
  // ruta inicial
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // rutas publicas
  { path: 'login', component: Login },
  { path: 'sin-acceso', component: SinAcceso },

  // rutas protegidas: primero revisa la sesion y luego el rol
  // solo administrador
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'usuarios', component: Usuarios, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'inventario', component: Inventario, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'proveedores', component: Proveedores, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'compras', component: Compras, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'contabilidad', component: Contabilidad, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'rh', component: Rh, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },

  // administrador y cliente
  { path: 'ventas', component: Ventas, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'cliente'] } },
  { path: 'checkout', component: Checkout, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'cliente'] } },
  { path: 'historial', component: Historial, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'cliente'] } },

  // cualquier otra ruta
  { path: '**', redirectTo: '/login' }
];
