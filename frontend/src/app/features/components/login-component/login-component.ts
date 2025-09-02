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
        // 1 - A verificação de admin já existe aqui
        const isAdmin = user.roles?.some(r => r.authority === 'ROLE_ADMIN');

        if (isAdmin) {
          this.router.navigate(['/admin']); // E o redirecionamento também
          return;
        }

        // 2 - Se não tiver pets → vai para onboarding
        if (!user.pets || user.pets.length === 0) {
          this.router.navigate(['/onboarding']);
          return;
        }

        // 3 - Senão, dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.hasLoginError = true;
        this.cdr.detectChanges();
      }
    });
  }
}
