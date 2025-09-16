import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take, of, catchError } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esta lógica garante que esperamos o usuário ser carregado antes de decidir.
  return authService.getCurrentUser().pipe(
    take(1),
    switchMap(user => {
      // Se o usuário já está carregado na memória, usamos ele.
      if (user) {
        return of(user);
      }
      // Se não, é um refresh (F5), então buscamos no backend.
      return authService.getMe();
    }),
    map(user => {
      if (!user) { // Se mesmo após a busca não houver usuário, o token é inválido.
        router.navigate(['/login']);
        return false;
      }

      const isAdmin = user.roles?.some(r => r.authority === 'ROLE_ADMIN');
      if (isAdmin) {
        return true; // Usuário é admin, acesso permitido.
      }

      router.navigate(['/home']); // Não é admin, vai para a home.
      return false;
    }),
    catchError(() => {
      // Se getMe() falhar, o token é inválido.
      authService.logout();
      return of(false);
    })
  );
};
