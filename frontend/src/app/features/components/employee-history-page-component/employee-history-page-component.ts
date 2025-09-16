import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faStar, faEye } from '@fortawesome/free-solid-svg-icons';
import { Appointment } from '../../models/Appointment';
import { User } from '../../models/User';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppointmentDetailModalComponent } from '../../../shared/components/appointment-detail-modal/appointment-detail-modal';
import { Page } from '../../models/PageModel';


@Component({
  selector: 'app-employee-history-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, AppointmentDetailModalComponent],
  templateUrl: './employee-history-page-component.html',
  styleUrls: ['./employee-history-page-component.css'],
})
export class EmployeeHistoryPageComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Signals de estado
  historyAppointments = signal<Appointment[]>([]);
  pagination = signal<any>({ number: 0, totalPages: 0, totalElements: 0 });
  isLoading = signal(true);
  currentUser = signal<User | null>(null);
  selectedAppointmentForModal = signal<Appointment | null>(null);

  // Ícones
  faStar = faStar;
  faEye = faEye;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.currentUser.set(user);
        this.loadHistory();
      } else {
        this.isLoading.set(false);
      }
    });
  }

  loadHistory(page: number = 0): void {
    const employeeId = this.currentUser()?.id;
    if (!employeeId) return;

    this.isLoading.set(true);

    const filters = {
      employeeId: employeeId,
      status: 'COMPLETED',
      page: page,
      size: 10,
    };

    this.appointmentService.findAll(filters).subscribe({
      next: (response: Page<Appointment>) => {
        this.historyAppointments.set(response.content);
        this.pagination.set({
          number: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements, // 👈 A LINHA QUE FALTAVA
          first: response.first,
          last: response.last,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Erro ao carregar o histórico de serviços.');
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  openDetailModal(appointment: Appointment): void {
    this.selectedAppointmentForModal.set(appointment);
  }

  closeDetailModal(): void {
    this.selectedAppointmentForModal.set(null);
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.pagination().totalPages) {
      this.loadHistory(page);
    }
  }

  getStarsArray(rating: number): any[] {
    return new Array(rating);
  }
}
