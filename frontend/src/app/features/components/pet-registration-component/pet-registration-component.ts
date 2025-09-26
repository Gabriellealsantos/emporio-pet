import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BreedService } from '../../../core/services/breed.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PetService } from '../../../core/services/PetService';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { Breed } from '../../models/Breed';
import { PetInsertDTO } from '../../models/PetInsertDTO';
import { AuthService } from '../../../core/services/auth.service';

/** Validador customizado para garantir que a data de nascimento não seja no futuro. */
export const pastOrPresentDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) { return null; }
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate > today ? { futureDate: true } : null;
};

/** Define a estrutura tipada para o formulário de registro de pet. */
interface PetRegistrationForm {
  name: FormControl<string>;
  species: FormControl<string>;
  breedId: FormControl<number | null>;
  birthDate: FormControl<string>;
  notes: FormControl<string | null>;
}

/** Componente de página para o formulário de cadastro de um novo pet. */
@Component({
  selector: 'app-pet-registration',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, AsyncPipe],
  templateUrl: './pet-registration-component.html',
  styleUrls: ['../../../shared/styles/form-card.css', './pet-registration-component.css']
})
export class PetRegistrationComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private breedService = inject(BreedService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // ===================================================================
  // PROPRIEDADES DO COMPONENTE
  // ===================================================================
  /** Observable que armazena a lista de raças para o dropdown. */
  protected breeds$!: Observable<Breed[]>;
  /** Formulário reativo para os dados de cadastro do pet. */
  protected form = this.fb.group({
    name: ['', [Validators.required]],
    species: ['', [Validators.required]],
    breedId: [null as number | null, [Validators.required]],
    birthDate: ['', [Validators.required, pastOrPresentDateValidator]],
    notes: ['']
  });

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, carregando a lista de todas as raças. */
  ngOnInit(): void {
    this.breeds$ = this.breedService.findAll({ name: '', species: '' });
  }

  // ===================================================================
  // MÉTODOS DE AÇÃO
  // ===================================================================

  /** Lida com a submissão do formulário de cadastro do pet. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.petService.registerPet(this.form.getRawValue() as PetInsertDTO).subscribe({
      next: () => {
        this.notificationService.showSuccess('Pet cadastrado com sucesso!');
        // Atualiza os dados do usuário para refletir o novo pet antes de navegar.
        this.authService.getMe().subscribe(() => {
          this.router.navigate(['/customer/dashboard']);
        });
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError('Falha ao cadastrar o pet. Tente novamente.');
      }
    });
  }
}
