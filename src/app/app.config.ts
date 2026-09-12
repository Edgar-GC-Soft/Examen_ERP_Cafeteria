
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router'; // se importa la funcion de rutas
import { provideHttpClient } from '@angular/common/http'; // aqui se importa HttpClient

import { routes } from './app.routes'; // aqui se importa el arreglo de rutas

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), // aqui se activan las rutas en toda la aplicacion
    provideHttpClient() // aqui se activa HttpClient en toda la app
  ]
};