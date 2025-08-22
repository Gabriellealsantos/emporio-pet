import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CustomerInsert } from '../models/CustomerInsert';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  private readonly apiUrl = `${environment.BASE_URL}/customers`;

  constructor(private http: HttpClient) { }
  register(customerData: CustomerInsert): Observable<any> {
    return this.http.post<any>(this.apiUrl, customerData);
  }
}
