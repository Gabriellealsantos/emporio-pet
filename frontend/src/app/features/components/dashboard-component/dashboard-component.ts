import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faCalendarCheck,
  faCalendarDay,
  faCalendarPlus,
  faDollarSign,
  faFileInvoiceDollar,
  faPaw,
  faShoppingCart,
  faUser,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardData } from '../../models/DashboardData';

/** Componente que exibe o painel principal (dashboard) para administradores. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FaIconComponent, CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css'],
})
export class DashboardComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private dashboardService = inject(DashboardService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena os dados consolidados do dashboard. */
  dashboardData = signal<DashboardData | null>(null);
  /** Controla o estado de carregamento dos dados. */
  isLoading = signal(true);

  // ===================================================================
  // ÍCONES E PROPRIEDADES ESTÁTICAS
  // ===================================================================
  /** Expõe o objeto Math global para uso no template (ex: arredondamento). */
  Math = Math;
  /** Definições dos ícones do FontAwesome para uso no template. */
  faArrowUp = faArrowUp;
  faCalendarDay = faCalendarDay;
  faUserPlus = faUserPlus;
  faDollarSign = faDollarSign;
  faCalendarCheck = faCalendarCheck;
  faShoppingCart = faShoppingCart;
  faArrowDown = faArrowDown;
  faUser = faUser;
  faCalendarPlus = faCalendarPlus;
  faPaw = faPaw;
  faFileInvoiceDollar = faFileInvoiceDollar;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, disparando o carregamento dos dados do dashboard. */
  ngOnInit(): void {
    this.loadDashboardData();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO E AUXILIARES
  // ===================================================================

  /** Busca os dados consolidados do dashboard a partir da API. */
  loadDashboardData(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        console.error('Erro ao carregar dados do dashboard.');
        this.isLoading.set(false);
      },
    });
  }

  /** Retorna o ícone e a classe CSS apropriados para um tipo de atividade recente. */
  getActivityStyle(type: string): { icon: any; class: string } {
    switch (type) {
      case 'NEW_CUSTOMER':
        return { icon: this.faUserPlus, class: 'bg-green-100 text-green-500' };
      case 'APPOINTMENT':
        return { icon: this.faCalendarPlus, class: 'bg-blue-100 text-blue-500' };
      case 'INVOICE_PAID':
        return { icon: this.faFileInvoiceDollar, class: 'bg-purple-100 text-purple-500' };
      case 'NEW_PET':
        return { icon: this.faPaw, class: 'bg-indigo-100 text-indigo-500' };
      default:
        return { icon: this.faCalendarCheck, class: 'bg-gray-100 text-gray-500' };
    }
  }
}
