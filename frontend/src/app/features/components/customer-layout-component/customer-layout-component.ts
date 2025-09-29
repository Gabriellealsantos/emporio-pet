import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet, RouterLink, RouterModule } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUserCircle, faSignOutAlt, faPaw, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';

/** Componente que define a estrutura principal do layout da área do cliente. */
@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FaIconComponent, RouterModule],
  templateUrl: './customer-layout-component.html',
  styleUrls: ['./customer-layout-component.css']
})
export class CustomerLayoutComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena os dados do usuário autenticado, recebidos via resolver. */
  currentUser = signal<User | null>(null);
  /** Controla a visibilidade do menu suspenso (dropdown) do usuário. */
  isDropdownOpen = signal(false);
  /** **NOVO:** Controla a visibilidade do menu mobile. */
  isMobileMenuOpen = signal(false);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faUserCircle = faUserCircle;
  faSignOutAlt = faSignOutAlt;
  faPaw = faPaw;
  /** **NOVOS:** Ícones para o botão do menu hambúrguer. */
  faBars = faBars;
  faTimes = faTimes;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, obtendo os dados do usuário a partir do resolver da rota. */
  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.currentUser.set(data['user']);
    });
  }

  // ===================================================================
  // MÉTODOS DE UI E AÇÕES
  // ===================================================================

  /** Alterna o estado de visibilidade do menu do usuário. */
  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  /** **NOVO:** Alterna o estado de visibilidade do menu mobile. */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  /** Executa o processo de logout do usuário. */
  logout(): void {
    this.authService.logout();
  }
}
