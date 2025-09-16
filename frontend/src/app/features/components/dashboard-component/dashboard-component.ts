import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FaIconComponent, CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css'],
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);
  Math = Math;
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

  dashboardData = signal<DashboardData | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

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
