import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';
import { Appointment } from '../../models/Appointment';
import { AppointmentService } from '../../../core/services/appointment.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendarPlus, faChevronRight, faPaw } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { Page } from '../../models/PageModel';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FaIconComponent, RouterLink],
  templateUrl: './customer-dashboard-component.html',
  styleUrls: ['./customer-dashboard-component.css']
})
export class CustomerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  // Signals
  currentUser = signal<User | null>(null);
  upcomingAppointments = signal<Appointment[]>([]);
  isLoading = signal(true);

  // Ícones
  faCalendarPlus = faCalendarPlus;
  faPaw = faPaw;
  faChevronRight = faChevronRight;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.loadUpcomingAppointments();
      } else {
        this.isLoading.set(false);
      }
    });
  }

  loadUpcomingAppointments(): void {
    this.isLoading.set(true);
    this.appointmentService.findMyAppointments({ page: 0, size: 3 }).subscribe({
      next: (page: Page<Appointment>) => {
        const now = new Date();
        const futureAppointments = page.content.filter(app => new Date(app.startDateTime) > now);
        this.upcomingAppointments.set(futureAppointments);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erro ao carregar agendamentos", err);
        this.isLoading.set(false);
      }
    });
  }
}
