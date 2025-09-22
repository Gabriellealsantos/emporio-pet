import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../../features/models/Review';
import { ReviewInsertDTO } from '../../features/models/ReviewInsertDTO';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/reviews`;

  create(appointmentId: number, dto: ReviewInsertDTO): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/for-appointment/${appointmentId}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  findByService(serviceId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/by-service/${serviceId}`);
  }
}
