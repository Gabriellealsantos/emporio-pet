import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { jwtInterceptor } from './core/interceptors/jwt/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNgxMask(),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideClientHydration(withEventReplay())
  ]
};
