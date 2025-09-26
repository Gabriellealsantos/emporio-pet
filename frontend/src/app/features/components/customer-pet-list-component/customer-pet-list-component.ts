import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPaw, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Pet } from '../../models/Pet';
import { PetService } from '../../../core/services/PetService';
import { NotificationService } from '../../../core/services/notification.service';
import { PetFormComponent } from '../../../shared/components/pet-form/pet-form';

/** Componente de página para o cliente visualizar e gerenciar sua lista de pets. */
@Component({
  selector: 'app-customer-pet-list',
  standalone: true,
  imports: [CommonModule, FaIconComponent, PetFormComponent],
  templateUrl: './customer-pet-list-component.html',
  styleUrls: ['./customer-pet-list-component.css']
})
export class CustomerPetListComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private petService = inject(PetService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena a lista de pets do usuário autenticado. */
  myPets = signal<Pet[]>([]);
  /** Controla o estado de carregamento dos dados. */
  isLoading = signal(true);
  /** Controla a visibilidade do modal de cadastro/edição de pet. */
  isModalOpen = signal(false);
  /** Armazena o pet que está sendo editado. */
  petToEdit = signal<Pet | null>(null);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;
  faPaw = faPaw;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, carregando a lista de pets do usuário. */
  ngOnInit(): void {
    this.loadPets();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS
  // ===================================================================

  /** Carrega a lista de pets do usuário logado a partir da API. */
  loadPets(): void {
    this.isLoading.set(true);
    this.petService.findMyPets().subscribe({
      next: (pets) => {
        this.myPets.set(pets);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError("Erro ao carregar seus pets.");
        this.isLoading.set(false);
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL
  // ===================================================================

  /** Abre o modal para cadastrar um novo pet. */
  openAddModal(): void {
    this.petToEdit.set(null);
    this.isModalOpen.set(true);
  }

  /** Abre o modal para editar um pet existente. */
  openEditModal(pet: Pet): void {
    this.petToEdit.set(pet);
    this.isModalOpen.set(true);
  }

  /** Fecha o modal de cadastro/edição de pet. */
  closeModal(): void {
    this.isModalOpen.set(false);
    this.petToEdit.set(null);
  }

  // ===================================================================
  // MÉTODOS DE AÇÃO (SALVAR, DELETAR)
  // ===================================================================

  /** Lida com o salvamento (criação ou atualização) de um pet a partir do modal. */
  handleSave(petData: any): void {
    const petInEdition = this.petToEdit();
    const operation = petInEdition
      ? this.petService.update(petInEdition.id, petData)
      : this.petService.registerPet(petData);
    const successMessage = petInEdition ? 'Pet atualizado com sucesso!' : 'Pet cadastrado com sucesso!';
    const errorMessage = petInEdition ? 'Erro ao atualizar o pet.' : 'Erro ao cadastrar o pet.';

    operation.subscribe({
      next: () => {
        this.notificationService.showSuccess(successMessage);
        this.loadPets();
        this.closeModal();
      },
      error: (err) => this.notificationService.showError(err.error?.message || errorMessage)
    });
  }

  /** Lida com a exclusão de um pet após a confirmação do usuário. */
  handleDelete(pet: Pet): void {
    if (confirm(`Tem certeza que deseja remover ${pet.name}? Esta ação não pode ser desfeita.`)) {
      this.petService.delete(pet.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`${pet.name} foi removido com sucesso.`);
          this.loadPets();
        },
        error: (err) => this.notificationService.showError(err.error?.message || `Erro ao remover ${pet.name}.`)
      });
    }
  }
}
