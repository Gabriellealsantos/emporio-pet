import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './features/components/admin-layout-component/admin-layout-component';
import { DashboardComponent } from './features/components/dashboard-component/dashboard-component';
import { BreedsPageComponent } from './features/components/breeds-component/breeds-component';
import { ErrorPageComponent } from './features/components/error-page-component/error-page-component';
import { userResolver } from './core/resolvers/user.resolver';
import { ClientPageComponent } from './features/components/client-page-component/client-page-component';
import { EmployeeListComponent } from './features/components/employee-list-component/employee-list-component';
import { ServicesPageComponent } from './features/components/services-page-component/services-page-component';
import { AppointmentsPageComponent } from './features/components/appointments-page-component/appointments-page-component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/components/login-component/login-component').then((m) => m.LoginComponent),
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
      import('./features/components/forgot-password-component/forgot-password-component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./features/components/reset-password-component/reset-password-component').then(
        (m) => m.ResetPasswordComponent
      ),
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
    path: 'home',
    loadComponent: () =>
      import('./features/components/home-page-component/home-page-component').then(
        (m) => m.HomePageComponent
      ),
  },

  {
    path: 'admin',
    canActivate: [authGuard],
    resolve: {
      user: userResolver
    },
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'agendamentos',
        component: AppointmentsPageComponent,
        data: { title: 'Gerenciamento de Agendamentos' },
      },
      {
        path: 'servicos',
        component: ServicesPageComponent,
        data: { title: 'Gerenciamento de Serviços' },
      },
      {
        path: 'racas',
        component: BreedsPageComponent,
        data: { title: 'Gerenciamento de Raças' },
      },
      {
        path: 'clientes',
        component: ClientPageComponent,
        data: { title: 'Gerenciamento de Clientes' },
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./features/components/client-detail-component/client-detail-component').then(m => m.ClientDetailComponent),
        data: { title: 'Detalhes do Cliente' },
      },
      {
        path: 'funcionarios', // Rota da lista
        component: EmployeeListComponent,
        data: { title: 'Gerenciamento de Funcionários' },
      },
      {
        path: 'funcionarios/:id',
        loadComponent: () => import('./features/components/employee-detail-component/employee-detail-component').then(m => m.EmployeeDetailComponent),
        data: { title: 'Detalhes do Funcionário' },
      }
    ],
  },

  { path: 'error', component: ErrorPageComponent },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];
