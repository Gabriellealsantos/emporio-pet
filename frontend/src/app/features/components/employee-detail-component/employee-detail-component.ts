import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faPhone, faCalendar, faCog, faArrowLeft, faBriefcase, faPlus } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../models/User';
import { NotificationService } from '../../../core/services/notification.service';
import { NgxMaskDirective } from 'ngx-mask';
import { EmployeeService } from '../../../core/services/employee.service';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../models/Service';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal-component/delete-confirmation-modal-component';

@Component({
  selector: 'app-employee-detail-component',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FaIconComponent, NgxMaskDirective, DeleteConfirmationModalComponent],
  templateUrl: './employee-detail-component.html',
  styleUrls: ['./employee-detail-component.css']
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private servicesService = inject(ServicesService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private location = inject(Location);

  employee = signal<User | null>(null);
  isLoading = signal(true);
  allServices = signal<Service[]>([]);
  serviceToAdd = signal<string | null>(null);
  isDeleteServiceModalOpen = signal(false);
  serviceToRemove = signal<Service | null>(null);

  faUser = faUser; faEnvelope = faEnvelope; faPhone = faPhone;
  faCalendar = faCalendar; faCog = faCog; faBriefcase = faBriefcase; faArrowLeft = faArrowLeft; faPlus = faPlus;

  employeeForm: FormGroup;
  statusList = ['NON_BLOCKED', 'BLOCKED', 'INACTIVE', 'SUSPENDED'];



  availableServices = computed(() => {
    const employeeServicesIds = this.employee()?.skilledServices?.map(s => s.id) || [];
    return this.allServices().filter(s => !employeeServicesIds.includes(s.id));
  });

  constructor() {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['', Validators.required],
      birthDate: [''],
      jobTitle: [''],
      status: ['']
    });
  }

   openDeleteServiceModal(service: Service): void {
    this.serviceToRemove.set(service);
    this.isDeleteServiceModalOpen.set(true);
  }


  closeDeleteServiceModal(): void {
    this.isDeleteServiceModalOpen.set(false);
    this.serviceToRemove.set(null);
  }

  onConfirmRemoveService(): void {
    const employeeId = this.employee()?.id;
    const service = this.serviceToRemove();

    if (employeeId && service) {
      this.employeeService.removeService(employeeId, service.id).subscribe({
        next: () => {
          this.loadEmployeeData(employeeId);
          this.notificationService.showSuccess(`Serviço "${service.name}" removido com sucesso!`);
          this.closeDeleteServiceModal();
        },
        error: () => {
          this.notificationService.showError('Erro ao remover serviço.');
          this.closeDeleteServiceModal();
        }
      });
    }
  }

  ngOnInit(): void {
    const employeeId = this.route.snapshot.params['id'];
    if (employeeId) {
      this.loadEmployeeData(employeeId);
      this.loadAllServices();
    }
  }

  loadEmployeeData(id: number): void {
    this.isLoading.set(true);
    this.employeeService.findById(id).subscribe({
      next: (data) => {
        this.employee.set(data);
        this.employeeForm.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone,
          birthDate: data.birthDate,
          jobTitle: data.jobTitle,
          status: data.userStatus
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Funcionário não encontrado.');
        this.isLoading.set(false);
      }
    });
  }

  loadAllServices(): void {
    this.servicesService.findAllActiveServices().subscribe({
      next: (data) => this.allServices.set(data),
      error: () => this.notificationService.showError('Erro ao carregar lista de serviços.')
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.notificationService.showError('Por favor, verifique os campos do formulário.');
      return;
    }
    const employeeId = this.employee()?.id;
    if (employeeId) {
      this.employeeService.update(employeeId, this.employeeForm.getRawValue()).subscribe({
        next: (updatedEmployee) => {
          this.employee.set(updatedEmployee);
          this.notificationService.showSuccess('Dados do funcionário salvos com sucesso!');
          this.employeeForm.markAsPristine();
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao atualizar funcionário.')
      });
    }
  }

  onStatusChange(event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    const employeeId = this.employee()?.id;
    if (employeeId && newStatus) {
      this.employeeService.updateStatus(employeeId, newStatus).subscribe({
        next: (updatedEmployee) => {
          this.employee.set(updatedEmployee);
          this.notificationService.showSuccess(`Status alterado para ${this.translateStatus(newStatus)}!`);
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao alterar status.')
      });
    }
  }

  onAddService(): void {
    const employeeId = this.employee()?.id;
    const serviceId = Number(this.serviceToAdd());
    if (employeeId && serviceId) {
      this.employeeService.addService(employeeId, serviceId).subscribe({
        next: (updatedEmployee) => {
          this.employee.set(updatedEmployee);
          this.notificationService.showSuccess('Serviço adicionado com sucesso!');
          this.serviceToAdd.set(null);
        },
        error: () => this.notificationService.showError('Erro ao adicionar serviço.')
      });
    }
  }

  onRemoveService(serviceId: number): void {
    const employeeId = this.employee()?.id;
    if (employeeId) {
      this.employeeService.removeService(employeeId, serviceId).subscribe({
        next: () => {
          this.loadEmployeeData(employeeId);
          this.notificationService.showSuccess('Serviço removido com sucesso!');
        },
        error: () => this.notificationService.showError('Erro ao remover serviço.')
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'NON_BLOCKED': 'Ativo', 'BLOCKED': 'Bloqueado',
      'INACTIVE': 'Inativo', 'SUSPENDED': 'Suspenso'
    };
    return map[status] || status;
  }

  onServiceSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.serviceToAdd.set(selectElement.value);
  }
}
