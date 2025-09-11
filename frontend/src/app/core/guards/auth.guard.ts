// Em src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { Router } from '@angular/router';
// Adicione 'take' aos imports do rxjs
import { catchError, finalize, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);

  const token = authService.getToken();
  if (!token) {
    router.navigate(['/login']);
    return of(false);
  }

  loadingService.show();

  return authService.getCurrentUser().pipe(
    // AQUI ESTÁ A CORREÇÃO:
    // Pegamos apenas o 1º valor emitido e completamos o fluxo.
    take(1),

    switchMap(user => {
      if (user) {
        return of(true);
      }
      return authService.getMe().pipe(
        map(fetchedUser => !!fetchedUser),
        catchError(() => {
          authService.logout();
          return of(false);
        })
      );
    }),
    finalize(() => loadingService.hide())
  );
};
