import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { RegistrationService } from '../../services/registration.service';
import { NgxMaskDirective } from 'ngx-mask';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CustomerInsert } from '../../models/CustomerInsert';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

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
    '../../../../shared/styles/auth-forms.css'
  ],
})
export class RegistrationCustomerComponent {

  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

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
      this.notificationService.showSuccess('Cadastro realizado com sucesso!');
      this.form.markAllAsTouched();
      return;
    }

    this.registrationService.register(this.form.getRawValue() as CustomerInsert).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cadastro realizado com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no registro:', err);

        // Trata erros de validação de campo (status 422)
        if (err.status === 422) {
          const backendErrors = err.error.errors;
          backendErrors.forEach((error: any) => {
            const formControl = this.form.get(error.fieldName as keyof RegistrationForm);
            if (formControl) {
              formControl.setErrors({ backendError: error.message });
            }
          });
        }
        // Trata erros de negócio (status 400)
        else if (err.status === 400) {
          const errorMessage = err.error.message;
          let fieldToSetError: keyof RegistrationForm | null = null;

          if (errorMessage.toLowerCase().includes("email")) {
            fieldToSetError = 'email';
          }
          else if (errorMessage.toLowerCase().includes("cpf")) {
            fieldToSetError = 'cpf';
          }
          // 👇 ADICIONE ESTA VERIFICAÇÃO PARA O TELEFONE 👇
          else if (errorMessage.toLowerCase().includes("telefone")) {
            fieldToSetError = 'phone';
          }

          if (fieldToSetError) {
            const formControl = this.form.get(fieldToSetError);
            if (formControl) {
              formControl.setErrors({ backendError: errorMessage });
            }
          }
        }
      }
    });
  }
}
