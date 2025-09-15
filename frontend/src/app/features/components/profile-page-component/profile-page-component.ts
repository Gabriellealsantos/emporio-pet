import { Component, OnInit, signal, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmNewPassword = control.get('confirmNewPassword');
  return newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value
    ? { passwordsMismatch: true }
    : null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe],
  templateUrl: './profile-page-component.html',
  styleUrls: ['./profile-page-component.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  currentUser = signal<User | null>(null);
  isEditing = signal(false);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  faPaw = faPaw;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.currentUser.set(user);
        this.initializeForms(user);
      }
    });
  }

  initializeForms(user: User): void {
    this.profileForm = this.fb.group({
      name: [user.name, Validators.required],
      phone: [user.phone, Validators.required],
      birthDate: [user.birthDate, Validators.required],
      cpf: [user.cpf ?? null],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  enableEditMode(): void {
    this.isEditing.set(true);
    this.profileForm.patchValue(this.currentUser()!);
  }

  cancelEditMode(): void {
    this.isEditing.set(false);
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    this.userService.updateMe(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.authService.updateCurrentUser(updatedUser);
        this.isEditing.set(false);
        // 3. Notificação de sucesso
        this.notificationService.showSuccess("Perfil atualizado com sucesso!");
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 422 && err.error?.errors) {
          err.error.errors.forEach((validationError: { fieldName: string; message: string; }) => {
            const formControl = this.profileForm.get(validationError.fieldName);
            if (formControl) {
              formControl.setErrors({ backendError: validationError.message });
            }
          });
        } else {
          // 4. Notificação de erro genérico
          this.notificationService.showError("Erro ao atualizar perfil. Tente novamente.");
          console.error("Erro ao atualizar perfil", err);
        }
      }
    });
  }

  changePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.passwordForm.reset();
        // 5. Notificação de sucesso
        this.notificationService.showSuccess("Senha alterada com sucesso!");
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 400) {
          const message = err.error?.message || 'Senha atual incorreta.';
          this.passwordForm.get('currentPassword')?.setErrors({ backendError: message });
          this.notificationService.showError(message);
        } else {
          // 6. Notificação de erro genérico
          this.notificationService.showError("Erro ao alterar senha. Tente novamente.");
          console.error("Erro ao alterar senha", err);
        }
      }
    });
  }
}
