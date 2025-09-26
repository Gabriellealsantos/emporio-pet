import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

/** Validador customizado para garantir que os campos de nova senha e confirmação coincidem. */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
};

/** Componente de página para o fluxo de redefinição de senha. */
@Component({
  selector: 'app-reset-password-component',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CommonModule],
  templateUrl: './reset-password-component.html',
  styleUrls: ['../../../shared/styles/form-card.css']
})
export class ResetPasswordComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO COMPONENTE E FORMULÁRIO
  // ===================================================================
  /** Armazena o token de redefinição de senha obtido da URL. */
  private token: string | null = null;
  /** Armazena a mensagem de erro da API a ser exibida na tela. */
  protected apiError: string | null = null;
  /** Formulário reativo para a inserção da nova senha. */
  protected form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: passwordMatchValidator
  });

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, extraindo o token de redefinição dos parâmetros da URL. */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
    });
  }

  // ===================================================================
  // MÉTODOS DE AÇÃO
  // ===================================================================

  /** Lida com a submissão do formulário para redefinir a senha do usuário. */
  onSubmit(): void {
    this.apiError = null;
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    const newPassword = this.form.value.newPassword ?? '';
    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.apiError = err.error?.message || "Token inválido ou expirado. Por favor, solicite um novo link.";
      }
    });
  }
}
