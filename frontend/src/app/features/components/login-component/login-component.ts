import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/User';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { AuthService } from '../../../core/services/auth.service';

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
      // CONDIÇÃO CORRIGIDA E FINAL
      if (!user.pets || user.pets.length === 0) {
        // Se o usuário não tem pets (lista nula, indefinida ou vazia),
        // redireciona para a tela de onboarding.
        this.router.navigate(['/onboarding']);
      } else {
        // Caso contrário, envia para o dashboard principal.
        this.router.navigate(['/dashboard']);
      }
    },
    error: (err) => {
      console.error('Erro no login:', err);
      this.hasLoginError = true;
      this.cdr.detectChanges();
    }
  });
}}
