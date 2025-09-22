import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Service } from '../../features/models/Service';
import { ServiceInsert } from '../../features/models/ServiceInsert';
import { ServiceUpdate } from '../../features/models/ServiceUpdate';
import { User } from '../../features/models/User';

export interface ServiceFilters {
  name?: string;
  active?: boolean | null;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/services`;

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

  findAllActiveServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  findQualifiedEmployees(serviceId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${serviceId}/employees`);
  }

   deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activate(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  create(serviceData: ServiceInsert): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, serviceData);
  }

  update(id: number, serviceData: ServiceUpdate): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, serviceData);
  }

   uploadImage(serviceId: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<void>(`${this.apiUrl}/${serviceId}/image`, formData);
  }

}
