import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptador HTTP que captura erros e redireciona para uma página de erro
 * genérica caso o status seja 500 ou superior (erros de servidor).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    // Captura erros na resposta da requisição.
    catchError((error: HttpErrorResponse) => {
      // Se for um erro de servidor (5xx), redireciona para a página de erro.
      if (error.status >= 500) {
        router.navigate(['/error']);
      }

      // Propaga o erro para que outros tratamentos possam ser executados.
      return throwError(() => error);
    })
  );
};
