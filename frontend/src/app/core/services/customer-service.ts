import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/models/User';
import { Page } from '../../features/models/PageModel';

/** Define a estrutura de filtros para a busca de clientes. */
export interface ClientFilters {
  page?: number;
  size?: number;
  name?: string;
  status?: string;
}

/** Serviço para gerenciar as operações de API relacionadas a clientes. */
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private userApiUrl = `${environment.BASE_URL}/users`;
  private customerApiUrl = `${environment.BASE_URL}/customers`;

  /** Busca uma página de usuários com o perfil de cliente, aplicando filtros. */
  findAll(filters: ClientFilters): Observable<Page<User>> {
    let params = new HttpParams();

    // Adiciona o parâmetro fixo para buscar apenas clientes.
    params = params.set('role', 'CLIENT');

    // Parâmetros de paginação.
    params = params.set('page', filters.page?.toString() ?? '0');
    params = params.set('size', filters.size?.toString() ?? '10');

    // Filtros dinâmicos.
    if (filters.name) {
      params = params.set('searchTerm', filters.name);
    }
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }

    return this.http.get<Page<User>>(this.userApiUrl, { params });
  }

  /** Busca os dados completos de um cliente pelo seu ID. */
  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/${id}`);
  }

  /** Atualiza os dados cadastrais de um cliente. */
  update(id: number, customerData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.customerApiUrl}/${id}`, customerData);
  }

  /** Atualiza o status (ativo, inativo, bloqueado) de um cliente. */
  updateStatus(id: number, newStatus: string): Observable<User> {
    // O backend espera um objeto com a chave "newStatus".
    return this.http.patch<User>(`${this.userApiUrl}/${id}/status`, { newStatus });
  }

}
