import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Pega o estado atual do usuário
  return authService.getCurrentUser().pipe(
    take(1), // Pega apenas o valor atual e encerra
    switchMap(user => {
      // 1. Se já temos um usuário no serviço, a pessoa está logada.
      if (user) {
        return of(true);
      }

      // 2. Se não temos usuário, verificamos se há um token no storage.
      const token = authService.getToken();
      if (!token) {
        // Se não há token, com certeza não está logado.
        router.navigate(['/login']);
        return of(false);
      }

      // 3. Se há um token, mas não há usuário, tentamos buscar o usuário (validação do token).
      return authService.getMe().pipe(
        map(fetchedUser => {
          // Se o backend retornou um usuário, o token é válido.
          if (fetchedUser) {
            return true;
          }
          // Se por algum motivo não veio usuário, bloqueia.
          router.navigate(['/login']);
          return false;
        }),
        catchError(() => {
          // Se a chamada getMe() deu erro (ex: 401), o token é inválido.
          authService.logout(); // Limpa o estado e redireciona
          return of(false);
        })
      );
    })
  );
};
