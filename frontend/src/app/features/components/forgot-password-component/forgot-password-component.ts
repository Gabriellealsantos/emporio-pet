import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { AuthService } from '../../../core/services/auth.service';

/** Componente de página para o fluxo de "Esqueci minha senha". */
@Component({
  selector: 'app-forgot-password-component',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['../../../shared/styles/form-card.css']
})
export class ForgotPasswordComponent {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // ===================================================================
  // ESTADO DO COMPONENTE E FORMULÁRIO
  // ===================================================================
  /** Armazena a mensagem de sucesso a ser exibida na tela após a submissão. */
  protected successMessage: string | null = null;
  /** Formulário reativo para a inserção do e-mail de recuperação. */
  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // ===================================================================
  // MÉTODOS DE AÇÃO
  // ===================================================================

  /** Lida com a submissão do formulário de recuperação de senha. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email ?? '';
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.form.reset();
      },
      error: (err) => {
        // Por segurança, exibe a mesma mensagem de sucesso em caso de erro
        // para não revelar se um e-mail está ou não cadastrado no sistema.
        this.successMessage = "Caso o e-mail exista em nossa base de dados, um link de recuperação foi enviado.";
        console.error("Erro ao solicitar recuperação:", err);
      }
    });
  }
}
