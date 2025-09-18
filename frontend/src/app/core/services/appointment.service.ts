import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../../features/models/Appointment';
import { Page } from '../../features/models/PageModel';
import { AppointmentInsertDTO } from '../../features/models/AppointmentInsertDTO';

export interface AppointmentFilters {
  page?: number;
  size?: number;
  minDate?: string;
  maxDate?: string;
  employeeId?: number | null;
  status?: string | null;
}

@Injectable({
  providedIn: 'root',
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

  findFaturableByCustomer(customerId: number): Observable<Appointment[]> {
    const params = new HttpParams().set('customerId', customerId.toString());
    return this.http.get<Appointment[]>(`${this.apiUrl}/faturable`, { params });
  }

  updateStatus(id: number, newStatus: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, { newStatus });
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  findMyAppointments(filters: { page: number; size: number }): Observable<Page<Appointment>> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());
    return this.http.get<Page<Appointment>>(`${this.apiUrl}/my`, { params });
  }

  findAvailableTimes(serviceId: number, date: string, employeeId: number | null): Observable<string[]> {
    let params = new HttpParams()
      .set('serviceId', serviceId.toString())
      .set('date', date);

    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }

    return this.http.get<string[]>(`${this.apiUrl}/availability`, { params });
  }

  create(dto: AppointmentInsertDTO): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, dto);
  }

}
