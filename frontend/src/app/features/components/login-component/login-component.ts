import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { User } from '../../models/User';

/** Componente da página de login, responsável pela autenticação do usuário. */
@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login-component.html',
  styleUrls: [
    './login-component.css',
    '../../../shared/styles/form-card.css'
  ],
})
export class LoginComponent {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // ===================================================================
  // ESTADO DO COMPONENTE E FORMULÁRIO
  // ===================================================================
  /** Controla a exibição da mensagem de erro de login. */
  protected loginErrorMessage: string | null = null;
  /** Formulário reativo para a inserção de credenciais (e-mail e senha). */
  protected form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  // ===================================================================
  // MÉTODOS DE AÇÃO
  // ===================================================================

  /** Lida com a submissão do formulário de login e o redirecionamento pós-sucesso. */
  onSubmit(): void {
    this.loginErrorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.login(this.form.value).subscribe({
      next: (user: User) => {
        const isAdmin = user.roles?.some(r => r.authority === 'ROLE_ADMIN');
        const isEmployee = user.roles?.some(r => r.authority === 'ROLE_EMPLOYEE');

        // 1. Redireciona administradores para o dashboard principal.
        if (isAdmin) {
          this.router.navigate(['/admin/dashboard']);
          return;
        }

        // 2. Redireciona funcionários com base em seu cargo.
        if (isEmployee) {
          if (user.jobTitle?.toLowerCase() === 'caixa') {
            this.router.navigate(['/admin/caixa']); // Caixa vai para a tela de faturamento.
            return;
          }
          this.router.navigate(['/employee/dashboard']); // Outros funcionários para seu dashboard.
          return;
        }

        // 3. Redireciona novos clientes para o onboarding para cadastrar um pet.
        if (!user.pets || user.pets.length === 0) {
          this.router.navigate(['/onboarding']);
          return;
        }

        // 4. Redireciona clientes existentes para seu dashboard.
        this.router.navigate(['/customer/dashboard']);
      },
       error: (err) => {
        console.error('Erro no login:', err);
        if (err.error && err.error.message) {
          this.loginErrorMessage = err.error.message;
        } else {
          this.loginErrorMessage = 'Email ou senha inválidos.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
