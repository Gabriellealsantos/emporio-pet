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

/** Componente de página que exibe o histórico de serviços concluídos do funcionário logado. */
@Component({
  selector: 'app-employee-history-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, AppointmentDetailModalComponent],
  templateUrl: './employee-history-page-component.html',
  styleUrls: ['./employee-history-page-component.css'],
})
export class EmployeeHistoryPageComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena a lista de agendamentos concluídos da página atual. */
  historyAppointments = signal<Appointment[]>([]);
  /** Armazena os dados de paginação da lista de agendamentos. */
  pagination = signal<any>({ number: 0, totalPages: 0, totalElements: 0 });
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);
  /** Armazena os dados do usuário autenticado. */
  currentUser = signal<User | null>(null);
  /** Armazena o agendamento selecionado para exibição no modal de detalhes. */
  selectedAppointmentForModal = signal<Appointment | null>(null);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faStar = faStar;
  faEye = faEye;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, buscando o usuário e o histórico de agendamentos. */
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

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO E PAGINAÇÃO
  // ===================================================================

  /** Carrega o histórico paginado de agendamentos concluídos para o funcionário. */
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
          totalElements: response.totalElements,
          first: response.first,
          last: response.last,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Erro ao carregar o histórico de serviços.');
        this.isLoading.set(false);
      },
    });
  }

  /** Navega para uma página específica do histórico de agendamentos. */
  onPageChange(page: number): void {
    if (page >= 0 && page < this.pagination().totalPages) {
      this.loadHistory(page);
    }
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL
  // ===================================================================

  /** Abre o modal para exibir os detalhes de um agendamento. */
  openDetailModal(appointment: Appointment): void {
    this.selectedAppointmentForModal.set(appointment);
  }

  /** Fecha o modal de detalhes do agendamento. */
  closeDetailModal(): void {
    this.selectedAppointmentForModal.set(null);
  }

  // ===================================================================
  // MÉTODOS AUXILIARES
  // ===================================================================

  /** Cria um array com base na nota da avaliação para renderizar os ícones de estrela. */
  getStarsArray(rating: number): any[] {
    return new Array(rating);
  }
}
