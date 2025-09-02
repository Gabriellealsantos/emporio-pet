import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Credentials } from '../../features/models/Credentials';
import { User } from '../../features/models/User';

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
    // A verificação agora é mais simples: se tem token, tenta carregar o usuário.
    this.loadUserOnStart();
  }

  private loadUserOnStart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token) {
        // Apenas disparamos a chamada. O guard vai lidar com a espera.
        this.getMe().subscribe({
          error: (err) => {
            // Se o token for inválido, apenas limpamos o estado.
            console.error("Sessão expirada ou token inválido.", err);
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
        switchMap(() => this.getMe()) // Após salvar o token, busca os dados do usuário
      );
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

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
