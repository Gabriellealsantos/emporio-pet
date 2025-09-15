import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceCreateDTO } from '../../features/models/InvoiceCreateDTO';
import { Invoice } from '../../features/models/Invoice';

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/invoices`;

  findById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  findFiltered(filters: any, page: number): Observable<Page<Invoice>> {
     let params = new HttpParams()
       .set('page', page.toString())
       .set('size', '10');

     Object.keys(filters).forEach(key => {
       const value = filters[key];
       if (value) { // Garante que não adicionamos params vazios
         if (key === 'maxDate') {
           // AJUSTE CRUCIAL: Pega a data e a define para o final do dia
           const endDate = new Date(value);
           endDate.setHours(23, 59, 59, 999);
           params = params.set(key, endDate.toISOString());
         } else if (key === 'minDate') {
           const startDate = new Date(value);
           params = params.set(key, startDate.toISOString());
         } else {
           params = params.set(key, value);
         }
       }
     });

     return this.http.get<Page<Invoice>>(this.apiUrl, { params });
   }

  create(dto: InvoiceCreateDTO): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, dto);
  }

  markAsPaid(invoiceId: number): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${invoiceId}/pay`, {});
  }
}
