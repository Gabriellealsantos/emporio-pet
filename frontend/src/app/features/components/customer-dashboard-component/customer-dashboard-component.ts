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

/** Componente que exibe o painel principal (dashboard) para o cliente logado. */
@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FaIconComponent, RouterLink, DeleteConfirmationModalComponent],
  templateUrl: './customer-dashboard-component.html',
  styleUrls: ['./customer-dashboard-component.css']
})
export class CustomerDashboardComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena os dados do usuário autenticado. */
  currentUser = signal<User | null>(null);
  /** Armazena a lista dos próximos agendamentos a serem exibidos. */
  upcomingAppointments = signal<Appointment[]>([]);
  /** Controla o estado de carregamento dos dados. */
  isLoading = signal(true);
  /** Controla a visibilidade do modal de confirmação de cancelamento. */
  isConfirmModalOpen = signal(false);
  /** Armazena o agendamento a ser cancelado. */
  appointmentToCancel = signal<Appointment | null>(null);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faCalendarPlus = faCalendarPlus;
  faPaw = faPaw;
  faChevronRight = faChevronRight;
  faTimes = faTimes;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, buscando o usuário atual e seus próximos agendamentos. */
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

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS
  // ===================================================================

  /** Carrega os próximos agendamentos do cliente a partir da API. */
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

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL
  // ===================================================================

  /** Abre o modal de confirmação para cancelar um agendamento. */
  openCancelModal(appointment: Appointment): void {
    this.appointmentToCancel.set(appointment);
    this.isConfirmModalOpen.set(true);
  }

  /** Fecha o modal de confirmação. */
  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
  }

  /** Confirma e executa o cancelamento de um agendamento. */
  onConfirmCancel(): void {
    const appointment = this.appointmentToCancel();
    if (!appointment) return;

    this.appointmentService.cancel(appointment.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Agendamento cancelado com sucesso!');
        this.loadUpcomingAppointments();
        this.closeConfirmModal();
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao cancelar agendamento.')
    });
  }

  // ===================================================================
  // MÉTODOS DE EVENTOS E AUXILIARES
  // ===================================================================

  /** Lida com o clique no botão de cancelar, verificando se a ação é permitida. */
  handleCancelClick(appointment: Appointment): void {
    if (this.isCancellable(appointment)) {
      this.openCancelModal(appointment);
    } else {
      this.notificationService.showError('Não é possível cancelar com menos de 12h de antecedência. Por favor, entre em contato.');
    }
  }

  /** Verifica se um agendamento pode ser cancelado com base na antecedência mínima. */
  isCancellable(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.startDateTime);
    const now = new Date();
    // Verifica se a data do agendamento é maior que a data atual mais 12 horas.
    return appointmentDate.getTime() > now.getTime() + (12 * 60 * 60 * 1000);
  }

  /** Traduz uma chave de status para um texto legível em português. */
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
