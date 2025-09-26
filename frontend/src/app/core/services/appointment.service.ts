import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../../features/models/Appointment';
import { Page } from '../../features/models/PageModel';
import { AppointmentInsertDTO } from '../../features/models/AppointmentInsertDTO';

/** Define a estrutura de filtros para a busca de agendamentos. */
export interface AppointmentFilters {
  page?: number;
  size?: number;
  minDate?: string;
  maxDate?: string;
  employeeId?: number | null;
  status?: string | null;
}

/** Serviço para gerenciar as operações de API relacionadas a agendamentos. */
@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/appointments`;

  /** Busca uma página de agendamentos com base nos filtros fornecidos. */
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

  /** Busca agendamentos faturáveis para um cliente específico. */
  findFaturableByCustomer(customerId: number): Observable<Appointment[]> {
    const params = new HttpParams().set('customerId', customerId.toString());
    return this.http.get<Appointment[]>(`${this.apiUrl}/faturable`, { params });
  }

  /** Atualiza o status de um agendamento. */
  updateStatus(id: number, newStatus: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, { newStatus });
  }

  /** Cancela (exclui) um agendamento. */
  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Busca os agendamentos do usuário autenticado com filtros. */
  findMyAppointments(filters: {
    page: number;
    size?: number;
    minDate?: string | null;
    maxDate?: string | null;
    status?: string | null;
  }): Observable<Page<Appointment>> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', (filters.size ?? 10).toString());

    if (filters.minDate) {
      params = params.set('minDate', filters.minDate);
    }
    if (filters.maxDate) {
      params = params.set('maxDate', filters.maxDate);
    }
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<Page<Appointment>>(`${this.apiUrl}/my`, { params });
  }

  /** Busca os horários disponíveis para um serviço em uma data específica. */
  findAvailableTimes(
    serviceId: number,
    date: string,
    employeeId: number | null
  ): Observable<string[]> {
    let params = new HttpParams().set('serviceId', serviceId.toString()).set('date', date);

    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }

    return this.http.get<string[]>(`${this.apiUrl}/availability`, { params });
  }

  /** Cria um novo agendamento. */
  create(dto: AppointmentInsertDTO): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, dto);
  }

  /** Busca os próximos agendamentos do usuário autenticado. */
  findMyUpcomingAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/my/upcoming`);
  }
}
