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
  private apiUrl = `${environment.BASE_URL}/breeds`;

  findAll(): Observable<Breed[]> {
    return this.http.get<Breed[]>(this.apiUrl);
  }

  getSpecies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/species`);
  }

  create(breedData: { name: string, species: string }): Observable<Breed> {
    return this.http.post<Breed>(this.apiUrl, breedData);
  }

  update(id: number, breedData: { name: string, species: string }): Observable<Breed> {
    return this.http.put<Breed>(`${this.apiUrl}/${id}`, breedData);
  }



}
