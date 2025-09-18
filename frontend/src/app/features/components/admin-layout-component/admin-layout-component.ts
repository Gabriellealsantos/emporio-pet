import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faBell,
  faCalendarAlt,
  faCashRegister,
  faChartPie,
  faCut,
  faFileInvoiceDollar,
  faIdBadge,
  faPaw,
  faSignOutAlt,
  faUser,
  faUserCircle,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './admin-layout-component.html',
  styleUrls: ['./admin-layout-component.css'],
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = signal(false);
  private authService = inject(AuthService);
  currentUser = signal<User | null>(null);
  isDropdownOpen = signal(false);

  faBars = faBars;
  faPaw = faPaw;
  faChartPie = faChartPie;
  faBell = faBell;
  faUser = faUser;
  faCalendarAlt = faCalendarAlt;
  faCut = faCut;
  faUsers = faUsers;
  faIdBadge = faIdBadge;
  faUserCircle = faUserCircle;
  faSignOutAlt = faSignOutAlt;
  faCashRegister = faCashRegister;
  faFileInvoiceDollar = faFileInvoiceDollar;

  pageTitle = signal('Carregando...');
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    // Função para extrair o título da rota ativa
    const getTitleFromRoute = () => {
      let child = this.activatedRoute.firstChild;
      while (child?.firstChild) {
        child = child.firstChild;
      }
      this.authService.getCurrentUser().subscribe((user) => {
        this.currentUser.set(user);
      });
      return child?.snapshot.data['title'] || '';
    };

    // 1. Define o título inicial assim que o componente carrega
    const initialTitle = getTitleFromRoute();
    if (initialTitle) {
      this.pageTitle.set(initialTitle);
    }

    // 2. Continua ouvindo por mudanças de rota para o futuro
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const title = getTitleFromRoute();
      if (title) {
        this.pageTitle.set(title);
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser()?.roles?.some(r => r.authority === 'ROLE_ADMIN') ?? false;
  }

  isCashier(): boolean {
    const isEmployee = this.currentUser()?.roles?.some(r => r.authority === 'ROLE_EMPLOYEE') ?? false;
    const jobTitle = this.currentUser()?.jobTitle?.toLowerCase() ?? '';
    return isEmployee && jobTitle === 'caixa' && !this.isAdmin();
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
