import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take, of, catchError } from 'rxjs';

export const customerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Lógica robusta que espera o usuário ser carregado antes de decidir
  return authService.getCurrentUser().pipe(
    take(1),
    switchMap(user => {
      // Se o usuário já está na memória, usamos ele.
      if (user) {
        return of(user);
      }
      // Se não, é um refresh (F5), então buscamos no backend.
      return authService.getMe();
    }),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      // Verifica se o usuário tem a permissão de CLIENT
      const isClient = user.roles?.some(r => r.authority === 'ROLE_CLIENT');

      if (isClient) {
        return true; // É cliente, acesso permitido.
      }

      // Se não for cliente, redireciona para um local seguro (home).
      router.navigate(['/home']);
      return false;
    }),
    catchError(() => {
      // Se getMe() falhar, o token é inválido.
      authService.logout();
      return of(false);
    })
  );
};
