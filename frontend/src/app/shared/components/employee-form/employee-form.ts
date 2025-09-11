import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// Validador customizado para checar se as senhas são iguais
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent],
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
      birthDate: ['', Validators.required],
      jobTitle: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  onSave(): void {
    if (this.employeeForm.valid) {

      const { confirmPassword, ...formData } = this.employeeForm.value;
      this.save.emit(formData);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
