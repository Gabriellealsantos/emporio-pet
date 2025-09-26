import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../../features/models/User';

/**
 * Resolver que fornece os dados do usuário logado para uma rota.
 * Garante que os dados do usuário estejam disponíveis antes da ativação da rota,
 * redirecionando para a página de login caso a autenticação falhe.
 */
export const userResolver = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    // Garante que os dados do usuário sejam obtidos, priorizando o cache local.
    switchMap((user: User | null) => {
      if (user) {
        return of(user);
      }

      // Se não houver usuário em cache, verifica a existência de um token.
      const token = authService.getToken();
      if (!token) {
        router.navigate(['/login']);
        return of(null);
      }

      // Com o token, tenta buscar os dados do usuário na API.
      return authService.getMe().pipe(
        map(fetchedUser => {
          if (fetchedUser) {
            return fetchedUser;
          }
          router.navigate(['/login']);
          return null;
        }),
        // Se a busca na API falhar, o token é inválido; desloga e redireciona.
        catchError(() => {
          authService.logout();
          return of(null);
        })
      );
    })
  );
};
