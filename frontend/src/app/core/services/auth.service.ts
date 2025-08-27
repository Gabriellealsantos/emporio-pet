import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/models/User';
import { Credentials } from '../../features/models/Credentials';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private user$ = new BehaviorSubject<User | null>(null);

  constructor() {
   this.checkTokenAndFetchUserOnStart();
  }

  /**
   * ALTERAÇÃO 2: Esta função agora também BUSCA os dados do usuário se o token existir.
   */
  private checkTokenAndFetchUserOnStart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token) {
        // Se encontramos um token, imediatamente tentamos buscar os dados do usuário.
        // O .subscribe() é necessário para "disparar" a chamada HTTP do getMe().
        this.getMe().subscribe({
          error: (err) => {
            // Se o token for inválido (ex: expirado), o getMe() dará erro.
            // Nesse caso, limpamos o token antigo e deslogamos.
            console.error("Token inválido, fazendo logout.", err);
            this.logout();
          }
        });
      }
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$.asObservable();
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${environment.BASE_URL}/users/me`).pipe(
      tap(user => {
        // Atualiza o estado do usuário na aplicação
        this.user$.next(user);
      })
    );
  }

  login(credentials: Credentials): Observable<User> {
    return this.http
      .post<LoginResponse>(`${environment.BASE_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => this.saveToken(response.token)),
        switchMap(() => this.getMe())
      );
  }

  // ALTERAÇÃO 4: Adicionar verificação de plataforma
  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // ALTERAÇÃO 5: Adicionar verificação de plataforma
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // ALTERAÇÃO 6: Adicionar verificação de plataforma
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.user$.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.BASE_URL}/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(
    token: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.BASE_URL}/auth/new-password`,
      { token, newPassword }
    );
  }
}
