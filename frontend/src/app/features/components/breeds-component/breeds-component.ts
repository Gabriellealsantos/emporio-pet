// NENHUMA MUDANÇA NECESSÁRIA AQUI SE VOCÊ JÁ TEM ESTE CÓDIGO
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCat, faDog, faEdit, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from '../../../core/services/notification.service';
import { Breed } from '../../models/Breed';
import { BreedService } from '../../../core/services/breed-service';
import { BreedFormComponent } from '../../../shared/components/breed-form-component/breed-form-component';

@Component({
  selector: 'app-breeds-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, BreedFormComponent],
  templateUrl: './breeds-component.html',
  styleUrls: ['./breeds-component.css']
})
export class BreedsPageComponent implements OnInit {
  private breedService = inject(BreedService);
  private notificationService = inject(NotificationService);

  faPlus = faPlus;
  faSearch = faSearch;
  faDog = faDog;
  faCat = faCat;
  faEdit = faEdit;
  faTrash = faTrash;

  breeds = signal<Breed[]>([]);
  isModalOpen = signal(false);
  editingBreed = signal<Breed | null>(null);

  ngOnInit(): void {
    this.loadBreeds();
  }

  loadBreeds(): void {
    this.breedService.findAll().subscribe({
      next: (data) => this.breeds.set(data),
      error: (err) => this.notificationService.showError('Erro ao carregar lista de raças.')
    });
  }

  openCreateModal(): void {
    this.editingBreed.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(breed: Breed): void {
    this.editingBreed.set(breed);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onSaveBreed(breedData: Breed): void {
    const breedSendoEditada = this.editingBreed();
    if (breedSendoEditada) {
      this.breedService.update(breedSendoEditada.id, breedData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Raça atualizada com sucesso!');
          this.closeModal();
          this.loadBreeds();
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao atualizar raça.')
      });
    } else {
      this.breedService.create(breedData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Raça cadastrada com sucesso!');
          this.closeModal();
          this.loadBreeds();
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao cadastrar raça.')
      });
    }
  }
}
