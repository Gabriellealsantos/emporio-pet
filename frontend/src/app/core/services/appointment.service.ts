import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from './customer-service';
import { Appointment } from '../../features/models/Appointment';

export interface AppointmentFilters {
  page?: number;
  size?: number;
  minDate?: string;
  maxDate?: string;
  employeeId?: number | null;
  status?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/appointments`;

  /**
   * Busca uma página de agendamentos com base nos filtros fornecidos.
   */
  findAll(filters: AppointmentFilters): Observable<Page<Appointment>> {
    let params = new HttpParams();

    // Parâmetros de paginação
    params = params.set('page', filters.page?.toString() ?? '0');
    params = params.set('size', filters.size?.toString() ?? '10');

    // Filtros dinâmicos
    if (filters.minDate) params = params.set('minDate', filters.minDate);
    if (filters.maxDate) params = params.set('maxDate', filters.maxDate);
    if (filters.employeeId) params = params.set('employeeId', filters.employeeId.toString());
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }

    return this.http.get<Page<Appointment>>(this.apiUrl, { params });
  }

  // Futuramente, implementaremos os métodos de ação
  updateStatus(id: number, newStatus: string): Observable<Appointment> {
    // A ser implementado
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, { newStatus });
  }

  cancel(id: number): Observable<void> {
    // A ser implementado
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
