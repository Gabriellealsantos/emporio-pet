import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faClock, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../models/User';
import { Appointment } from '../../models/Appointment';
import { AppointmentStatus } from '../../models/AppointmentStatus';
import { Page } from '../../models/PageModel';

/** Componente que exibe o painel principal (dashboard) para o funcionário logado. */
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './employee-dashboard-component.html',
  styleUrls: ['./employee-dashboard-component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena a lista de agendamentos do dia para o funcionário. */
  todaysAppointments = signal<Appointment[]>([]);
  /** Controla o estado de carregamento dos dados. */
  isLoading = signal(true);
  /** Armazena os dados do usuário autenticado. */
  currentUser = signal<User | null>(null);

  // ===================================================================
  // ÍCONES E PROPRIEDADES ESTÁTICAS
  // ===================================================================
  /** Armazena a data atual para exibição no template. */
  today = new Date();
  /** Definições dos ícones do FontAwesome para uso no template. */
  faPlayCircle = faPlayCircle;
  faCheckCircle = faCheckCircle;
  faClock = faClock;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, buscando o usuário atual e seus agendamentos para o dia. */
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser.set(user);
        this.loadTodaysAppointments();
      } else {
        this.isLoading.set(false);
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO E AÇÕES
  // ===================================================================

  /** Carrega os agendamentos do dia para o funcionário logado a partir da API. */
  loadTodaysAppointments(): void {
    const employeeId = this.currentUser()?.id;
    if (!employeeId) return;

    this.isLoading.set(true);
    const todayStr = new Date().toISOString().split('T')[0];

    const filters = {
      employeeId: employeeId,
      minDate: todayStr,
      maxDate: todayStr,
    };

    this.appointmentService.findAll(filters).subscribe({
      next: (page: Page<Appointment>) => {
        this.todaysAppointments.set(page.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Erro ao carregar seus agendamentos.');
        this.isLoading.set(false);
      }
    });
  }

  /** Atualiza o status de um agendamento (ex: para Em Andamento ou Concluído). */
  updateAppointmentStatus(id: number, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        this.notificationService.showSuccess('Status do agendamento atualizado!');
        this.loadTodaysAppointments();
      },
      error: (err) => {
        this.notificationService.showError('Erro ao atualizar o status.');
      }
    });
  }
}
