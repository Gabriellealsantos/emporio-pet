// src/app/core/services/auth.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Credentials } from '../../features/models/Credentials';

// A resposta da sua API de login que contém o token
interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private router = inject(Router);
  private http = inject(HttpClient);

  // Método para fazer o login
  login(credentials: Credentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.BASE_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
      })
    );
  }

  // Salva o token no localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Pega o token do localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Remove o token para fazer logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  // Verifica se o usuário está logado (uma verificação simples por enquanto)
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.BASE_URL}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.BASE_URL}/auth/new-password`, { token, newPassword });
  }
}
