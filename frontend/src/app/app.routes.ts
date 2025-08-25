import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login-component/login-component';
import { RegistrationCustomerComponent } from './features/auth/components/registration-customer-component/registration-customer-component';

export const routes: Routes = [

    { path: 'login', component: LoginComponent },
    { path: 'cadastrar', component: RegistrationCustomerComponent },


    // { path: '', redirectTo: '/home', pathMatch: 'full' },

];
