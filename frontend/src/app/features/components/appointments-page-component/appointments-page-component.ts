// Em src/app/features/components/appointments-page/appointments-page.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/User';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { faFilter, faCalendarAlt, faUserMd, faList, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Appointment } from '../../models/Appointment';
import { AppointmentStatus } from '../../models/AppointmentStatus';
import { Observable } from 'rxjs';
import { DeleteConfirmationModalComponent } from "../../../shared/components/delete-confirmation-modal-component/delete-confirmation-modal-component";

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, FormsModule, DeleteConfirmationModalComponent],
  templateUrl: './appointments-page-component.html',
  styleUrls: ['./appointments-page-component.css']
})
export class AppointmentsPageComponent implements OnInit {
  // === INJEÇÕES ===
  private appointmentService = inject(AppointmentService);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  // === ÍCONES ===
  faFilter = faFilter; faCalendarAlt = faCalendarAlt; faUserMd = faUserMd; faList = faList; faEdit = faEdit; faTrash = faTrash;


  // === SIGNALS DE ESTADO ===
  appointments = signal<Appointment[]>([]);
  employeesForFilter = signal<User[]>([]);
  isLoading = signal(true);

  // === SIGNALS PARA FILTROS ===
  minDate = signal('');
  maxDate = signal('');
  selectedEmployeeId = signal<string>('all');
  selectedStatus = signal<string>('SCHEDULED');

  // IGNALS PARA CONTROLAR O MODAL DE CONFIRMAÇÃO
  isConfirmModalOpen = signal(false);
  appointmentToAction = signal<Appointment | null>(null);
  actionToConfirm = signal<'updateStatus' | 'cancel' | null>(null);
  newStatusToAction = signal<AppointmentStatus | null>(null);

  modalTitle = signal('');
  modalMessage = signal('');
  modalConfirmText = signal('');
  modalConfirmClass = signal('');


  // Lista de status para o dropdown do filtro
  statusList: AppointmentStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'NO_SHOW'];

  // === SIGNALS PARA PAGINAÇÃO ===
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
    // Define as datas padrão como o dia de hoje
    const today = new Date().toISOString().split('T')[0];
    this.minDate.set(today);
    this.maxDate.set(today);

    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadAppointments();
    this.loadEmployeesForFilter();
  }

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

  loadEmployeesForFilter(): void {
    // Buscamos todos os funcionários para o dropdown (sem paginação)
    this.employeeService.findAll({ size: 1000 }).subscribe({
      next: (pageResponse) => this.employeesForFilter.set(pageResponse.content)
    });
  }

  // Este método é chamado sempre que um filtro é alterado no HTML
  onFilterChange(): void {
    if (this.maxDate() < this.minDate()) {
      this.minDate.set(this.maxDate());
    }
    this.loadAppointments();
  }

  // === MÉTODOS DE PAGINAÇÃO ===
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadAppointments(page);
    }
  }

  // === MÉTODOS DE AÇÃO (PLACEHOLDERS) ===
  onUpdateStatus(appointment: Appointment, newStatus: AppointmentStatus): void {
    this.appointmentToAction.set(appointment);
    this.newStatusToAction.set(newStatus);
    this.actionToConfirm.set('updateStatus');

    this.modalTitle.set('Confirmar Alteração de Status');
    this.modalMessage.set(`Deseja alterar o status do agendamento de "${appointment.pet.name}" para "${this.translateStatus(newStatus)}"?`);
    this.modalConfirmText.set('Confirmar');
    this.modalConfirmClass.set('button-activate');
    this.isConfirmModalOpen.set(true);
  }

  onCancelAppointment(appointment: Appointment): void {
    this.appointmentToAction.set(appointment);
    this.actionToConfirm.set('cancel');

    this.modalTitle.set('Confirmar Cancelamento');
    this.modalMessage.set(`Deseja cancelar o agendamento de "${appointment.pet.name}"? Esta ação não pode ser desfeita.`);
    this.modalConfirmText.set('Cancelar Agendamento');
    this.modalConfirmClass.set('button-delete'); // Botão vermelho
    this.isConfirmModalOpen.set(true);
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
    this.loadAppointments(this.currentPage());
  }

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
    } else {
      this.closeConfirmModal();
      return;
    }

    action$.subscribe({
      next: () => {
        this.notificationService.showSuccess(successMessage);
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Ocorreu um erro.'),
      complete: () => this.closeConfirmModal()
    });
  }

   // MÉTODO ÚNICO PARA PREPARAR A MUDANÇA DE STATUS
  requestStatusChange(appointment: Appointment, newStatus: AppointmentStatus): void {
    // Se o status selecionado for o mesmo que o atual, não faz nada
    if (appointment.status === newStatus) return;

    this.appointmentToAction.set(appointment);
    this.newStatusToAction.set(newStatus);

    // Lógica para decidir qual ação e qual mensagem mostrar
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

  // === MÉTODOS AUXILIARES ===
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
