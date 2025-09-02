import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './features/components/admin-layout-component/admin-layout-component';
import { DashboardComponent } from './features/components/dashboard-component/dashboard-component';
import { BreedsPageComponent } from './features/components/breeds-component/breeds-component';
import { ErrorPageComponent } from './features/components/error-page-component/error-page-component';

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
    path: 'admin',
    canActivate: [authGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: 'racas',
        component: BreedsPageComponent,
        data: { title: 'Gerenciamento de Raças' }
      },

    ]
  },

  { path: 'error', component: ErrorPageComponent },

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
