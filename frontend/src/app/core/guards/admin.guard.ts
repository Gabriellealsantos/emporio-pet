import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take, of, catchError } from 'rxjs';

export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    switchMap(user => (user ? of(user) : authService.getMe())),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const isAdmin = user.roles?.some(r => r.authority === 'ROLE_ADMIN');

      // 1. Se for ADMIN, tem acesso a TUDO.
      if (isAdmin) {
        return true;
      }

      // 2. Se não for ADMIN, verificamos se é um Caixa.
      const isCashier = user.jobTitle?.toLowerCase() === 'caixa';

      if (isCashier) {
        // 3. Se for Caixa, verificamos se a rota que ele quer acessar é permitida.
        const allowedCashierRoutes = ['/admin/caixa', '/admin/faturas', '/admin/clientes'];

        // Usamos state.url para pegar a URL que o usuário está tentando acessar.
        if (allowedCashierRoutes.some(allowedRoute => state.url.startsWith(allowedRoute))) {
          return true; // Rota permitida para o Caixa.
        }
      }

      // 4. Se não for Admin e não for um Caixa tentando acessar uma rota permitida, o acesso é negado.
      router.navigate(['/home']); // Redireciona para um local seguro.
      return false;
    }),
    catchError(() => {
      authService.logout();
      return of(false);
    })
  );
};
