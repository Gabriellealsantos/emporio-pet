import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification.service'; // ADICIONE ESTA IMPORTAÇÃO

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);
  const notificationService = inject(NotificationService); // ADICIONE ESTA INJEÇÃO

  const token = authService.getToken();
  if (!token) {
    router.navigate(['/login']);
    return of(false);
  }

  loadingService.show();

  return authService.getCurrentUser().pipe(
    take(1),
    switchMap(userInCache => {
      // Se já temos o usuário no cache do BehaviorSubject, usamos ele.
      if (userInCache) {
        return of(userInCache);
      }
      // Se não, é o primeiro carregamento, buscamos na API.
      return authService.getMe();
    }),
    map(user => {
      // Se, por algum motivo, não conseguimos obter o usuário, bloqueamos.
      if (!user) {
        authService.logout();
        return false;
      }

      // 👇 ESTA É A NOVA LÓGICA DE VERIFICAÇÃO DE STATUS
      if (user.userStatus !== 'NON_BLOCKED') {
        let message = 'Sua conta não tem permissão para acessar o sistema.';
        if(user.userStatus === 'BLOCKED') {
          message = 'Sua conta foi bloqueada. Entre em contato com o suporte.';
        } else if (user.userStatus === 'INACTIVE') {
          message = 'Sua conta está inativa.';
        } else if (user.userStatus === 'SUSPENDED') {
          message = 'Sua conta está suspensa.';
        }

        notificationService.showError(message); // Mostra uma mensagem clara
        authService.logout(); // Desloga o usuário
        return false; // Impede a navegação
      }

      // Se o status for NON_BLOCKED, permite o acesso.
      return true;
    }),
    catchError(() => {
      notificationService.showError('Sua sessão é inválida. Por favor, faça login novamente.');
      authService.logout();
      return of(false);
    }),
    finalize(() => loadingService.hide())
  );
};
