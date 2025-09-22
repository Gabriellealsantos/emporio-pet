import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../models/User';
import { Appointment } from '../../models/Appointment';
import { AppointmentService } from '../../../core/services/appointment.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendarPlus, faChevronRight, faPaw, faTimes } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal-component/delete-confirmation-modal-component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FaIconComponent, RouterLink, DeleteConfirmationModalComponent],
  templateUrl: './customer-dashboard-component.html',
  styleUrls: ['./customer-dashboard-component.css']
})
export class CustomerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);

  // Signals
  currentUser = signal<User | null>(null);
  upcomingAppointments = signal<Appointment[]>([]);
  isLoading = signal(true);
  isConfirmModalOpen = signal(false);
  appointmentToCancel = signal<Appointment | null>(null);

  // Ícones
  faCalendarPlus = faCalendarPlus;
  faPaw = faPaw;
  faChevronRight = faChevronRight;
  faTimes = faTimes;

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
    this.appointmentService.findMyUpcomingAppointments().subscribe({
      next: (appointments) => {
        this.upcomingAppointments.set(appointments.slice(0, 3));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erro ao carregar agendamentos", err);
        this.isLoading.set(false);
      }
    });
  }

  openCancelModal(appointment: Appointment): void {
    this.appointmentToCancel.set(appointment);
    this.isConfirmModalOpen.set(true);
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
  }

  onConfirmCancel(): void {
    const appointment = this.appointmentToCancel();
    if (!appointment) return;

    this.appointmentService.cancel(appointment.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Agendamento cancelado com sucesso!');
        this.loadUpcomingAppointments(); // Recarrega a lista
        this.closeConfirmModal();
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao cancelar agendamento.')
    });
  }

   handleCancelClick(appointment: Appointment): void {
    if (this.isCancellable(appointment)) {
      this.openCancelModal(appointment);
    } else {
      this.notificationService.showError('Não é possível cancelar com menos de 12h de antecedência. Por favor, entre em contato com a loja.');
    }
  }

  // Método auxiliar para verificar no template se o botão deve aparecer
  isCancellable(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.startDateTime);
    const now = new Date();
    return appointmentDate.getTime() > now.getTime() + (12 * 60 * 60 * 1000);
  }

  translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'SCHEDULED': 'Agendado',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluído',
      'CANCELED': 'Cancelado',
      'NO_SHOW': 'Não Compareceu'
    };
    return map[status] || status;
  }
}
