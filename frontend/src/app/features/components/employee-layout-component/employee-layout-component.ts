import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars, faPaw, faCalendarAlt, faUserCircle, faSignOutAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';

/** Componente que define a estrutura principal do layout da área do funcionário. */
@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './employee-layout-component.html',
  styleUrls: ['./employee-layout-component.css']
})
export class EmployeeLayoutComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Controla a visibilidade da barra lateral (sidebar). */
  isSidebarOpen = signal(false);
  /** Controla a visibilidade do menu suspenso (dropdown) do usuário. */
  isDropdownOpen = signal(false);
  /** Armazena o título da página atual, atualizado dinamicamente. */
  pageTitle = signal('Carregando...');
  /** Armazena os dados do usuário autenticado. */
  currentUser = signal<User | null>(null);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faBars = faBars;
  faPaw = faPaw;
  faCalendarAlt = faCalendarAlt;
  faUserCircle = faUserCircle;
  faSignOutAlt = faSignOutAlt;
  faHistory = faHistory;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, subscrevendo ao usuário e configurando a atualização do título da página. */
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => this.currentUser.set(user));

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
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const title = getTitleFromRoute();
      if (title) {
        this.pageTitle.set(title);
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE UI E AÇÕES
  // ===================================================================

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
