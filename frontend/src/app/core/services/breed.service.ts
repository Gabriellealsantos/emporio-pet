import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Breed } from '../../features/models/Breed';

/** Serviço para gerenciar as operações de API relacionadas a raças de animais. */
@Injectable({
  providedIn: 'root'
})
export class BreedService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/breeds`;

  /** Busca uma lista de raças, com filtros opcionais por nome e espécie. */
  findAll(filters: { name?: string, species?: string }): Observable<Breed[]> {
    let params = new HttpParams();

    // Adiciona o filtro de nome se ele for fornecido.
    if (filters.name) {
      params = params.set('name', filters.name);
    }

    // Adiciona o filtro de espécie se uma for selecionada.
    if (filters.species && filters.species !== 'all') {
      params = params.set('species', filters.species);
    }

    return this.http.get<Breed[]>(this.apiUrl, { params });
  }

  /** Retorna uma lista com todas as espécies de animais cadastradas. */
  getSpecies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/species`);
  }

  /** Cria uma nova raça de animal. */
  create(breedData: { name: string, species: string }): Observable<Breed> {
    return this.http.post<Breed>(this.apiUrl, breedData);
  }

  /** Atualiza os dados de uma raça existente. */
  update(id: number, breedData: { name: string, species: string }): Observable<Breed> {
    return this.http.put<Breed>(`${this.apiUrl}/${id}`, breedData);
  }

  /** Exclui uma raça de animal. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
