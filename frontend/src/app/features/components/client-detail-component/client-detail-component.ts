import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faIdCard, faPhone, faCalendar, faCog, faHeart, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../models/User';
import { NotificationService } from '../../../core/services/notification.service';
import { NgxMaskDirective } from 'ngx-mask';
import { CustomerService } from '../../../core/services/customer-service';
import { PetService } from '../../../core/services/PetService';
import { PetFormComponent } from '../../../shared/components/pet-form/pet-form';
import { Pet } from '../../models/Pet';

/** Componente de página para visualizar e editar os detalhes de um cliente específico. */
@Component({
  selector: 'app-client-detail-component',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FaIconComponent, NgxMaskDirective, PetFormComponent],
  templateUrl: './client-detail-component.html',
  styleUrls: ['./client-detail-component.css']
})
export class ClientDetailComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private petService = inject(PetService);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private location = inject(Location);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena os dados do cliente sendo visualizado/editado. */
  client = signal<User | null>(null);
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);
  /** Controla a visibilidade do modal de cadastro/edição de pet. */
  isPetModalOpen = signal(false);
  /** Armazena o pet que está sendo editado. */
  editingPet = signal<Pet | null>(null);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faUser = faUser;
  faEnvelope = faEnvelope;
  faIdCard = faIdCard;
  faPhone = faPhone;
  faCalendar = faCalendar;
  faCog = faCog;
  faHeart = faHeart;
  faPlus = faPlus;
  faArrowLeft = faArrowLeft;

  // ===================================================================
  // FORMULÁRIO E PROPRIEDADES ESTÁTICAS
  // ===================================================================
  /** Formulário reativo para a edição dos dados do cliente. */
  clientForm: FormGroup;
  /** Lista de status para o dropdown de status do cliente. */
  statusList = ['NON_BLOCKED', 'BLOCKED', 'INACTIVE', 'SUSPENDED'];

  // ===================================================================
  // CONSTRUTOR E CICLO DE VIDA
  // ===================================================================
  constructor() {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      cpf: ['', Validators.required],
      phone: ['', Validators.required],
      birthDate: [''],
      status: ['']
    });
  }

  /** Inicializa o componente, buscando o ID do cliente na rota e carregando seus dados. */
  ngOnInit(): void {
    const clientId = this.route.snapshot.params['id'];
    if (clientId) {
      this.loadClientData(clientId);
    }
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS
  // ===================================================================

  /** Carrega os dados do cliente da API com base no ID e preenche o formulário. */
  loadClientData(id: number): void {
    this.isLoading.set(true);
    this.customerService.findById(id).subscribe({
      next: (data) => {
        this.client.set(data);
        this.clientForm.patchValue({
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          birthDate: data.birthDate,
          status: data.userStatus
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Cliente não encontrado.');
        this.isLoading.set(false);
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE EVENTOS E SUBMISSÃO DE FORMULÁRIO
  // ===================================================================

  /** Lida com a submissão do formulário para atualizar os dados do cliente. */
  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.notificationService.showError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    const clientId = this.client()?.id;
    if (clientId) {
      this.customerService.update(clientId, this.clientForm.value).subscribe({
        next: (updatedClient) => {
          this.client.set(updatedClient);
          this.notificationService.showSuccess('Cliente atualizado com sucesso!');
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao atualizar cliente.')
      });
    }
  }

  /** Captura a mudança de status no dropdown e envia a atualização para a API. */
  onStatusChange(event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    const clientId = this.client()?.id;
    if (clientId && newStatus) {
      this.customerService.updateStatus(clientId, newStatus).subscribe({
        next: (updatedClient) => {
          this.client.set(updatedClient);
          this.notificationService.showSuccess(`Status do cliente alterado para ${this.translateStatus(newStatus)}!`);
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao alterar status.')
      });
    }
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL DE PET
  // ===================================================================

  /** Abre o modal para cadastrar um novo pet. */
  openCreatePetModal(): void {
    this.editingPet.set(null);
    this.isPetModalOpen.set(true);
  }

  /** Abre o modal para editar um pet existente. */
  openEditPetModal(pet: Pet): void {
    this.editingPet.set(pet);
    this.isPetModalOpen.set(true);
  }

  /** Fecha o modal de pet. */
  closePetModal(): void {
    this.isPetModalOpen.set(false);
  }

  /** Lida com o salvamento (criação ou atualização) de um pet a partir do modal. */
  onSavePet(petData: any): void {
    const petSendoEditado = this.editingPet();
    const ownerId = this.client()?.id;
    if (!ownerId) return;

    const action$ = petSendoEditado
      ? this.petService.update(petSendoEditado.id, petData)
      : this.petService.adminCreate({ ...petData, ownerId });
    const successMessage = petSendoEditado ? 'Pet atualizado com sucesso!' : 'Pet cadastrado com sucesso!';
    const errorMessage = petSendoEditado ? 'Erro ao atualizar pet.' : 'Erro ao cadastrar pet.';

    action$.subscribe({
      next: () => {
        this.notificationService.showSuccess(successMessage);
        this.closePetModal();
        this.loadClientData(ownerId);
      },
      error: (err) => this.notificationService.showError(err.error?.message || errorMessage)
    });
  }

  // ===================================================================
  // MÉTODOS DE NAVEGAÇÃO E AUXILIARES
  // ===================================================================

  /** Navega para a página anterior no histórico do navegador. */
  goBack(): void {
    this.location.back();
  }

  /** Traduz uma chave de status para um texto legível em português. */
  translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'NON_BLOCKED': 'Ativo', 'BLOCKED': 'Bloqueado',
      'INACTIVE': 'Inativo', 'SUSPENDED': 'Suspenso'
    };
    return map[status] || status;
  }
}
