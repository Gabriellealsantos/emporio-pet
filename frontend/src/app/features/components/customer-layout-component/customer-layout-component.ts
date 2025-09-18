import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet, RouterLink, RouterModule } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUserCircle, faSignOutAlt, faPaw } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FaIconComponent, RouterModule],
  templateUrl: './customer-layout-component.html',
  styleUrls: ['./customer-layout-component.css']
})
export class CustomerLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);

  currentUser = signal<User | null>(null);
  isDropdownOpen = signal(false);

  // Ícones
  faUserCircle = faUserCircle;
  faSignOutAlt = faSignOutAlt;
  faPaw = faPaw;

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.currentUser.set(data['user']);
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  logout(): void {
    this.authService.logout();
  }
}
