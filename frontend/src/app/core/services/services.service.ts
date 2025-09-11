import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Service } from '../../features/models/Service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/services`;

  findAllActiveServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

}
