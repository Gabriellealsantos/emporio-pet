import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faSearch, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
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
    this.editingService.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(service: Service): void {
    this.editingService.set(service);
    this.isFormModalOpen.set(true);
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

  onSaveService(event: { serviceData: ServiceInsert | ServiceUpdate; imageFile: File | null }): void {
    const { serviceData, imageFile } = event;
    const serviceSendoEditado = this.editingService();

    let save$: Observable<Service>;

    // ETAPA 1: Criar ou Atualizar os dados de texto do serviço
    if (serviceSendoEditado) {
      save$ = this.servicesService.update(serviceSendoEditado.id, serviceData);
    } else {
      save$ = this.servicesService.create(serviceData as ServiceInsert);
    }

    save$.pipe(
      // ETAPA 2: Se a etapa 1 deu certo, e se existe uma imagem, faz o upload
      switchMap(savedService => {
        if (imageFile) {
          // Chamamos o upload e retornamos o observable, mas o valor final será o 'savedService'
          return this.servicesService.uploadImage(savedService.id, imageFile).pipe(
            map(() => savedService) // Garante que o 'savedService' continue para o subscribe
          );
        }
        // Se não houver imagem, apenas continuamos com o serviço salvo
        return of(savedService);
      })
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Serviço ${serviceSendoEditado ? 'atualizado' : 'criado'} com sucesso!`);
        this.closeFormModal();
        this.loadServices();
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao salvar serviço.')
    });
  }
}
