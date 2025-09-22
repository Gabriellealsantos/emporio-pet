import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../../features/models/User';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);

  currentUser$ = this.authService.getCurrentUser();

  getDashboardLink(user: User): string[] {
    if (user.roles.some(r => r.authority === 'ROLE_ADMIN')) {
      return ['/admin/dashboard'];
    }
    if (user.roles.some(r => r.authority === 'ROLE_EMPLOYEE')) {
      return ['/employee/dashboard'];
    }
    return ['/customer/dashboard'];
  }
}
