import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth-service';

// guardian de permisos: compara el rol del usuario con data.roles de la ruta
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // roles permitidos en la ruta
  const rolesPermitidos = (route.data['roles'] as string[]) ?? [];

  // verificar que exista una sesion
  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  // el usuario tiene permisos
  if (authService.tieneRol(rolesPermitidos)) {
    return true;
  }

  // el usuario esta autenticado pero no tiene permisos
  return router.createUrlTree(['/sin-acceso']);
};
