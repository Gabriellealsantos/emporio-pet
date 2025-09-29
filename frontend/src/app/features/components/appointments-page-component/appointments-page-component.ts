import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendarAlt, faEdit, faFilter, faList, faTrash, faUserMd } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DeleteConfirmationModalComponent } from "../../../shared/components/delete-confirmation-modal-component/delete-confirmation-modal-component";
import { Appointment } from '../../models/Appointment';
import { AppointmentStatus } from '../../models/AppointmentStatus';
import { User } from '../../models/User';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { Service } from '../../models/Service';
import { ServicesService } from '../../../core/services/services.service';

/** Componente de página para visualização e gerenciamento de agendamentos. */
@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, FormsModule, DeleteConfirmationModalComponent, ReactiveFormsModule],
  templateUrl: './appointments-page-component.html',
  styleUrls: ['./appointments-page-component.css']
})
export class AppointmentsPageComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private appointmentService = inject(AppointmentService);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private servicesService = inject(ServicesService);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faFilter = faFilter;
  faCalendarAlt = faCalendarAlt;
  faUserMd = faUserMd;
  faList = faList;
  faEdit = faEdit;
  faTrash = faTrash;

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena a lista de agendamentos exibida na página. */
  appointments = signal<Appointment[]>([]);
  /** Armazena a lista de funcionários para o dropdown de filtro. */
  employeesForFilter = signal<User[]>([]);
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);
  /** Armazena os dados do usuário autenticado. */
  currentUser = signal<User | null>(null);
  /** Armazena a lista de serviços ativos. */
  services = signal<Service[]>([]);

  // ===================================================================
  // ESTADO DOS FILTROS (SIGNALS)
  // ===================================================================
  /** Data inicial para o filtro de agendamentos. */
  minDate = signal('');
  /** Data final para o filtro de agendamentos. */
  maxDate = signal('');
  /** ID do funcionário selecionado no filtro. */
  selectedEmployeeId = signal<string>('all');
  /** Status selecionado no filtro. */
  selectedStatus = signal<string>('SCHEDULED');

  // ===================================================================
  // ESTADO DO MODAL DE CONFIRMAÇÃO (SIGNALS)
  // ===================================================================
  /** Controla a visibilidade do modal de confirmação. */
  isConfirmModalOpen = signal(false);
  /** Armazena o agendamento que sofrerá a ação. */
  appointmentToAction = signal<Appointment | null>(null);
  /** Define o tipo de ação a ser confirmada no modal. */
  actionToConfirm = signal<'updateStatus' | 'cancel' | 'deleteReview' | null>(null);
  /** Armazena o novo status a ser aplicado, se a ação for de atualização. */
  newStatusToAction = signal<AppointmentStatus | null>(null);
  /** Título exibido no modal. */
  modalTitle = signal('');
  /** Mensagem de confirmação exibida no modal. */
  modalMessage = signal('');
  /** Texto do botão de confirmação do modal. */
  modalConfirmText = signal('');
  /** Classe CSS do botão de confirmação do modal. */
  modalConfirmClass = signal('');

  // ===================================================================
  // ESTADO DA PAGINAÇÃO (SIGNALS)
  // ===================================================================
  /** Página atual da listagem de agendamentos. */
  currentPage = signal(0);
  /** Número total de páginas disponíveis. */
  totalPages = signal(0);
  /** Número total de agendamentos encontrados. */
  totalElements = signal(0);

  // ===================================================================
  // PROPRIEDADES ESTÁTICAS
  // ===================================================================
  /** Lista de status para o dropdown do filtro. */
  statusList: AppointmentStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'NO_SHOW'];

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, carregando dados iniciais e definindo valores padrão. */
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => this.currentUser.set(user));

    const today = new Date().toISOString().split('T')[0];
    this.minDate.set(today);
    this.maxDate.set(today);

    this.loadInitialData();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS
  // ===================================================================

  /** Orquestra o carregamento dos dados iniciais necessários para a página. */
  loadInitialData(): void {
    this.loadAppointments();
    this.loadEmployeesForFilter();
    this.loadActiveServices();
  }

  /** Carrega a lista de agendamentos da API com base nos filtros atuais. */
  loadAppointments(page: number = 0): void {
    this.isLoading.set(true);
    this.currentPage.set(page);

    const filters = {
      page: this.currentPage(),
      minDate: this.minDate(),
      maxDate: this.maxDate(),
      employeeId: this.selectedEmployeeId() === 'all' ? undefined : Number(this.selectedEmployeeId()),
      status: this.selectedStatus() === 'all' ? undefined : this.selectedStatus()
    };

    this.appointmentService.findAll(filters).subscribe({
      next: (pageResponse) => {
        this.appointments.set(pageResponse.content);
        this.totalPages.set(pageResponse.totalPages);
        this.totalElements.set(pageResponse.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Erro ao carregar agendamentos.');
        this.isLoading.set(false);
      }
    });
  }

  /** Carrega a lista de funcionários para popular o dropdown de filtro. */
  loadEmployeesForFilter(): void {
    const filters = {
      size: 1000,
      status: 'NON_BLOCKED'
    };
    this.employeeService.findAll(filters).subscribe({
      next: (pageResponse) => this.employeesForFilter.set(pageResponse.content)
    });
  }

  /** Carrega a lista de serviços ativos. */
  loadActiveServices(): void {
    this.isLoading.set(true);
    this.servicesService.findAll({ active: true }).subscribe({
      next: (data) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Não foi possível carregar os serviços. Tente novamente mais tarde.');
        console.error('Erro ao carregar serviços ativos', err);
        this.isLoading.set(false);
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE EVENTOS DA UI
  // ===================================================================

  /** Chamado quando qualquer filtro é alterado, recarregando os agendamentos. */
  onFilterChange(): void {
    if (this.maxDate() < this.minDate()) {
      this.minDate.set(this.maxDate());
    }
    this.loadAppointments();
  }

  /** Navega para uma página específica da lista de agendamentos. */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadAppointments(page);
    }
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL
  // ===================================================================

  /** Prepara e abre o modal para alterar o status ou cancelar um agendamento. */
  requestStatusChange(appointment: Appointment, newStatus: AppointmentStatus): void {
    if (appointment.status === newStatus) return;

    this.appointmentToAction.set(appointment);
    this.newStatusToAction.set(newStatus);

    if (newStatus === 'CANCELED') {
      this.actionToConfirm.set('cancel');
      this.modalTitle.set('Confirmar Cancelamento');
      this.modalMessage.set(`Deseja realmente cancelar o agendamento de "${appointment.pet.name}"?`);
      this.modalConfirmText.set('Sim, Cancelar');
      this.modalConfirmClass.set('button-delete');
    } else {
      this.actionToConfirm.set('updateStatus');
      this.modalTitle.set('Confirmar Alteração de Status');
      this.modalMessage.set(`Deseja alterar o status para "${this.translateStatus(newStatus)}"?`);
      this.modalConfirmText.set('Confirmar');
      this.modalConfirmClass.set('button-activate');
    }
    this.isConfirmModalOpen.set(true);
  }

  /** Prepara e abre o modal para confirmar a remoção do comentário de uma avaliação. */
  onDeleteReview(appointment: Appointment): void {
    if (!appointment.review) return;

    this.appointmentToAction.set(appointment);
    this.actionToConfirm.set('deleteReview');
    this.modalTitle.set('Confirmar Moderação');
    this.modalMessage.set(`Deseja realmente remover o comentário da avaliação para o pet "${appointment.pet.name}"? A nota em estrelas será mantida.`);
    this.modalConfirmText.set('Sim, Remover Comentário');
    this.modalConfirmClass.set('button-delete');
    this.isConfirmModalOpen.set(true);
  }

  /** Executa a ação confirmada no modal (cancelar, atualizar status, etc.). */
  onConfirmAction(): void {
    const appointment = this.appointmentToAction();
    if (!appointment) return;

    const action = this.actionToConfirm();
    let action$: Observable<any>;
    let successMessage = '';

    if (action === 'updateStatus' && this.newStatusToAction()) {
      action$ = this.appointmentService.updateStatus(appointment.id, this.newStatusToAction()!);
      successMessage = 'Status do agendamento atualizado!';
    } else if (action === 'cancel') {
      action$ = this.appointmentService.cancel(appointment.id);
      successMessage = 'Agendamento cancelado com sucesso!';
    } else if (action === 'deleteReview' && appointment.review) {
      action$ = this.reviewService.delete(appointment.id);
      successMessage = 'Comentário removido com sucesso!';
    } else {
      this.closeConfirmModal();
      return;
    }

    action$.subscribe({
      next: () => this.notificationService.showSuccess(successMessage),
      error: (err) => this.notificationService.showError(err.error?.message || 'Ocorreu um erro.'),
      complete: () => this.closeConfirmModal()
    });
  }

  /** Fecha o modal de confirmação e recarrega os dados da página atual. */
  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
    this.loadAppointments(this.currentPage());
  }

  // ===================================================================
  // MÉTODOS AUXILIARES
  // ===================================================================

  /** Verifica se o usuário atual possui a permissão de Administrador. */
  isAdmin(user: User | null): boolean {
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.some(r => r.authority === 'ROLE_ADMIN');
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
