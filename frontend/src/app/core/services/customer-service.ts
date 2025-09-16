import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/models/User';
import { Page } from '../../features/models/PageModel';

export interface ClientFilters {
  page?: number;
  size?: number;
  name?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private userApiUrl = `${environment.BASE_URL}/users`;
  private customerApiUrl = `${environment.BASE_URL}/customers`;

  findAll(filters: ClientFilters): Observable<Page<User>> {
    let params = new HttpParams();

    // Adiciona o parâmetro fixo para buscar apenas clientes
    params = params.set('role', 'CLIENT');

    // Parâmetros de paginação
    params = params.set('page', filters.page?.toString() ?? '0');
    params = params.set('size', filters.size?.toString() ?? '10');

    // Filtros dinâmicos
    if (filters.name) {
      params = params.set('searchTerm', filters.name);
    }
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }

    return this.http.get<Page<User>>(this.userApiUrl, { params });
  }

  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/${id}`);
  }

  // NOVO: Atualizar dados do cliente
  update(id: number, customerData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.customerApiUrl}/${id}`, customerData);
  }

  // NOVO: Atualizar status do cliente
  updateStatus(id: number, newStatus: string): Observable<User> {
    // O backend espera um objeto com a chave "newStatus"
    return this.http.patch<User>(`${this.userApiUrl}/${id}/status`, { newStatus });
  }

}
