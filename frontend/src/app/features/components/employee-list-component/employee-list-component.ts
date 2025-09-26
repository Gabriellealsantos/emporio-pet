import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../models/User';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeFormComponent } from '../../../shared/components/employee-form/employee-form';
import { EmployeeInsert } from '../../models/EmployeeInsert';

/** Componente de página para visualização, busca e cadastro de funcionários. */
@Component({
  selector: 'app-employee-list-component',
  standalone: true,
  imports: [CommonModule, RouterLink, FaIconComponent, EmployeeFormComponent],
  templateUrl: './employee-list-component.html',
  styleUrls: ['./employee-list-component.css']
})
export class EmployeeListComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faUserPlus = faUserPlus;
  faSearch = faSearch;
  faEdit = faEdit;

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena a lista de funcionários exibida na página. */
  employees = signal<User[]>([]);
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);
  /** Controla a visibilidade do modal de cadastro de funcionário. */
  isEmployeeModalOpen = signal(false);

  // ===================================================================
  // ESTADO DOS FILTROS E PAGINAÇÃO (SIGNALS)
  // ===================================================================
  /** Armazena o termo de busca digitado pelo usuário. */
  searchTerm = signal('');
  /** Armazena o status selecionado para o filtro. */
  statusFilter = signal('all');
  /** Página atual da listagem. */
  currentPage = signal(0);
  /** Número total de páginas disponíveis. */
  totalPages = signal(0);
  /** Número total de funcionários encontrados. */
  totalElements = signal(0);

  // ===================================================================
  // PROPRIEDADES ESTÁTICAS E LÓGICA REATIVA
  // ===================================================================
  /** Lista de status para o dropdown de filtro. */
  statusList = ['NON_BLOCKED', 'BLOCKED', 'INACTIVE', 'SUSPENDED'];
  /** Subject do RxJS para controlar o debounce da busca por nome. */
  private searchSubject = new Subject<string>();

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, carregando funcionários e configurando a busca com debounce. */
  ngOnInit(): void {
    this.loadEmployees();
    this.setupSearchDebounce();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS E LÓGICA REATIVA
  // ===================================================================

  /** Carrega a lista paginada de funcionários da API com base nos filtros atuais. */
  loadEmployees(page: number = 0): void {
    this.isLoading.set(true);
    this.currentPage.set(page);
    const filters = {
      page: this.currentPage(),
      searchTerm: this.searchTerm(),
      status: this.statusFilter(),
    };

    this.employeeService.findAll(filters).subscribe({
      next: (pageResponse) => {
        this.employees.set(pageResponse.content);
        this.totalPages.set(pageResponse.totalPages);
        this.totalElements.set(pageResponse.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Erro ao carregar a lista de funcionários.');
        this.isLoading.set(false);
      }
    });
  }

  /** Configura o observable que aguarda uma pausa na digitação para iniciar a busca. */
  setupSearchDebounce(): void {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(searchValue => {
        this.searchTerm.set(searchValue);
        this.loadEmployees();
      });
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL
  // ===================================================================

  /** Abre o modal para cadastrar um novo funcionário. */
  openCreateEmployeeModal(): void {
    this.isEmployeeModalOpen.set(true);
  }

  /** Fecha o modal de cadastro de funcionário. */
  closeEmployeeModal(): void {
    this.isEmployeeModalOpen.set(false);
  }

  /** Lida com o salvamento de um novo funcionário a partir do modal. */
  onSaveEmployee(formData: EmployeeInsert): void {
    this.employeeService.create(formData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Funcionário cadastrado com sucesso!');
        this.closeEmployeeModal();
        this.loadEmployees();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Erro ao cadastrar funcionário.');
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE EVENTOS DA UI
  // ===================================================================

  /** Captura o evento de digitação no campo de busca e o emite no searchSubject. */
  onSearchInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  /** Captura a mudança no filtro de status e recarrega a lista de funcionários. */
  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.loadEmployees();
  }

  // ===================================================================
  // MÉTODOS DE PAGINAÇÃO E AUXILIARES
  // ===================================================================

  /** Navega para uma página específica da lista de funcionários. */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadEmployees(page);
    }
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
