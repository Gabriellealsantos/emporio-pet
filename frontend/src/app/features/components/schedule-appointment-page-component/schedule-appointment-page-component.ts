import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faCheckCircle, faPaw } from '@fortawesome/free-solid-svg-icons';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ServicesService } from '../../../core/services/services.service';
import { Pet } from '../../models/Pet';
import { Service } from '../../models/Service';
import { User } from '../../models/User';
import { NotificationService } from '../../../core/services/notification.service';
import { AppointmentInsertDTO } from '../../models/AppointmentInsertDTO';

/** Componente de página para o fluxo de agendamento de serviços. */
@Component({
  selector: 'app-schedule-appointment-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule],
  templateUrl: './schedule-appointment-page-component.html',
  styleUrls: ['./schedule-appointment-page-component.css'],
})
export class ScheduleAppointmentPageComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private authService = inject(AuthService);
  private router = inject(Router);
  private servicesService = inject(ServicesService);
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO FLUXO E SELEÇÕES (SIGNALS)
  // ===================================================================
  /** Controla a etapa atual do processo de agendamento (1 a 5). */
  currentStep = signal(1);
  /** Armazena o pet selecionado para o agendamento. */
  selectedPet = signal<Pet | null>(null);
  /** Armazena o serviço selecionado. */
  selectedService = signal<Service | null>(null);
  /** Armazena a data selecionada. */
  selectedDate = signal<string | null>(null);
  /** Armazena o horário selecionado. */
  selectedTime = signal<string | null>(null);
  /** Armazena o ID do funcionário selecionado. */
  selectedEmployeeId = signal<number | null>(null);

  // ===================================================================
  // ESTADO DE DADOS E CARREGAMENTO (SIGNALS)
  // ===================================================================
  /** Armazena a lista de pets do usuário. */
  pets = signal<Pet[]>([]);
  /** Armazena a lista de serviços ativos. */
  services = signal<Service[]>([]);
  /** Armazena a lista de horários disponíveis retornada pela API. */
  availableTimes = signal<string[]>([]);
  /** Armazena a lista de funcionários qualificados para o serviço. */
  qualifiedEmployees = signal<User[]>([]);
  /** Controla o estado de carregamento dos horários disponíveis. */
  isLoadingTimes = signal(false);

  // ===================================================================
  // SIGNALS COMPUTADOS, ÍCONES E PROPRIEDADES ESTÁTICAS
  // ===================================================================
  /** Signal computado que retorna o nome do funcionário selecionado ou 'Qualquer um'. */
  selectedEmployeeName = computed(() => {
    const empId = this.selectedEmployeeId();
    if (!empId) return "Qualquer um";
    return this.qualifiedEmployees().find(e => e.id === empId)?.name ?? "Qualquer um";
  });
  /** String da data de hoje para limitar o date picker. */
  todayString = new Date().toISOString().split('T')[0];
  faPaw = faPaw;
  faArrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, buscando os pets do usuário para iniciar o fluxo. */
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.pets && user.pets.length > 0) {
        this.pets.set(user.pets);
        if (user.pets.length === 1) {
          this.selectPet(user.pets[0]);
        }
      } else {
        this.router.navigate(['/onboarding']);
      }
    });
  }

  // ===================================================================
  // MÉTODOS DO FLUXO DE AGENDAMENTO
  // ===================================================================

  /** Seleciona um pet e avança para a etapa de seleção de serviço. */
  selectPet(pet: Pet): void {
    this.selectedPet.set(pet);
    this.loadServices();
    this.currentStep.set(2);
  }

  /** Carrega a lista de serviços ativos. */
  private loadServices(): void {
    this.servicesService.findAllActiveServices().subscribe((data) => this.services.set(data));
  }

  /** Seleciona um serviço, carrega os funcionários qualificados e avança a etapa. */
  selectService(service: Service): void {
    this.selectedService.set(service);
    this.loadQualifiedEmployees(service.id);
    this.currentStep.set(3);
  }

  /** Carrega a lista de funcionários qualificados para um serviço. */
  private loadQualifiedEmployees(serviceId: number): void {
    this.servicesService.findQualifiedEmployees(serviceId).subscribe(employees => {
      this.qualifiedEmployees.set(employees);
    });
  }

  /** Captura a mudança no dropdown de funcionário e recarrega os horários. */
  onEmployeeChange(event: Event): void {
    const employeeId = (event.target as HTMLSelectElement).value ? parseInt((event.target as HTMLSelectElement).value, 10) : null;
    this.selectedEmployeeId.set(employeeId);
    if (this.selectedDate()) {
      const dateInput = document.getElementById('appointmentDate') as HTMLInputElement;
      if (dateInput) this.onDateChange({ target: dateInput } as unknown as Event);
    }
  }

  /** Captura a mudança na data e busca os horários disponíveis. */
  onDateChange(event: Event): void {
    const date = (event.target as HTMLInputElement).value;
    const serviceId = this.selectedService()?.id;
    if (!date || !serviceId) return;

    this.selectedDate.set(date);
    this.selectedTime.set(null);
    this.availableTimes.set([]);
    this.isLoadingTimes.set(true);

    this.appointmentService.findAvailableTimes(serviceId, date, this.selectedEmployeeId()).subscribe((times) => {
      this.availableTimes.set(times);
      this.isLoadingTimes.set(false);
    });
  }

  /** Seleciona um horário da lista de disponíveis. */
  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  /** Coleta todos os dados selecionados, cria o agendamento e finaliza o fluxo. */
  confirmAppointment(): void {
    const { petId, serviceId, startDateTime, employeeId } = {
      petId: this.selectedPet()?.id,
      serviceId: this.selectedService()?.id,
      startDateTime: this.selectedTime(),
      employeeId: this.selectedEmployeeId(),
    };

    if (!petId || !serviceId || !startDateTime) {
      this.notificationService.showError("Dados do agendamento incompletos.");
      return;
    }

    const dto: AppointmentInsertDTO = { petId, serviceId, startDateTime, employeeId };
    this.appointmentService.create(dto).subscribe({
      next: () => {
        this.notificationService.showSuccess("Agendamento realizado com sucesso!");
        this.currentStep.set(5);
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || "Não foi possível realizar o agendamento.");
        if (err.status === 409) {
          this.currentStep.set(3);
          const dateInput = document.getElementById('appointmentDate') as HTMLInputElement;
          if (dateInput) this.onDateChange({ target: dateInput } as unknown as Event);
        }
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE NAVEGAÇÃO E RESET
  // ===================================================================

  /** Avança para a próxima etapa do formulário. */
  goToNextStep(): void {
    this.currentStep.update((step) => step + 1);
  }

  /** Retorna para a etapa anterior do formulário. */
  goBack(): void {
    this.currentStep.update((step) => step - 1);
  }

  /** Cancela o agendamento e retorna ao dashboard. */
  cancel(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  /** Navega para o dashboard do cliente (usado na tela de sucesso). */
  goToDashboard(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  /** Reseta o estado do componente para permitir um novo agendamento. */
  scheduleAnother(): void {
    this.currentStep.set(1);
    this.selectedPet.set(null);
    this.selectedService.set(null);
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.selectedEmployeeId.set(null);
    this.availableTimes.set([]);
    this.qualifiedEmployees.set([]);
  }

  // ===================================================================
  // MÉTODOS AUXILIARES
  // ===================================================================

  /** Verifica se um horário específico para o dia de hoje já passou. */
  isTimeInPast(time: string): boolean {
    if (this.selectedDate() === this.todayString) {
      return new Date(time) < new Date();
    }
    return false;
  }
}
