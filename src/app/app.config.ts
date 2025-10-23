import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withDebugTracing } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { withCredentialsInterceptor } from './core/interceptor/with-credentials.interceptor';
import { provideZonelessChangeDetection } from '@angular/core'; 
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),withDebugTracing()  // ✅ espera guards antes de pintar
    ),
    provideHttpClient(withInterceptors([withCredentialsInterceptor])),
  ],
};