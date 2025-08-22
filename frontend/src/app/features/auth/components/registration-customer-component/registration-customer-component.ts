import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { RegistrationService } from '../../services/registration.service';
import { NgxMaskDirective } from 'ngx-mask';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CustomerInsert } from '../../models/CustomerInsert';
import { Router } from '@angular/router';

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
  styleUrl: './registration-customer-component.css'
})
export class RegistrationCustomerComponent {

  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);
  private router = inject(Router);

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

    this.registrationService.register(this.form.getRawValue() as CustomerInsert).subscribe({
      next: (response) => {
        console.log('Registro bem-sucedido!', response);
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no registro:', err);

        // TIPO 1: Trata erros de validação de campo (ex: nome em branco, email inválido)
        if (err.status === 422) {
          const backendErrors = err.error.errors; // O array de erros detalhado
          backendErrors.forEach((error: any) => {
            // O seu handler Java usa a propriedade "field"
            const formControl = this.form.get(error.field as keyof RegistrationForm);
            if (formControl) {
              formControl.setErrors({ backendError: error.message });
            }
          });
        }
        // TIPO 2: Trata erros de negócio (ex: email/CPF duplicado)
        else if (err.status === 400) {
          const errorMessage = err.error.message;
          let fieldToSetError: keyof RegistrationForm | null = null;

          if (errorMessage.toLowerCase().includes("email")) {
            fieldToSetError = 'email';
          } else if (errorMessage.toLowerCase().includes("cpf")) {
            fieldToSetError = 'cpf';
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
