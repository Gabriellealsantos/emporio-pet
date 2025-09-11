import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PetInsertDTO } from '../../features/models/PetInsertDTO';
import { Pet } from '../../features/models/Pet';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/pets`;

  registerPet(petData: PetInsertDTO): Observable<any> {
    return this.http.post(this.apiUrl, petData);
  }

   adminCreate(petData: any): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/admin`, petData);
  }


  update(id: number, petData: any): Observable<Pet> {
    return this.http.put<Pet>(`${this.apiUrl}/${id}`, petData);
  }
}
