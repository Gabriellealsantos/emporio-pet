import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take, of, catchError } from 'rxjs';

export const employeeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    switchMap(user => {
      if (user) {
        return of(user);
      }
      return authService.getMe();
    }),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const isAuthorized = user.roles?.some(
        r => r.authority === 'ROLE_EMPLOYEE' || r.authority === 'ROLE_ADMIN'
      );

      if (isAuthorized) {
        return true; // É funcionário ou admin, acesso permitido.
      }

      router.navigate(['/home']); // Não é funcionário, vai para a home.
      return false;
    }),
    catchError(() => {
      authService.logout();
      return of(false);
    })
  );
};
