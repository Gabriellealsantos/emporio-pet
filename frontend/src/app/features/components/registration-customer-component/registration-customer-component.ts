import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { RegistrationService } from '../../../core/services/registration.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerInsert } from '../../models/CustomerInsert';
import { AuthService } from '../../../core/services/auth.service';
import { switchMap } from 'rxjs/operators';

/** Validador customizado para garantir que os campos de senha e confirmação coincidem. */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
};

/** Validador customizado para garantir que a data de nascimento não seja no futuro. */
export const pastOrPresentDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) { return null; }
  const selectedDate = new Date(control.value);
  selectedDate.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return selectedDate > today ? { futureDate: true } : null;
};

/** Define a estrutura tipada para o formulário de registro de cliente. */
interface RegistrationForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  phone: FormControl<string>;
  cpf: FormControl<string>;
  birthDate: FormControl<string>;
}

/** Componente da página de cadastro para novos clientes. */
@Component({
  selector: 'app-registration-customer-component',
  standalone: true,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    NgxMaskDirective,
    CommonModule
  ],
  templateUrl: './registration-customer-component.html',
  styleUrls: [
    './registration-customer-component.css',
    '../../../shared/styles/form-card.css'
  ],
})
export class RegistrationCustomerComponent {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // ===================================================================
  // FORMULÁRIO
  // ===================================================================
  /** Formulário reativo para os dados de cadastro do cliente. */
  protected form: FormGroup<RegistrationForm> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    cpf: ['', [Validators.required]],
    birthDate: ['', [Validators.required, pastOrPresentDateValidator]]
  }, {
    validators: passwordMatchValidator
  });

  // ===================================================================
  // MÉTODOS DE AÇÃO
  // ===================================================================

  /** Lida com a submissão do formulário, registrando o cliente e realizando o login automático. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const registrationData = this.form.getRawValue() as CustomerInsert;

    this.registrationService.register(registrationData).pipe(
      // Após o registro, realiza o login automaticamente com as credenciais fornecidas.
      switchMap(() => {
        const credentials = { email: registrationData.email, password: registrationData.password };
        return this.authService.login(credentials);
      })
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cadastro realizado com sucesso! Bem-vindo(a)!');
        this.router.navigate(['/onboarding']); // Redireciona para o onboarding para cadastrar o pet.
      },
      error: (err: HttpErrorResponse) => {
        // Trata erros de validação (422) retornados pelo backend.
        if (err.status === 422 && err.error?.errors) {
          err.error.errors.forEach((error: { fieldName: string; message: string; }) => {
            const formControl = this.form.get(error.fieldName as keyof RegistrationForm);
            if (formControl) {
              formControl.setErrors({ backendError: error.message });
            }
          });
        }
        // Trata erros de duplicidade (400) retornados pelo backend.
        else if (err.status === 400 && err.error?.message) {
          const errorMessage = err.error.message;
          let fieldToSetError: keyof RegistrationForm | null = null;

          if (errorMessage.toLowerCase().includes("email")) {
            fieldToSetError = 'email';
          } else if (errorMessage.toLowerCase().includes("cpf")) {
            fieldToSetError = 'cpf';
          } else if (errorMessage.toLowerCase().includes("telefone")) {
            fieldToSetError = 'phone';
          }

          if (fieldToSetError) {
            this.form.get(fieldToSetError)?.setErrors({ backendError: errorMessage });
          } else {
            this.notificationService.showError(errorMessage);
          }
        }
        // Trata erros genéricos.
        else {
          this.notificationService.showError('Ocorreu um erro inesperado. Tente novamente.');
        }
      }
    });
  }
}
