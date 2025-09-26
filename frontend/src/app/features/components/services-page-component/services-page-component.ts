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

/** Componente de página para visualização e gerenciamento de serviços. */
@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, DeleteConfirmationModalComponent, ServicesFormComponent],
  templateUrl: './services-page-component.html',
  styleUrls: ['./services-page-component.css']
})
export class ServicesPageComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private servicesService = inject(ServicesService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;

  // ===================================================================
  // ESTADO DO COMPONENTE E FILTROS (SIGNALS)
  // ===================================================================
  /** Armazena a lista de serviços exibida na página. */
  services = signal<Service[]>([]);
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);
  /** Armazena o termo de busca por nome. */
  nameFilter = signal('');
  /** Armazena o filtro de status (ativo/inativo/todos). */
  statusFilter = signal<boolean | null>(true);

  // ===================================================================
  // ESTADO DOS MODAIS (SIGNALS)
  // ===================================================================
  /** Controla a visibilidade do modal de formulário (criar/editar). */
  isFormModalOpen = signal(false);
  /** Armazena o serviço que está sendo editado. */
  editingService = signal<Service | null>(null);
  /** Controla a visibilidade do modal de confirmação (ativar/desativar). */
  isConfirmModalOpen = signal(false);
  /** Armazena o serviço que sofrerá a ação de ativação/desativação. */
  serviceToUpdate = signal<Service | null>(null);
  /** Define o tipo de ação a ser confirmada no modal. */
  actionToConfirm = signal<'activate' | 'deactivate' | null>(null);
  /** Título do modal de confirmação. */
  modalTitle = signal('');
  /** Mensagem do modal de confirmação. */
  modalMessage = signal('');
  /** Texto do botão de confirmação do modal. */
  modalConfirmText = signal('');
  /** Classe CSS do botão de confirmação do modal. */
  modalConfirmClass = signal('');

  // ===================================================================
  // LÓGICA REATIVA (RXJS)
  // ===================================================================
  /** Subject do RxJS para controlar o debounce da busca por nome. */
  private searchSubject = new Subject<string>();

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, carregando serviços e configurando a busca com debounce. */
  ngOnInit(): void {
    this.loadServices();
    this.setupSearchDebounce();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS E LÓGICA REATIVA
  // ===================================================================

  /** Carrega a lista de serviços da API com base nos filtros atuais. */
  loadServices(): void {
    this.isLoading.set(true);
    const filters = { name: this.nameFilter(), active: this.statusFilter() };
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

  /** Configura o observable que aguarda uma pausa na digitação para iniciar a busca. */
  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.nameFilter.set(searchValue);
      this.loadServices();
    });
  }

  // ===================================================================
  // MÉTODOS DE EVENTOS DA UI
  // ===================================================================

  /** Captura o evento de digitação no campo de busca e o emite no searchSubject. */
  onNameInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  /** Captura a mudança no filtro de status e recarrega a lista de serviços. */
  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value === 'null' ? null : value === 'true');
    this.loadServices();
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL DE FORMULÁRIO
  // ===================================================================

  /** Abre o modal para cadastrar um novo serviço. */
  openCreateModal(): void {
    this.editingService.set(null);
    this.isFormModalOpen.set(true);
  }

  /** Abre o modal para editar um serviço existente. */
  openEditModal(service: Service): void {
    this.editingService.set(service);
    this.isFormModalOpen.set(true);
  }

  /** Fecha o modal de formulário. */
  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  /** Lida com o salvamento (criação/atualização) de um serviço e o upload de imagem opcional. */
  onSaveService(event: { serviceData: ServiceInsert | ServiceUpdate; imageFile: File | null }): void {
    const { serviceData, imageFile } = event;
    const serviceSendoEditado = this.editingService();

    // Define a operação inicial: criar ou atualizar os dados de texto.
    const save$: Observable<Service> = serviceSendoEditado
      ? this.servicesService.update(serviceSendoEditado.id, serviceData)
      : this.servicesService.create(serviceData as ServiceInsert);

    save$.pipe(
      // Se a operação inicial for bem-sucedida e houver uma imagem, faz o upload.
      switchMap(savedService => {
        if (imageFile) {
          return this.servicesService.uploadImage(savedService.id, imageFile).pipe(
            map(() => savedService) // Continua o fluxo com o objeto 'savedService'.
          );
        }
        return of(savedService); // Se não houver imagem, apenas continua o fluxo.
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

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL DE CONFIRMAÇÃO
  // ===================================================================

  /** Prepara e abre o modal para confirmar a desativação de um serviço. */
  onDeactivate(service: Service): void {
    this.serviceToUpdate.set(service);
    this.modalTitle.set('Confirmar Desativação');
    this.modalMessage.set(`Tem certeza que deseja desativar o serviço "${service.name}"?`);
    this.modalConfirmText.set('Desativar');
    this.modalConfirmClass.set('button-delete');
    this.actionToConfirm.set('deactivate');
    this.isConfirmModalOpen.set(true);
  }

  /** Prepara e abre o modal para confirmar a ativação de um serviço. */
  onActivate(service: Service): void {
    this.serviceToUpdate.set(service);
    this.modalTitle.set('Confirmar Ativação');
    this.modalMessage.set(`Tem certeza que deseja ativar o serviço "${service.name}"?`);
    this.modalConfirmText.set('Ativar');
    this.modalConfirmClass.set('button-activate');
    this.actionToConfirm.set('activate');
    this.isConfirmModalOpen.set(true);
  }

  /** Fecha o modal de confirmação e reseta seu estado. */
  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
    this.serviceToUpdate.set(null);
    this.actionToConfirm.set(null);
  }

  /** Executa a ação confirmada no modal (ativar ou desativar um serviço). */
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
}
