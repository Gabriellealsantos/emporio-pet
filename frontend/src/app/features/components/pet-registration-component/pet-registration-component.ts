import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { NotificationService } from '../../../core/services/notification.service';
import { PetService } from '../../../core/services/PetService';
import { PetInsertDTO } from '../../models/PetInsertDTO';

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
  breed: FormControl<string>;
  birthDate: FormControl<string>;
  notes: FormControl<string | null>;
}

@Component({
  selector: 'app-pet-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './pet-registration-component.html',
  styleUrls: ['../../../shared/styles/form-card.css',
    './pet-registration-component.css'
  ]
})
export class PetRegistrationComponent {

   protected breeds: string[] = [
    'Labrador',
    'Golden Retriever',
    'Poodle',
    'Bulldog',
    'Vira-lata (SRD)',
    'Siamês',
    'Persa'
  ];

  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  protected form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    species: ['', [Validators.required]],
    breed: ['', [Validators.required]],
    birthDate: ['', [Validators.required, pastOrPresentDateValidator]],
    notes: ['']
  });

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
