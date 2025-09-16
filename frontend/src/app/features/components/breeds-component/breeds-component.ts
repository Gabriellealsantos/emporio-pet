import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCat, faDog, faEdit, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from '../../../core/services/notification.service';
import { Breed } from '../../models/Breed';
import { BreedService } from '../../../core/services/breed.service';
import { BreedFormComponent } from '../../../shared/components/breed-form-component/breed-form-component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal-component/delete-confirmation-modal-component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-breeds-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, BreedFormComponent, DeleteConfirmationModalComponent],
  templateUrl: './breeds-component.html',
  styleUrls: ['./breeds-component.css']
})
export class BreedsPageComponent implements OnInit {
  private breedService = inject(BreedService);
  private notificationService = inject(NotificationService);

  // Ícones...
  faPlus = faPlus;
  faSearch = faSearch;
  faDog = faDog;
  faCat = faCat;
  faEdit = faEdit;
  faTrash = faTrash;

  // Signals para a lista e modais
  breeds = signal<Breed[]>([]);
  isModalOpen = signal(false);
  editingBreed = signal<Breed | null>(null);
  isDeleteModalOpen = signal(false);
  breedToDelete = signal<Breed | null>(null);

  // --- NOVOS SIGNALS E LÓGICA PARA OS FILTROS ---
  searchTerm = signal<string>('');
  speciesFilter = signal<string>('all'); // 'all' como valor inicial
  speciesList = signal<string[]>([]); // Para popular o <select>

  // Subject para debounce (evitar buscas a cada tecla digitada)
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadInitialData();
    this.setupSearchDebounce();
  }

  // Carrega tanto as raças quanto as espécies disponíveis
  loadInitialData(): void {
    this.loadBreeds();
    this.loadSpecies();
  }

  loadBreeds(): void {
    const filters = {
      name: this.searchTerm(),
      species: this.speciesFilter()
    };
    this.breedService.findAll(filters).subscribe({
      next: (data) => this.breeds.set(data),
      error: (err) => this.notificationService.showError('Erro ao carregar lista de raças.')
    });
  }

  loadSpecies(): void {
    this.breedService.getSpecies().subscribe({
      next: (data) => this.speciesList.set(data),
      error: () => this.notificationService.showError('Erro ao carregar lista de espécies.')
    });
  }

  // Configura o "atraso" na busca para não sobrecarregar a API
  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400), // Espera 400ms após a última digitação
      distinctUntilChanged() // Só busca se o texto mudou
    ).subscribe(searchValue => {
      this.searchTerm.set(searchValue);
      this.loadBreeds();
    });
  }

  // Chamado a cada tecla digitada no campo de busca
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  // Chamado quando o valor do <select> de espécies muda
  onSpeciesFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.speciesFilter.set(value);
    this.loadBreeds(); // Busca imediatamente ao mudar o filtro
  }

  // --- RESTO DOS MÉTODOS (MODAIS) SEM ALTERAÇÃO ---

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

  openDeleteModal(breed: Breed): void {
    this.breedToDelete.set(breed);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.breedToDelete.set(null);
  }

  onConfirmDelete(): void {
    const breed = this.breedToDelete();
    if (breed) {
      this.breedService.delete(breed.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Raça excluída com sucesso!');
          this.loadBreeds();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Erro ao excluir raça.');
        },
        complete: () => {
          this.closeDeleteModal();
        }
      });
    }
  }
}
