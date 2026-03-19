import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withDebugTracing } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { LeafletModule } from '@bluehalo/ngx-leaflet';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    importProvidersFrom(LeafletModule),
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withDebugTracing() // si no quieres tanto log, lo puedes quitar
    ),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),
  ],
};
