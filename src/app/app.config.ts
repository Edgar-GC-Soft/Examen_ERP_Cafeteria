import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router'; // se importa la funcion de rutas
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // aqui se importa HttpClient

import { routes } from './app.routes'; // aqui se importa el arreglo de rutas
import { authInterceptor } from './servicios/auth-interceptor'; // agrega el token a las peticiones

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), // aqui se activan las rutas en toda la aplicacion
    provideHttpClient(withInterceptors([authInterceptor])) // aqui se activa HttpClient con el interceptor
  ]
};
