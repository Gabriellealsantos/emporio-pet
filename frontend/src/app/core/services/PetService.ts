import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PetInsertDTO } from '../../features/models/PetInsertDTO';
import { Pet } from '../../features/models/Pet';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/pets`;

  /**
   * Busca a lista de pets do cliente logado.
   * Chama o endpoint GET /pets
   */
  findMyPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiUrl);
  }

  /**
   * Cria um novo pet para o cliente logado.
   * Chama o endpoint POST /pets
   */
  registerPet(petData: PetInsertDTO): Observable<Pet> {
    return this.http.post<Pet>(this.apiUrl, petData);
  }

  /**
   * Atualiza os dados de um pet existente.
   * Chama o endpoint PUT /pets/{id}
   */
  update(id: number, petData: Partial<PetInsertDTO>): Observable<Pet> {
    return this.http.put<Pet>(`${this.apiUrl}/${id}`, petData);
  }

  /**
   * Desativa (soft delete) um pet.
   * Chama o endpoint DELETE /pets/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  adminCreate(petData: any): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/admin`, petData);
  }
}
