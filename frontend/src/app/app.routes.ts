import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/components/login-component/login-component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'cadastrar',
    loadComponent: () =>
      import(
        './features/components/registration-customer-component/registration-customer-component'
      ).then((m) => m.RegistrationCustomerComponent),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import(
        './features/components/forgot-password-component/forgot-password-component'
      ).then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import(
        './features/components/reset-password-component/reset-password-component'
      ).then((m) => m.ResetPasswordComponent),
  },

  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/components/onboarding-component/onboarding-component').then(
        (m) => m.OnboardingComponent
      ),
  },

  {
    path: 'pets/cadastrar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/components/pet-registration-component/pet-registration-component').then(
        (m) => m.PetRegistrationComponent
      ),
  },

   {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/components/dashboard-component/dashboard-component').then(
        (m) => m.DashboardComponent
      ),
  },

  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: '/',
  },
];
