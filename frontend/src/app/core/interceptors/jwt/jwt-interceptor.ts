import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Injetamos o PLATFORM_ID para acessar o localStorage com segurança
  const platformId = inject(PLATFORM_ID);

  // Acessamos o token diretamente do localStorage, sem injetar o AuthService
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth_token'); // A mesma chave usada no AuthService

    if (token) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedReq);
    }
  }

  return next(req);
};
