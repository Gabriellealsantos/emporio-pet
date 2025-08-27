import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password-component',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './reset-password-component.html',
  styleUrls: ['../../../shared/styles/form-card.css']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  private token: string | null = null;
  protected apiError: string | null = null;

  protected form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: passwordMatchValidator
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
    });
  }

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
        console.error("Erro ao redefinir senha:", err);
        this.apiError = err.error?.message || "Token inválido ou expirado. Por favor, solicite um novo link.";
      }
    });
  }
}
