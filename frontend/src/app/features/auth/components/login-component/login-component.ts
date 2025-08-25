import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';
import { AuthService } from '../../../../core/services/auth.service';

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
    '../../../../shared/styles/auth-forms.css'
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

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
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.hasLoginError = true;
      }
    });
  }
}
