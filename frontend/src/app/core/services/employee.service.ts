import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/models/User';
import { Page } from '../../features/models/PageModel';
import { EmployeeInsert } from '../../features/models/EmployeeInsert';

/** Define a estrutura de filtros para a busca de funcionários. */
export interface EmployeeFilters {
  page?: number;
  size?: number;
  name?: string;
  status?: string;
  searchTerm?: string;
}

/** Serviço para gerenciar as operações de API relacionadas a funcionários. */
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private userApiUrl = `${environment.BASE_URL}/users`;
  private employeeApiUrl = `${environment.BASE_URL}/employees`;

  /** Cria um novo funcionário. */
  create(employeeData: EmployeeInsert): Observable<User> {
    return this.http.post<User>(this.employeeApiUrl, employeeData);
  }

  /** Busca uma página de usuários com o perfil de funcionário, aplicando filtros. */
  findAll(filters: EmployeeFilters): Observable<Page<User>> {
    let params = new HttpParams()
      .set('role', 'EMPLOYEE')
      .set('page', filters.page?.toString() ?? '0')
      .set('size', filters.size?.toString() ?? '10');

    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }

    return this.http.get<Page<User>>(this.userApiUrl, { params });
  }

  /** Busca os dados completos de um funcionário pelo seu ID. */
  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/${id}`);
  }

  /** Associa um serviço a um funcionário. */
  addService(employeeId: number, serviceId: number): Observable<User> {
    return this.http.post<User>(`${this.employeeApiUrl}/${employeeId}/services`, { serviceId });
  }

  /** Remove a associação de um serviço com um funcionário. */
  removeService(employeeId: number, serviceId: number): Observable<void> {
    return this.http.delete<void>(`${this.employeeApiUrl}/${employeeId}/services/${serviceId}`);
  }

  /** Atualiza os dados cadastrais de um funcionário. */
  update(id: number, employeeData: Partial<EmployeeInsert>): Observable<User> {
    return this.http.put<User>(`${this.employeeApiUrl}/${id}`, employeeData);
  }

  /** Atualiza o status (ativo, inativo, bloqueado) de um funcionário. */
  updateStatus(id: number, newStatus: string): Observable<User> {
    return this.http.patch<User>(`${this.userApiUrl}/${id}/status`, { newStatus });
  }
}
