import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { User } from '../../models/User';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    ButtonComponent,
    ReactiveFormsModule
  ],
  templateUrl: './login-component.html',
  styleUrls: [
    './login-component.css',
    '../../../shared/styles/form-card.css'
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  protected hasLoginError = false;

  protected form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });


  onSubmit(): void {
    this.hasLoginError = false;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.login(this.form.value).subscribe({
      next: (user: User) => {
        // Verificações hierárquicas
        const isAdmin = user.roles?.some(r => r.authority === 'ROLE_ADMIN');
        const isEmployee = user.roles?.some(r => r.authority === 'ROLE_EMPLOYEE');

        // 1. Se for ADMIN, vai para o dashboard de admin.
        if (isAdmin) {
          this.router.navigate(['/admin/dashboard']);
          return;
        }

        // 2. Se for FUNCIONÁRIO, verificamos o cargo.
        if (isEmployee) {
          // Se o cargo for 'Caixa', vai direto para a tela de faturamento.
          if (user.jobTitle?.toLowerCase() === 'caixa') {
            this.router.navigate(['/admin/caixa']); // Reutilizamos a rota dentro do layout admin
            return;
          }
          // Outros funcionários irão para sua própria dashboard (que ainda vamos criar).
          this.router.navigate(['/employee/dashboard']);
          return;
        }

        // 3. Se for CLIENTE, verificamos se tem pets.
        if (!user.pets || user.pets.length === 0) {
          this.router.navigate(['/onboarding']);
          return;
        }

        // 4. Se for Cliente com pets, vai para a dashboard de cliente.
        this.router.navigate(['/customer/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.hasLoginError = true;
        this.cdr.detectChanges();
      }
    });
  }
}
