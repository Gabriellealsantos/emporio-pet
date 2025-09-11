import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faSearch, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Service } from '../../models/Service';
import { ServicesService } from '../../../core/services/services.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal-component/delete-confirmation-modal-component';
import { ServicesFormComponent } from '../../../shared/components/services-form/services-form';
import { ServiceInsert } from '../../models/ServiceInsert';
import { ServiceUpdate } from '../../models/ServiceUpdate';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, DeleteConfirmationModalComponent, ServicesFormComponent],
  templateUrl: './services-page-component.html',
  styleUrls: ['./services-page-component.css']
})
export class ServicesPageComponent implements OnInit {
  private servicesService = inject(ServicesService);
  private notificationService = inject(NotificationService);

  // Ícones
  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;

  // Signals de estado
  services = signal<Service[]>([]);
  isLoading = signal(true);


  nameFilter = signal('');

  statusFilter = signal<boolean | null>(true);

  isConfirmModalOpen = signal(false);
  serviceToUpdate = signal<Service | null>(null);

  isFormModalOpen = signal(false);
  editingService = signal<Service | null>(null);

  actionToConfirm = signal<'activate' | 'deactivate' | null>(null);

  modalConfirmationText = signal('');
  modalTitle = signal('');
  modalMessage = signal('');
  modalConfirmText = signal('');
  modalConfirmClass = signal('');

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadServices();
    this.setupSearchDebounce();
  }

  loadServices(): void {
    this.isLoading.set(true);
    const filters = {
      name: this.nameFilter(),
      active: this.statusFilter()
    };
    this.servicesService.findAll(filters).subscribe({
      next: (data) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Erro ao carregar a lista de serviços.');
        this.isLoading.set(false);
      }
    });
  }

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.nameFilter.set(searchValue);
      this.loadServices();
    });
  }

  onNameInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value === 'null' ? null : value === 'true');
    this.loadServices();
  }

  // === MÉTODOS DE AÇÃO (serão implementados com o modal) ===

  openCreateModal(): void {
    this.editingService.set(null); // Garante que estamos no modo "criar"
    this.isFormModalOpen.set(true); // Abre o modal
  }

  openEditModal(service: Service): void {
    this.editingService.set(service); // Define qual serviço estamos editando
    this.isFormModalOpen.set(true); // Abre o modal
  }



  onDeactivate(service: Service): void {
    this.serviceToUpdate.set(service);
    this.modalTitle.set('Confirmar Desativação');
    this.modalMessage.set(`Tem certeza que deseja desativar o serviço "${service.name}"?`);
    this.modalConfirmText.set('Desativar');
    this.modalConfirmClass.set('button-delete');
    this.actionToConfirm.set('deactivate');
    this.isConfirmModalOpen.set(true);
  }

  onActivate(service: Service): void {
    this.serviceToUpdate.set(service);

    this.modalTitle.set('Confirmar Ativação');
    this.modalMessage.set(`Tem certeza que deseja ativar o serviço "${service.name}"?`);
    this.modalConfirmText.set('Ativar');
    this.modalConfirmClass.set('button-activate');
    this.actionToConfirm.set('activate');
    this.isConfirmModalOpen.set(true);
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
    this.serviceToUpdate.set(null);
    this.actionToConfirm.set(null);
  }

  onConfirmAction(): void {
    const service = this.serviceToUpdate();
    if (!service) return;

    const action = this.actionToConfirm();
    let action$: Observable<void>;
    let successMessage = '';

    if (action === 'deactivate') {
      action$ = this.servicesService.deactivate(service.id);
      successMessage = 'Serviço desativado com sucesso!';
    } else if (action === 'activate') {
      action$ = this.servicesService.activate(service.id);
      successMessage = 'Serviço ativado com sucesso!';
    } else {
      return;
    }

    action$.subscribe({
      next: () => {
        this.notificationService.showSuccess(successMessage);
        this.loadServices();
      },
      error: (err) => this.notificationService.showError(err.error?.message || `Erro ao ${action} serviço.`),
      complete: () => this.closeConfirmModal()
    });
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onSaveService(formData: ServiceInsert | ServiceUpdate): void {
    const serviceSendoEditado = this.editingService();
    let save$: Observable<Service>;

    if (serviceSendoEditado) {
      save$ = this.servicesService.update(serviceSendoEditado.id, formData);
    } else {
      save$ = this.servicesService.create(formData as ServiceInsert);
    }

    save$.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Serviço ${serviceSendoEditado ? 'atualizado' : 'criado'} com sucesso!`);
        this.closeFormModal();
        this.loadServices();
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao salvar serviço.')
    });
  }
}
