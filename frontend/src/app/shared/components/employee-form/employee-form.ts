import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgxMaskDirective } from 'ngx-mask';

export function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return { futureDate: true };
    }
    return null;
  };
}

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent, NgxMaskDirective],
  templateUrl: './employee-form.html',
  styleUrls: ['../pet-form/pet-form.css']
})
export class EmployeeFormComponent {
  private fb = inject(FormBuilder);

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  employeeForm: FormGroup;
  faTimes = faTimes;

  constructor() {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      // --- CORREÇÃO AQUI ---
      // Os validadores devem estar dentro de um único array
      birthDate: ['', [Validators.required, noFutureDateValidator()]],
      jobTitle: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  onSave(): void {
    if (this.employeeForm.valid) {
      const { confirmPassword, ...formData } = this.employeeForm.value;
      this.save.emit(formData);
    } else {
      // Bónus: Isto garante que, se o formulário for submetido inválido,
      // todas as mensagens de erro aparecem.
      this.employeeForm.markAllAsTouched();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
