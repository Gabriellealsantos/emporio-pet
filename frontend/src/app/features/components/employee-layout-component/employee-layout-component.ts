import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars, faPaw, faCalendarAlt, faUserCircle, faSignOutAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './employee-layout-component.html',
  styleUrls: ['./employee-layout-component.css']
})
export class EmployeeLayoutComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // Controle de estado da UI
  isSidebarOpen = signal(false);
  isDropdownOpen = signal(false);
  pageTitle = signal('Carregando...');
  currentUser = signal<User | null>(null);

  // Ícones do menu
  faBars = faBars;
  faPaw = faPaw;
  faCalendarAlt = faCalendarAlt;
  faUserCircle = faUserCircle;
  faSignOutAlt = faSignOutAlt;
  faHistory = faHistory;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => this.currentUser.set(user));

    // Lógica para atualizar o título da página dinamicamente
    const getTitleFromRoute = () => {
      let child = this.activatedRoute.firstChild;
      while (child?.firstChild) {
        child = child.firstChild;
      }
      return child?.snapshot.data['title'] || '';
    };

    const initialTitle = getTitleFromRoute();
    if (initialTitle) {
      this.pageTitle.set(initialTitle);
    }

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const title = getTitleFromRoute();
      if (title) {
        this.pageTitle.set(title);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  logout(): void {
    this.authService.logout();
  }
}
