import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/models/User';
import { Page } from './customer-service';
import { EmployeeInsert } from '../../features/models/EmployeeInsert';

export interface EmployeeFilters {
  page?: number;
  size?: number;
  name?: string;
  status?: string;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private userApiUrl = `${environment.BASE_URL}/users`;
  private employeeApiUrl = `${environment.BASE_URL}/employees`;

  create(employeeData: EmployeeInsert): Observable<User> {
    return this.http.post<User>(this.employeeApiUrl, employeeData);
  }

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

  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/${id}`);
  }

  addService(employeeId: number, serviceId: number): Observable<User> {
    return this.http.post<User>(`${this.employeeApiUrl}/${employeeId}/services`, { serviceId });
  }

  // Remover um serviço de um funcionário
  removeService(employeeId: number, serviceId: number): Observable<void> {
    return this.http.delete<void>(`${this.employeeApiUrl}/${employeeId}/services/${serviceId}`);
  }

  update(id: number, employeeData: Partial<EmployeeInsert>): Observable<User> {
    return this.http.put<User>(`${this.employeeApiUrl}/${id}`, employeeData);
  }

  updateStatus(id: number, newStatus: string): Observable<User> {
    return this.http.patch<User>(`${this.userApiUrl}/${id}/status`, { newStatus });
  }
}
