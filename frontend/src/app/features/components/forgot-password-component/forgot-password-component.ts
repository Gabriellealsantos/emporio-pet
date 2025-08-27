import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-forgot-password-component',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['../../../shared/styles/form-card.css']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Variável para guardar a mensagem de sucesso
  protected successMessage: string | null = null;

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email ?? '';
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        // Guarda a mensagem do backend para exibir no HTML
        this.successMessage = response.message;
        this.form.reset(); // Limpa o formulário
      },
      error: (err) => {
        // Mesmo em caso de erro, a política é mostrar a mesma mensagem
        // para não revelar quais emails existem ou não na base.
        this.successMessage = "Caso o e-mail exista em nossa base de dados, um link de recuperação foi enviado.";
        console.error("Erro ao solicitar recuperação:", err);
      }
    });
  }
}
