import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take, of, catchError } from 'rxjs';

/**
 * Guarda de rota que verifica se o usuário é ADMIN ou se é um CAIXA acessando rotas permitidas.
 */
export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    // Passo 1: Garante que temos os dados do usuário, buscando na API se não estiverem em cache.
    switchMap(user => (user ? of(user) : authService.getMe())),
    // Passo 2: Aplica as regras de permissão baseadas nos papéis e cargo do usuário.
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const isAdmin = user.roles?.some(r => r.authority === 'ROLE_ADMIN');
      if (isAdmin) {
        return true;
      }

      const isCashier = user.jobTitle?.toLowerCase() === 'caixa';
      if (isCashier) {
        const allowedCashierRoutes = ['/admin/caixa', '/admin/faturas', '/admin/clientes'];
        const isNavigatingToAllowedRoute = allowedCashierRoutes.some(allowedRoute => state.url.startsWith(allowedRoute));

        if (isNavigatingToAllowedRoute) {
          return true;
        }
      }

      router.navigate(['/home']);
      return false;
    }),
    // Tratamento de erro: Em caso de falha na obtenção do usuário, desloga e nega o acesso.
    catchError(() => {
      authService.logout();
      return of(false);
    })
  );
};
