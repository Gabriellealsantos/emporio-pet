import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceCreateDTO } from '../../features/models/InvoiceCreateDTO';
import { Invoice } from '../../features/models/Invoice';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/invoices`;

  create(dto: InvoiceCreateDTO): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, dto);
  }

  markAsPaid(invoiceId: number): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${invoiceId}/pay`, {});
  }
}
