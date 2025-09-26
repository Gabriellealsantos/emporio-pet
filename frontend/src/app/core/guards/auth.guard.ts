import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guarda de rota que verifica a autenticação e o status do usuário antes de permitir o acesso.
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);
  const notificationService = inject(NotificationService);

  const token = authService.getToken();
  if (!token) {
    router.navigate(['/login']);
    return of(false);
  }

  loadingService.show();

  return authService.getCurrentUser().pipe(
    take(1),
    // Passo 1: Busca o usuário, priorizando o cache local antes de chamar a API.
    switchMap(userInCache => {
      if (userInCache) {
        return of(userInCache);
      }
      return authService.getMe();
    }),
    // Passo 2: Valida o status do usuário obtido.
    map(user => {
      if (!user) {
        authService.logout();
        return false;
      }

      if (user.userStatus !== 'NON_BLOCKED') {
        let message = 'Sua conta não tem permissão para acessar o sistema.';

        if (user.userStatus === 'BLOCKED') {
          message = 'Sua conta foi bloqueada. Entre em contato com o suporte.';
        } else if (user.userStatus === 'INACTIVE') {
          message = 'Sua conta está inativa.';
        } else if (user.userStatus === 'SUSPENDED') {
          message = 'Sua conta está suspensa.';
        }

        notificationService.showError(message);
        authService.logout();
        return false;
      }

      return true;
    }),
    // Tratamento de erro: Se qualquer passo anterior falhar, desloga o usuário.
    catchError(() => {
      notificationService.showError('Sua sessão é inválida. Por favor, faça login novamente.');
      authService.logout();
      return of(false);
    }),
    // Finalização: Garante que o indicador de loading seja escondido, com sucesso ou erro.
    finalize(() => loadingService.hide())
  );
};
