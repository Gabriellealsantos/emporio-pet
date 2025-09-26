import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faDog,
  faCat,
  faDove,
  faFish,
  faHorse,
  faCrow,
  faOtter,
  faDragon,
  faFrog,
  faHippo,
  faKiwiBird,
  faQuestion,
  faEdit,
  faTrash,
  faSearch,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from '../../../core/services/notification.service';
import { Breed } from '../../models/Breed';
import { BreedService } from '../../../core/services/breed.service';
import { BreedFormComponent } from '../../../shared/components/breed-form-component/breed-form-component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal-component/delete-confirmation-modal-component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/** Componente de página para visualização e gerenciamento de raças de animais. */
@Component({
  selector: 'app-breeds-page',
  standalone: true,
  imports: [CommonModule, FaIconComponent, BreedFormComponent, DeleteConfirmationModalComponent],
  templateUrl: './breeds-component.html',
  styleUrls: ['./breeds-component.css'],
})
export class BreedsPageComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private breedService = inject(BreedService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faTrash = faTrash;

  speciesConfig: Record<string, { label: string; icon: any; bg: string; text: string }> = {
    CACHORRO: { label: 'Cão', icon: faDog, bg: 'bg-blue-100', text: 'text-blue-800' },
    GATO: { label: 'Gato', icon: faCat, bg: 'bg-purple-100', text: 'text-purple-800' },
    PASSARO: { label: 'Pássaro', icon: faDove, bg: 'bg-yellow-100', text: 'text-yellow-800' },
    ROEDOR: { label: 'Roedor', icon: faOtter, bg: 'bg-pink-100', text: 'text-pink-800' },
    COELHO: { label: 'Coelho', icon: faCrow, bg: 'bg-rose-100', text: 'text-rose-800' },
    PEIXE: { label: 'Peixe', icon: faFish, bg: 'bg-cyan-100', text: 'text-cyan-800' },
    RÉPTIL: { label: 'Réptil', icon: faDragon, bg: 'bg-green-100', text: 'text-green-800' },
    ANFÍBIO: { label: 'Anfíbio', icon: faFrog, bg: 'bg-lime-100', text: 'text-lime-800' },
    CAVALO: { label: 'Cavalo', icon: faHorse, bg: 'bg-amber-100', text: 'text-amber-800' },
    PORCO: { label: 'Porco', icon: faHippo, bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
    BOI: { label: 'Boi', icon: faOtter, bg: 'bg-gray-200', text: 'text-gray-800' },
    OVELHA: { label: 'Ovelha', icon: faKiwiBird, bg: 'bg-slate-100', text: 'text-slate-800' },
    CABRA: { label: 'Cabra', icon: faKiwiBird, bg: 'bg-emerald-100', text: 'text-emerald-800' },
    AVE_EXOTICA: {
      label: 'Ave Exótica',
      icon: faDove,
      bg: 'bg-orange-100',
      text: 'text-orange-800',
    },
    OUTRO: { label: 'Outro', icon: faQuestion, bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena a lista de raças exibida na página. */
  breeds = signal<Breed[]>([]);
  /** Controla a visibilidade do modal de criação/edição de raça. */
  isModalOpen = signal(false);
  /** Armazena a raça que está sendo editada. */
  editingBreed = signal<Breed | null>(null);
  /** Controla a visibilidade do modal de confirmação de exclusão. */
  isDeleteModalOpen = signal(false);
  /** Armazena a raça a ser excluída. */
  breedToDelete = signal<Breed | null>(null);
  /** Armazena a lista de espécies disponíveis para o filtro. */
  speciesList = signal<string[]>([]);

  // ===================================================================
  // ESTADO DOS FILTROS (SIGNALS)
  // ===================================================================
  /** Armazena o termo de busca digitado pelo usuário. */
  searchTerm = signal<string>('');
  /** Armazena a espécie selecionada para o filtro. */
  speciesFilter = signal<string>('all');

  // ===================================================================
  // LÓGICA REATIVA (RXJS)
  // ===================================================================
  /** Subject do RxJS para controlar o debounce da busca por nome. */
  private searchSubject = new Subject<string>();

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, carregando dados e configurando a busca com debounce. */
  ngOnInit(): void {
    this.loadInitialData();
    this.setupSearchDebounce();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS
  // ===================================================================

  /** Orquestra o carregamento dos dados iniciais da página. */
  loadInitialData(): void {
    this.loadBreeds();
    this.loadSpecies();
  }

  /** Carrega a lista de raças da API com base nos filtros atuais. */
  loadBreeds(): void {
    const filters = {
      name: this.searchTerm(),
      species: this.speciesFilter(),
    };
    this.breedService.findAll(filters).subscribe({
      next: (data) => this.breeds.set(data),
      error: (err) => this.notificationService.showError('Erro ao carregar lista de raças.'),
    });
  }

  /** Carrega a lista de espécies disponíveis para o filtro. */
  loadSpecies(): void {
    this.breedService.getSpecies().subscribe({
      next: (data) => this.speciesList.set(data),
      error: () => this.notificationService.showError('Erro ao carregar lista de espécies.'),
    });
  }

  // ===================================================================
  // MÉTODOS DE EVENTOS E LÓGICA REATIVA
  // ===================================================================

  /** Configura o observable que aguarda uma pausa na digitação para iniciar a busca. */
  setupSearchDebounce(): void {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((searchValue) => {
      this.searchTerm.set(searchValue);
      this.loadBreeds();
    });
  }

  /** Captura o evento de digitação no campo de busca e o emite no searchSubject. */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  /** Captura a mudança no filtro de espécies e recarrega a lista de raças. */
  onSpeciesFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.speciesFilter.set(value);
    this.loadBreeds();
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL DE FORMULÁRIO
  // ===================================================================

  /** Abre o modal para cadastrar uma nova raça. */
  openCreateModal(): void {
    this.editingBreed.set(null);
    this.isModalOpen.set(true);
  }

  /** Abre o modal para editar uma raça existente. */
  openEditModal(breed: Breed): void {
    this.editingBreed.set(breed);
    this.isModalOpen.set(true);
  }

  /** Fecha o modal de criação/edição. */
  closeModal(): void {
    this.isModalOpen.set(false);
  }

  /** Lida com o salvamento (criação ou atualização) de uma raça. */
  onSaveBreed(breedData: { name: string; species: string }): void {
    const breedSendoEditada = this.editingBreed();
    const action$ = breedSendoEditada
      ? this.breedService.update(breedSendoEditada.id, breedData)
      : this.breedService.create(breedData);
    const successMessage = breedSendoEditada
      ? 'Raça atualizada com sucesso!'
      : 'Raça cadastrada com sucesso!';
    const errorMessage = breedSendoEditada ? 'Erro ao atualizar raça.' : 'Erro ao cadastrar raça.';

    action$.subscribe({
      next: () => {
        this.notificationService.showSuccess(successMessage);
        this.closeModal();
        this.loadBreeds();
      },
      error: (err) => this.notificationService.showError(err.error?.message || errorMessage),
    });
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL DE EXCLUSÃO
  // ===================================================================

  /** Abre o modal de confirmação para excluir uma raça. */
  openDeleteModal(breed: Breed): void {
    this.breedToDelete.set(breed);
    this.isDeleteModalOpen.set(true);
  }

  /** Fecha o modal de confirmação de exclusão. */
  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.breedToDelete.set(null);
  }

  /** Confirma e executa a exclusão de uma raça. */
  onConfirmDelete(): void {
    const breed = this.breedToDelete();
    if (breed) {
      this.breedService.delete(breed.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Raça excluída com sucesso!');
          this.loadBreeds();
        },
        error: (err) =>
          this.notificationService.showError(err.error?.message || 'Erro ao excluir raça.'),
        complete: () => this.closeDeleteModal(),
      });
    }
  }
}
