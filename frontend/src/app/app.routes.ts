import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { employeeGuard } from './core/guards/employee.guard';
import { customerGuard } from './core/guards/customer.guard';
import { userResolver } from './core/resolvers/user.resolver';
import { AdminLayoutComponent } from './features/components/admin-layout-component/admin-layout-component';
import { EmployeeLayoutComponent } from './features/components/employee-layout-component/employee-layout-component';
import { CustomerLayoutComponent } from './features/components/customer-layout-component/customer-layout-component';
import { DashboardComponent } from './features/components/dashboard-component/dashboard-component';
import { BreedsPageComponent } from './features/components/breeds-component/breeds-component';
import { ErrorPageComponent } from './features/components/error-page-component/error-page-component';
import { ClientPageComponent } from './features/components/client-page-component/client-page-component';
import { EmployeeListComponent } from './features/components/employee-list-component/employee-list-component';
import { ServicesPageComponent } from './features/components/services-page-component/services-page-component';
import { AppointmentsPageComponent } from './features/components/appointments-page-component/appointments-page-component';
import { EmployeeDashboardComponent } from './features/components/employee-dashboard-component/employee-dashboard-component';
import { EmployeeHistoryPageComponent } from './features/components/employee-history-page-component/employee-history-page-component';
import { CustomerDashboardComponent } from './features/components/customer-dashboard-component/customer-dashboard-component';
import { CustomerPetListComponent } from './features/components/customer-pet-list-component/customer-pet-list-component';
import { CustomerAppointmentHistoryComponent } from './features/components/customer-appointment-history-component/customer-appointment-history-component';

export const routes: Routes = [
  // --- ROTAS PÚBLICAS ---
  {
    path: 'login',
    loadComponent: () => import('./features/components/login-component/login-component').then(m => m.LoginComponent),
  },
  {
    path: 'cadastrar',
    loadComponent: () => import('./features/components/registration-customer-component/registration-customer-component').then(m => m.RegistrationCustomerComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./features/components/home-page-component/home-page-component').then(m => m.HomePageComponent),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () => import('./features/components/forgot-password-component/forgot-password-component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () => import('./features/components/reset-password-component/reset-password-component').then(m => m.ResetPasswordComponent),
  },

  // --- ÁREA DO CLIENTE (LOGADO) ---
  {
    path: 'customer', // Caminho base para o cliente
    component: CustomerLayoutComponent,
    canActivate: [authGuard, customerGuard],
    resolve: { user: userResolver },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent, data: { title: 'Minha Área' } },
      { path: 'agendar', loadComponent: () => import('./features/components/schedule-appointment-page-component/schedule-appointment-page-component').then(m => m.ScheduleAppointmentPageComponent), data: { title: 'Agendar Serviço' } },
      { path: 'onboarding', loadComponent: () => import('./features/components/onboarding-component/onboarding-component').then(m => m.OnboardingComponent), data: { title: 'Primeiros Passos' } },
      { path: 'pets/cadastrar', loadComponent: () => import('./features/components/pet-registration-component/pet-registration-component').then(m => m.PetRegistrationComponent), data: { title: 'Cadastrar Pet' } },
      { path: 'perfil', loadComponent: () => import('./features/components/profile-page-component/profile-page-component').then(m => m.ProfileComponent), data: { title: 'Meu Perfil' } },
      { path: 'meus-pets', component: CustomerPetListComponent, data: { title: 'Meus Pets' } },
      { path: 'historico', component: CustomerAppointmentHistoryComponent, data: { title: 'Histórico de Agendamentos' } },

      { path: 'perfil', loadComponent: () => import('./features/components/profile-page-component/profile-page-component').then(m => m.ProfileComponent), data: { title: 'Meu Perfil' } }
    ]
  },

  // --- ÁREA DO ADMIN ---
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    resolve: { user: userResolver },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'caixa', loadComponent: () => import('./features/components/invoicing-page-component/invoicing-page-component').then(m => m.InvoicingPageComponent), data: { title: 'Caixa' } },
      { path: 'faturas', loadComponent: () => import('./features/components/invoice-list-page-component/invoice-list-page-component').then(m => m.InvoiceListPageComponent), data: { title: 'Gerenciamento de Faturas' } },
      { path: 'agendamentos', component: AppointmentsPageComponent, data: { title: 'Gerenciamento de Agendamentos' } },
      { path: 'servicos', component: ServicesPageComponent, data: { title: 'Gerenciamento de Serviços' } },
      { path: 'racas', component: BreedsPageComponent, data: { title: 'Gerenciamento de Raças' } },
      { path: 'clientes', component: ClientPageComponent, data: { title: 'Gerenciamento de Clientes' } },
      { path: 'funcionarios', component: EmployeeListComponent, data: { title: 'Gerenciamento de Funcionários' } },
      { path: 'perfil', loadComponent: () => import('./features/components/profile-page-component/profile-page-component').then(m => m.ProfileComponent), data: { title: 'Meu Perfil' } },
      { path: 'clientes/:id', loadComponent: () => import('./features/components/client-detail-component/client-detail-component').then(m => m.ClientDetailComponent), data: { title: 'Detalhes do Cliente' } },
      { path: 'funcionarios/:id', loadComponent: () => import('./features/components/employee-detail-component/employee-detail-component').then(m => m.EmployeeDetailComponent), data: { title: 'Detalhes do Funcionário' } },
    ]
  },

  // --- ÁREA DO FUNCIONÁRIO ---
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    canActivate: [authGuard, employeeGuard],
    resolve: { user: userResolver },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmployeeDashboardComponent, data: { title: 'Minha Agenda do Dia' } },
      { path: 'historico', component: EmployeeHistoryPageComponent, data: { title: 'Meu Histórico de Serviços' } },
    ]
  },

  // --- ROTAS DE FALLBACK ---
  { path: 'error', component: ErrorPageComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
