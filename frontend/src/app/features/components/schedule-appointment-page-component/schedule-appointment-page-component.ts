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

@Component({
  selector: 'app-schedule-appointment-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule],
  templateUrl: './schedule-appointment-page-component.html',
  styleUrls: ['./schedule-appointment-page-component.css'],
})
export class ScheduleAppointmentPageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private servicesService = inject(ServicesService);
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);

  currentStep = signal(1);

  pets = signal<Pet[]>([]);
  services = signal<Service[]>([]);
  availableTimes = signal<string[]>([]);
  qualifiedEmployees = signal<User[]>([]);

  selectedPet = signal<Pet | null>(null);
  selectedService = signal<Service | null>(null);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);
  selectedEmployeeId = signal<number | null>(null);

  selectedEmployeeName = computed(() => {
    const empId = this.selectedEmployeeId();
    if (!empId) return "Qualquer um";
    return this.qualifiedEmployees().find(e => e.id === empId)?.name ?? "Qualquer um";
  });

  isLoadingTimes = signal(false);
  todayString = new Date().toISOString().split('T')[0];

  faPaw = faPaw;
  faArrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;


  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.pets && user.pets.length > 0) {
        this.pets.set(user.pets);
        if (user.pets.length === 1) {
          this.selectPet(user.pets[0]);
        }
      } else {
        this.router.navigate(['/pets/cadastrar']);
      }
    });
  }

  isTimeInPast(time: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    // A verificação só se aplica se a data selecionada for hoje
    if (this.selectedDate() === today) {
      // Compara o horário do agendamento com a data/hora atual
      return new Date(time) < new Date();
    }
    // Para datas futuras, nenhum horário está no passado.
    return false;
  }

  selectPet(pet: Pet): void {
    this.selectedPet.set(pet);
    this.loadServices();
    this.currentStep.set(2);
  }

  loadServices(): void {
    this.servicesService.findAllActiveServices().subscribe((data) => {
      this.services.set(data);
    });
  }

  selectService(service: Service): void {
    this.selectedService.set(service);
    this.loadQualifiedEmployees(service.id);
    this.currentStep.set(3);
  }

  loadQualifiedEmployees(serviceId: number): void {
    this.servicesService.findQualifiedEmployees(serviceId).subscribe(employees => {
      this.qualifiedEmployees.set(employees);
    });
  }

  onEmployeeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const employeeId = select.value ? parseInt(select.value, 10) : null;
    this.selectedEmployeeId.set(employeeId);

    if (this.selectedDate()) {
      const dateInput = document.getElementById('appointmentDate') as HTMLInputElement;
      if (dateInput) {
        this.onDateChange({ target: dateInput } as unknown as Event);
      }
    }
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value;

    if (!date || !this.selectedService()) {
      return;
    }

    this.selectedDate.set(date);
    this.selectedTime.set(null);
    this.availableTimes.set([]);
    this.isLoadingTimes.set(true);

    const serviceId = this.selectedService()!.id;
    const employeeId = this.selectedEmployeeId();

    this.appointmentService.findAvailableTimes(serviceId, date, employeeId).subscribe((times) => {
      this.availableTimes.set(times);
      this.isLoadingTimes.set(false);
    });
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  goToNextStep(): void {
    this.currentStep.update((step) => step + 1);
  }

  goBack(): void {
    this.currentStep.update((step) => step - 1);
  }

  cancel(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  goToDashboard(): void {
    this.router.navigate(['/customer/dashboard']);
  }

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

  confirmAppointment(): void {
    // 1. Coleta e valida todos os dados dos signals
    const petId = this.selectedPet()?.id;
    const serviceId = this.selectedService()?.id;
    const startDateTime = this.selectedTime();
    const employeeId = this.selectedEmployeeId();

    if (!petId || !serviceId || !startDateTime) {
      this.notificationService.showError("Dados do agendamento incompletos.");
      return;
    }

    // 2. Monta o DTO para enviar ao backend
    const dto: AppointmentInsertDTO = {
      petId,
      serviceId,
      startDateTime,
      employeeId
    };

    // 3. Chama o serviço para criar o agendamento
    this.appointmentService.create(dto).subscribe({
      next: () => {
        this.notificationService.showSuccess("Agendamento realizado com sucesso!");
        this.currentStep.set(5); // Avança para a tela de sucesso
      },
      error: (err) => {
        console.error("Erro ao criar agendamento:", err);
        this.notificationService.showError(err.error?.message || "Não foi possível realizar o agendamento.");
        // Se o erro for de conflito (horário ocupado), volta para o passo 3
        if (err.status === 409) {
            this.currentStep.set(3);
            // Recarrega os horários para mostrar a disponibilidade atualizada
            const dateInput = document.getElementById('appointmentDate') as HTMLInputElement;
            if(dateInput) this.onDateChange({ target: dateInput } as unknown as Event);
        }
      }
    });
  }
}
