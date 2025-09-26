import { Component, OnInit, signal, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

/** Validador customizado para garantir que os campos de nova senha e confirmação coincidem. */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmNewPassword = control.get('confirmNewPassword');
  return newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value
    ? { passwordsMismatch: true }
    : null;
};

/** Componente de página para o usuário visualizar, editar seu perfil e alterar sua senha. */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe],
  templateUrl: './profile-page-component.html',
  styleUrls: ['./profile-page-component.css']
})
export class ProfileComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena os dados do usuário autenticado. */
  currentUser = signal<User | null>(null);
  /** Controla se o formulário de perfil está em modo de edição. */
  isEditing = signal(false);

  // ===================================================================
  // FORMULÁRIOS E ÍCONES
  // ===================================================================
  /** Formulário reativo para a edição dos dados do perfil do usuário. */
  profileForm!: FormGroup;
  /** Formulário reativo para a alteração de senha do usuário. */
  passwordForm!: FormGroup;
  /** Ícone para uso no template. */
  faPaw = faPaw;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA E INICIALIZAÇÃO
  // ===================================================================

  /** Inicializa o componente, buscando o usuário atual e inicializando os formulários. */
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.currentUser.set(user);
        this.initializeForms(user);
      }
    });
  }

  /** Cria e preenche os formulários de perfil e senha com os dados do usuário. */
  private initializeForms(user: User): void {
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

  // ===================================================================
  // MÉTODOS DE CONTROLE DA UI
  // ===================================================================

  /** Ativa o modo de edição do formulário de perfil. */
  enableEditMode(): void {
    this.isEditing.set(true);
    this.profileForm.patchValue(this.currentUser()!);
  }

  /** Cancela o modo de edição e descarta as alterações não salvas. */
  cancelEditMode(): void {
    this.isEditing.set(false);
  }

  // ===================================================================
  // MÉTODOS DE AÇÃO (SUBMISSÃO DE FORMULÁRIOS)
  // ===================================================================

  /** Lida com a submissão do formulário para salvar as alterações do perfil. */
  saveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    this.userService.updateMe(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.authService.updateCurrentUser(updatedUser);
        this.isEditing.set(false);
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
          this.notificationService.showError("Erro ao atualizar perfil. Tente novamente.");
        }
      }
    });
  }

  /** Lida com a submissão do formulário para alterar a senha do usuário. */
  changePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.notificationService.showSuccess("Senha alterada com sucesso!");
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 400) {
          const message = err.error?.message || 'Senha atual incorreta.';
          this.passwordForm.get('currentPassword')?.setErrors({ backendError: message });
          this.notificationService.showError(message);
        } else {
          this.notificationService.showError("Erro ao alterar senha. Tente novamente.");
        }
      }
    });
  }
}
