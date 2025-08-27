import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PetInsertDTO } from '../../features/models/PetInsertDTO';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BASE_URL}/pets`;

  registerPet(petData: PetInsertDTO): Observable<any> {
    return this.http.post(this.apiUrl, petData);
  }
}
