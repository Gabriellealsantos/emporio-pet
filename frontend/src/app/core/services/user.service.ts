import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/models/User';
import { Page } from './customer-service';


/**
 * DTO para a atualização de dados do próprio usuário.
 * Corresponde ao UserUpdateDTO do backend.
 */
export interface UserUpdateDTO {
  name?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
}

/**
 * DTO para a atualização de status por um admin.
 */
export interface UserStatusUpdateDTO {
  newStatus: 'BLOCKED' | 'NON_BLOCKED' | 'INACTIVE' | 'SUSPENDED';
}

/**
 * Interface para os filtros da busca de usuários (tela de admin).
 */
export interface UserFilters {
  page?: number;
  size?: number;
  searchTerm?: string;
  status?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/users`;

  /**
   * Atualiza os dados do perfil do usuário logado.
   * Usado na tela "Meu Perfil".
   */
  updateMe(dto: UserUpdateDTO): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, dto);
  }

  /**
   * Busca uma lista paginada de todos os usuários.
   * Usado nas telas de admin para listar Clientes e Funcionários.
   */
  findAll(filters: UserFilters): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', filters.page?.toString() ?? '0')
      .set('size', filters.size?.toString() ?? '10');

    if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.role) params = params.set('role', filters.role);

    return this.http.get<Page<User>>(this.apiUrl, { params });
  }

  /**
   * Busca um usuário específico pelo ID.
   * Usado nas telas de detalhe de Cliente/Funcionário (admin).
   */
  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Atualiza o status de um usuário.
   * Usado na tela de admin.
   */
  updateStatus(id: number, dto: UserStatusUpdateDTO): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, dto);
  }
}
