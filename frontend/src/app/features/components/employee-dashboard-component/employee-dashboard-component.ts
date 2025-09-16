import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faClock, faPlayCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../models/User';
import { Appointment } from '../../models/Appointment';
import { AppointmentStatus } from '../../models/AppointmentStatus';
import { Page } from '../../models/PageModel';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './employee-dashboard-component.html',
  styleUrls: ['./employee-dashboard-component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Signals de estado
  todaysAppointments = signal<Appointment[]>([]);
  isLoading = signal(true);
  currentUser = signal<User | null>(null);
  today = new Date(); // Para exibir a data no template

  // Ícones
  faPlayCircle = faPlayCircle;
  faCheckCircle = faCheckCircle;
  faClock = faClock;

  ngOnInit(): void {
    // Primeiro, pegamos o usuário logado do AuthService
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser.set(user);
        // Assim que temos o usuário, buscamos seus agendamentos
        this.loadTodaysAppointments();
      } else {
        // Lida com o caso em que o usuário não é encontrado
        this.isLoading.set(false);
      }
    });
  }

  loadTodaysAppointments(): void {
    const employeeId = this.currentUser()?.id;
    if (!employeeId) return;

    this.isLoading.set(true);

    // Define o intervalo de hoje (do início ao fim do dia)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const filters = {
      employeeId: employeeId,
      minDate: startOfDay.toISOString().split('T')[0], // Formato YYYY-MM-DD
      maxDate: endOfDay.toISOString().split('T')[0],   // Formato YYYY-MM-DD
    };

    this.appointmentService.findAll(filters).subscribe({
      next: (page: Page<Appointment>) => {
        this.todaysAppointments.set(page.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Erro ao carregar seus agendamentos.');
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  updateAppointmentStatus(id: number, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        this.notificationService.showSuccess('Status do agendamento atualizado!');
        this.loadTodaysAppointments(); // Recarrega a lista para refletir a mudança
      },
      error: (err) => {
        this.notificationService.showError('Erro ao atualizar o status.');
        console.error(err);
      }
    });
  }
}
