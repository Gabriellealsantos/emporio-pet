import { HttpClient, HttpParams } from '@angular/common/http';
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

  findAll(filters: { name?: string, species?: string }): Observable<Breed[]> {
    let params = new HttpParams();

    // Verifica se o nome não é nulo ou vazio
    if (filters.name) {
      params = params.set('name', filters.name);
    }

    // Verifica se a espécie foi selecionada e não é 'all'
    if (filters.species && filters.species !== 'all') {
      params = params.set('species', filters.species);
    }

    // A opção { params } é essencial aqui
    return this.http.get<Breed[]>(this.apiUrl, { params });
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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
