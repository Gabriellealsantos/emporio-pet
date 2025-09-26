import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PetInsertDTO } from '../../features/models/PetInsertDTO';
import { Pet } from '../../features/models/Pet';

/** Serviço para gerenciar as operações de API relacionadas a pets. */
@Injectable({
  providedIn: 'root',
})
export class PetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/pets`;

  /** Busca a lista de pets associados ao cliente logado. */
  findMyPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiUrl);
  }

  /** Cria um novo pet para o cliente logado. */
  registerPet(petData: PetInsertDTO): Observable<Pet> {
    return this.http.post<Pet>(this.apiUrl, petData);
  }

  /** Atualiza os dados de um pet existente. */
  update(id: number, petData: Partial<PetInsertDTO>): Observable<Pet> {
    return this.http.put<Pet>(`${this.apiUrl}/${id}`, petData);
  }

  /** Desativa (soft delete) um pet. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Cria um novo pet através de um endpoint administrativo. */
  adminCreate(petData: any): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/admin`, petData);
  }
}
