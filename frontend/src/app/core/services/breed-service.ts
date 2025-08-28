import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Breed } from '../../features/models/Breed';

@Injectable({
  providedIn: 'root'
})
export class BreedService {

  private http = inject(HttpClient);

  findAll(): Observable<Breed[]> {
    return this.http.get<Breed[]>(`${environment.BASE_URL}/breeds`);
  }
}
