import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPaw, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Pet } from '../../models/Pet';
import { PetService } from '../../../core/services/PetService';
import { NotificationService } from '../../../core/services/notification.service';
import { PetFormComponent } from '../../../shared/components/pet-form/pet-form';

@Component({
  selector: 'app-customer-pet-list',
  standalone: true,
  // Adicionamos o PetFormComponent aos imports
  imports: [CommonModule, FaIconComponent, PetFormComponent],
  templateUrl: './customer-pet-list-component.html',
  styleUrls: ['./customer-pet-list-component.css']
})
export class CustomerPetListComponent implements OnInit {
  private petService = inject(PetService);
  private notificationService = inject(NotificationService);

  // Signals de estado
  myPets = signal<Pet[]>([]);
  isLoading = signal(true);

  // Controle do modal
  isModalOpen = signal(false);
  petToEdit = signal<Pet | null>(null);

  // Ícones
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;
  faPaw = faPaw;

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.isLoading.set(true);
    // Este método no serviço já busca os pets do usuário logado
    this.petService.findMyPets().subscribe({
      next: (pets) => {
        this.myPets.set(pets);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError("Erro ao carregar seus pets.");
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // Métodos de controle do modal
  openAddModal(): void {
    this.petToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(pet: Pet): void {
    this.petToEdit.set(pet);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.petToEdit.set(null);
  }

  // Ações de salvar e deletar
  handleSave(petData: any): void {
    const petInEdition = this.petToEdit();
    // Se estamos editando, chamamos o 'update'. Se não, o 'create'.
    const operation = petInEdition
      ? this.petService.update(petInEdition.id, petData)
      : this.petService.registerPet(petData);

    operation.subscribe({
      next: () => {
        const message = petInEdition ? 'Pet atualizado com sucesso!' : 'Pet cadastrado com sucesso!';
        this.notificationService.showSuccess(message);
        this.loadPets(); // Recarrega a lista
        this.closeModal();
      },
      error: (err) => {
        const message = petInEdition ? 'Erro ao atualizar o pet.' : 'Erro ao cadastrar o pet.';
        this.notificationService.showError(err.error?.message || message);
        console.error(err);
      }
    });
  }

  handleDelete(pet: Pet): void {
    // Adicionamos uma confirmação antes de deletar
    if (confirm(`Tem certeza que deseja remover ${pet.name}? Esta ação não pode ser desfeita.`)) {
      this.petService.delete(pet.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`${pet.name} foi removido com sucesso.`);
          this.loadPets(); // Recarrega a lista
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || `Erro ao remover ${pet.name}.`);
          console.error(err);
        }
      });
    }
  }
}
