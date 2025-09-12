import { Component, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowUp,
  faCalendarDay,
  faUserPlus,
  faDollarSign,
  faCalendarCheck,
  faShoppingCart,
  faArrowDown,
  faUser,
  faCalendarPlus
} from '@fortawesome/free-solid-svg-icons';
import { DashboardData } from '../../models/DashboardData';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FaIconComponent, CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css']
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
        console.error("Erro ao carregar dados do dashboard.");
        this.isLoading.set(false);
      }
    });
  }
}

