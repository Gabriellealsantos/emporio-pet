import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take, of, catchError } from 'rxjs';

/**
 * Guarda de rota que verifica se o usuário autenticado tem a permissão de 'CLIENT'.
 */
export const customerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    // Passo 1: Garante que temos os dados do usuário, buscando na API se não estiverem em cache.
    switchMap(user => {
      if (user) {
        return of(user);
      }
      return authService.getMe();
    }),
    // Passo 2: Verifica se o usuário obtido possui a permissão de 'ROLE_CLIENT'.
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const isClient = user.roles?.some(r => r.authority === 'ROLE_CLIENT');

      if (isClient) {
        return true;
      }

      router.navigate(['/home']);
      return false;
    }),
    // Tratamento de erro: Em caso de falha, desloga o usuário e nega o acesso.
    catchError(() => {
      authService.logout();
      return of(false);
    })
  );
};
