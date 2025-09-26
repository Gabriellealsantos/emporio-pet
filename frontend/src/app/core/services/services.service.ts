import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Service } from '../../features/models/Service';
import { ServiceInsert } from '../../features/models/ServiceInsert';
import { ServiceUpdate } from '../../features/models/ServiceUpdate';
import { User } from '../../features/models/User';

/** Define a estrutura de filtros para a busca de serviços. */
export interface ServiceFilters {
  name?: string;
  active?: boolean | null;
}

/** Serviço para gerenciar as operações de API relacionadas a serviços oferecidos. */
@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/services`;

  /** Busca uma lista de serviços, com filtros por nome e status de ativação. */
  findAll(filters: ServiceFilters): Observable<Service[]> {
    let params = new HttpParams();

    if (filters.name) {
      params = params.set('name', filters.name);
    }

    if (filters.active !== null && filters.active !== undefined) {
      params = params.set('active', filters.active);
    }

    return this.http.get<Service[]>(this.apiUrl, { params });
  }

  /** Busca uma lista contendo apenas os serviços ativos. */
  findAllActiveServices(): Observable<Service[]> {
    return this.findAll({ active: true });
  }

  /** Busca os funcionários qualificados para realizar um determinado serviço. */
  findQualifiedEmployees(serviceId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${serviceId}/employees`);
  }

  /** Desativa um serviço. */
  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Ativa um serviço previamente desativado. */
  activate(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  /** Cria um novo serviço. */
  create(serviceData: ServiceInsert): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, serviceData);
  }

  /** Atualiza os dados de um serviço existente. */
  update(id: number, serviceData: ServiceUpdate): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, serviceData);
  }

  /** Envia um arquivo de imagem para um serviço específico. */
  uploadImage(serviceId: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<void>(`${this.apiUrl}/${serviceId}/image`, formData);
  }

}
