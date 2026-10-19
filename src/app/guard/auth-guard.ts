import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth-service';

// guardian de autenticacion: solo deja pasar si hay una sesion valida
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true; // permitimos el acceso
  }

  // si no esta autenticado, redirigimos al login
  return router.createUrlTree(['/login']);
};
