import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../models/User';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerService } from '../../../core/services/customer-service';
import { NgxMaskPipe } from 'ngx-mask';

/** Componente de página para visualização e busca de clientes. */
@Component({
  selector: 'app-client-page-component',
  standalone: true,
  imports: [CommonModule, FaIconComponent, RouterLink, NgxMaskPipe],
  templateUrl: './client-page-component.html',
  styleUrls: ['./client-page-component.css']
})
export class ClientPageComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private customerService = inject(CustomerService);
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
  /** Armazena a lista de clientes exibida na página. */
  clients = signal<User[]>([]);
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);

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
  /** Número total de clientes encontrados. */
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

  /** Inicializa o componente, carregando clientes e configurando a busca com debounce. */
  ngOnInit(): void {
    this.loadClients();
    this.setupSearchDebounce();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO DE DADOS E LÓGICA REATIVA
  // ===================================================================

  /** Carrega a lista paginada de clientes da API com base nos filtros atuais. */
  loadClients(page: number = 0): void {
    this.isLoading.set(true);
    this.currentPage.set(page);

    const filters = {
      page: this.currentPage(),
      name: this.searchTerm(),
      status: this.statusFilter()
    };

    this.customerService.findAll(filters).subscribe({
      next: (pageResponse) => {
        this.clients.set(pageResponse.content);
        this.totalPages.set(pageResponse.totalPages);
        this.totalElements.set(pageResponse.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Erro ao carregar a lista de clientes.');
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
      this.searchTerm.set(searchValue);
      this.loadClients();
    });
  }

  // ===================================================================
  // MÉTODOS DE EVENTOS DA UI
  // ===================================================================

  /** Captura o evento de digitação no campo de busca e o emite no searchSubject. */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  /** Captura a mudança no filtro de status e recarrega a lista de clientes. */
  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.loadClients();
  }

  // ===================================================================
  // MÉTODOS DE PAGINAÇÃO E AUXILIARES
  // ===================================================================

  /** Navega para uma página específica da lista de clientes. */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadClients(page);
    }
  }

  /** Traduz uma chave de status para um texto legível em português. */
  translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'NON_BLOCKED': 'Ativo',
      'BLOCKED': 'Bloqueado',
      'INACTIVE': 'Inativo',
      'SUSPENDED': 'Suspenso'
    };
    return map[status] || status;
  }
}
