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

/** Componente que define a estrutura principal do layout da área administrativa. */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './admin-layout-component.html',
  styleUrls: ['./admin-layout-component.css'],
})
export class AdminLayoutComponent implements OnInit {
  /** Controla a visibilidade da barra lateral (sidebar). */
  isSidebarOpen = signal(false);
  /** Armazena os dados do usuário autenticado. */
  currentUser = signal<User | null>(null);
  /** Controla a visibilidade do menu suspenso (dropdown) do usuário. */
  isDropdownOpen = signal(false);
  /** Armazena o título da página atual, atualizado dinamicamente. */
  pageTitle = signal('Carregando...');

  /** Definições dos ícones do FontAwesome para uso no template. */
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

  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  /** Inicializa o componente, subscrevendo ao usuário e configurando a atualização do título da página. */
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser.set(user);
    });

    // Função auxiliar para extrair o título da rota mais profunda.
    const getTitleFromRoute = () => {
      let child = this.activatedRoute.firstChild;
      while (child?.firstChild) {
        child = child.firstChild;
      }
      return child?.snapshot.data['title'] || '';
    };

    // Define o título inicial no carregamento do componente.
    const initialTitle = getTitleFromRoute();
    if (initialTitle) {
      this.pageTitle.set(initialTitle);
    }

    // Ouve por eventos de navegação para atualizar o título dinamicamente.
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      const title = getTitleFromRoute();
      if (title) {
        this.pageTitle.set(title);
      }
    });
  }

  /** Verifica se o usuário atual possui a permissão de Administrador. */
  isAdmin(): boolean {
    return this.currentUser()?.roles?.some(r => r.authority === 'ROLE_ADMIN') ?? false;
  }

  /** Verifica se o usuário atual é um Caixa (e não um Administrador). */
  isCashier(): boolean {
    const isEmployee = this.currentUser()?.roles?.some(r => r.authority === 'ROLE_EMPLOYEE') ?? false;
    const jobTitle = this.currentUser()?.jobTitle?.toLowerCase() ?? '';
    return isEmployee && jobTitle === 'caixa' && !this.isAdmin();
  }

  /** Alterna o estado de visibilidade da barra lateral. */
  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  /** Alterna o estado de visibilidade do menu do usuário. */
  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  /** Executa o processo de logout do usuário. */
  logout(): void {
    this.authService.logout();
  }
}
