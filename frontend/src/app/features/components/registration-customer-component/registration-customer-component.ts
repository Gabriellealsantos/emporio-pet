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

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
};

export const pastOrPresentDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) { return null; }
  const selectedDate = new Date(control.value);
  selectedDate.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return selectedDate > today ? { futureDate: true } : null;
};

interface RegistrationForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  phone: FormControl<string>;
  cpf: FormControl<string>;
  birthDate: FormControl<string>;
}

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

  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const registrationData = this.form.getRawValue() as CustomerInsert;

    this.registrationService.register(registrationData).pipe(
      switchMap(() => {
        const credentials = { email: registrationData.email, password: registrationData.password };
        return this.authService.login(credentials);
      })
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cadastro realizado com sucesso! Bem-vindo(a)!');
        this.router.navigate(['/customer/pets/cadastrar']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no registro:', err);
        if (err.status === 422) {
          const backendErrors = err.error.errors;
          backendErrors.forEach((error: any) => {
            const formControl = this.form.get(error.fieldName as keyof RegistrationForm);
            if (formControl) {
              formControl.setErrors({ backendError: error.message });
            }
          });
        }
        else if (err.status === 400) {
          const errorMessage = err.error.message;
          let fieldToSetError: keyof RegistrationForm | null = null;

          if (errorMessage.toLowerCase().includes("email")) {
            fieldToSetError = 'email';
          }
          else if (errorMessage.toLowerCase().includes("cpf")) {
            fieldToSetError = 'cpf';
          }
          else if (errorMessage.toLowerCase().includes("telefone")) {
            fieldToSetError = 'phone';
          }

          if (fieldToSetError) {
            const formControl = this.form.get(fieldToSetError);
            if (formControl) {
              formControl.setErrors({ backendError: errorMessage });
            }
          } else {
            this.notificationService.showError(errorMessage || 'Ocorreu um erro no cadastro.');
          }
        } else {
           this.notificationService.showError('Ocorreu um erro inesperado. Tente novamente.');
        }
      }
    });
  }
}
