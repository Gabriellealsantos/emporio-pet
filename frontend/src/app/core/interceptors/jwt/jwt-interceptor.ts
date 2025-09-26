import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Interceptador HTTP que anexa o token JWT, salvo no localStorage, ao
 * cabeçalho 'Authorization' de todas as requisições HTTP enviadas.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o PLATFORM_ID para garantir que o localStorage só seja acessado no navegador.
  const platformId = inject(PLATFORM_ID);

  // A lógica de anotação do token só deve rodar no ambiente do browser.
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth_token');

    // Se um token for encontrado, clona a requisição e adiciona o cabeçalho.
    if (token) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedReq);
    }
  }

  // Se não estiver no navegador ou não houver token, a requisição segue sem modificações.
  return next(req);
};
