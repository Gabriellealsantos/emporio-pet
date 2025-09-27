import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Credentials } from '../../features/models/Credentials';
import { User } from '../../features/models/User';
import { PasswordChange } from '../../features/models/PasswordChange';

/** Interface para a resposta da requisição de login. */
interface LoginResponse {
  token: string;
}

/** Gerencia a autenticação do usuário, estado da sessão e interação com a API de auth. */
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
  }

  /** Tenta carregar os dados do usuário no início da aplicação se um token existir. */
  private loadUserOnStart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token) {
        this.getMe().subscribe({
          error: (err) => {
            // Se o token for inválido, limpa a sessão para evitar inconsistências.
            console.error("Sessão expirada ou token inválido.", err);
            this.logout();
          }
        });
      }
    }
  }

  /** Atualiza manualmente os dados do usuário no estado global da aplicação. */
  updateCurrentUser(user: User): void {
    this.user$.next(user);
  }

  /** Envia uma requisição para alterar a senha do usuário logado. */
  changePassword(dto: PasswordChange): Observable<void> {
    return this.http.put<void>(
      `${environment.BASE_URL}/auth/change-password`,
      dto
    );
  }

  /** Retorna um Observable que emite o estado atual do usuário. */
  getCurrentUser(): Observable<User | null> {
    return this.user$.asObservable();
  }

  /** Busca os dados do usuário autenticado na API e atualiza o estado local. */
  getMe(): Observable<User> {
    return this.http.get<User>(`${environment.BASE_URL}/users/me`).pipe(
      tap(user => {
        // Atualiza o estado do usuário na aplicação
        this.user$.next(user);
      })
    );
  }

  /** Realiza o login, salva o token e busca os dados do usuário. */
  login(credentials: Credentials): Observable<User> {
    return this.http
      .post<LoginResponse>(`${environment.BASE_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => this.saveToken(response.token)),
        switchMap(() => this.getMe()) // Após salvar o token, busca os dados do usuário.
      );
  }

  /** Salva o token de autenticação no localStorage. */
  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /** Recupera o token de autenticação do localStorage. */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /** Limpa o token e o estado do usuário, redirecionando para o login. */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.user$.next(null);
    this.router.navigate(['/login']);
  }

  /** Verifica de forma síncrona se um token existe. */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Envia uma requisição para iniciar o processo de recuperação de senha. */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message:string }>(
      `${environment.BASE_URL}/auth/forgot-password`,
      { email }
    );
  }

  /** Envia uma requisição para definir uma nova senha usando um token de recuperação. */
  resetPassword(
    token: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message:string }>(
      `${environment.BASE_URL}/auth/new-password`,
      { token, newPassword }
    );
  }
}
