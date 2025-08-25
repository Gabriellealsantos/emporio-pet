import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login-component/login-component';
import { RegistrationCustomerComponent } from './features/auth/components/registration-customer-component/registration-customer-component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password-component/forgot-password-component';
import { ResetPasswordComponent } from './features/auth/components/reset-password-component/reset-password-component';

export const routes: Routes = [

    { path: 'login', component: LoginComponent },
    { path: 'cadastrar', component: RegistrationCustomerComponent },
    { path: 'recuperar-senha', component: ForgotPasswordComponent },
    { path: 'redefinir-senha', component: ResetPasswordComponent },

];
