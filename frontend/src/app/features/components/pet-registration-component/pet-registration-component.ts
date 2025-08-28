import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { NotificationService } from '../../../core/services/notification.service';
import { PetService } from '../../../core/services/PetService';
import { PetInsertDTO } from '../../models/PetInsertDTO';
import { BreedService } from '../../../core/services/breed-service';
import { Observable } from 'rxjs';
import { Breed } from '../../models/Breed';

export const pastOrPresentDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) { return null; }
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate > today ? { futureDate: true } : null;
};

interface PetRegistrationForm {
  name: FormControl<string>;
  species: FormControl<string>;
  breedId: FormControl<number | null>;
  birthDate: FormControl<string>;
  notes: FormControl<string | null>;
}

@Component({
  selector: 'app-pet-registration',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, AsyncPipe],
  templateUrl: './pet-registration-component.html',
  styleUrls: ['../../../shared/styles/form-card.css', './pet-registration-component.css']
})
export class PetRegistrationComponent {

  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private breedService = inject(BreedService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);


  protected breeds$!: Observable<Breed[]>;

  protected form = this.fb.group({
    name: ['', [Validators.required]],
    species: ['', [Validators.required]],
    breedId: [null as number | null, [Validators.required]],
    birthDate: ['', [Validators.required, pastOrPresentDateValidator]],
    notes: ['']
  });

  ngOnInit(): void {
    this.breeds$ = this.breedService.findAll();
  }



  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.petService.registerPet(this.form.getRawValue() as PetInsertDTO).subscribe({
      next: () => {
        this.notificationService.showSuccess('Pet cadastrado com sucesso!');
        // Após cadastrar o pet, o usuário finalmente vai para a tela principal
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no cadastro do pet:', err);
        // Podemos adicionar um tratamento de erro mais específico do backend aqui se necessário
        this.notificationService.showError('Falha ao cadastrar o pet. Tente novamente.');
      }
    });
  }
}
