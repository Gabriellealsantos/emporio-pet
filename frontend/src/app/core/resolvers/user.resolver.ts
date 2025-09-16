import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../../features/models/User';

export const userResolver = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // A lógica é quase idêntica à do nosso authGuard
  return authService.getCurrentUser().pipe(
    take(1),
    switchMap((user: User | null) => {
      // Se o usuário já está no serviço, apenas o retornamos.
      if (user) {
        return of(user);
      }

      // Se não, verificamos o token
      const token = authService.getToken();
      if (!token) {
        // Se não há token, redireciona e falha o resolver
        router.navigate(['/login']);
        return of(null);
      }

      // Se há token, tentamos buscar o usuário
      return authService.getMe().pipe(
        map(fetchedUser => {
          // Se o backend retornou um usuário, o token é válido.
          if (fetchedUser) {
            return fetchedUser;
          }
          // Se não veio usuário, redireciona e falha.
          router.navigate(['/login']);
          return null;
        }),
        catchError(() => {
          // Se a chamada getMe() deu erro, o token é inválido.
          authService.logout();
          return of(null);
        })
      );
    })
  );
};
