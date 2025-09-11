// Em src/app/features/components/client-page-component/client-page-component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importe o RouterLink
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../models/User';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerService } from '../../../core/services/customer-service';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-client-page-component',
  standalone: true,
  imports: [CommonModule, FaIconComponent, RouterLink, NgxMaskPipe],
  templateUrl: './client-page-component.html',
  styleUrls: ['./client-page-component.css']
})
export class ClientPageComponent implements OnInit {
  private customerService = inject(CustomerService);
  private notificationService = inject(NotificationService);

  // Ícones
  faUserPlus = faUserPlus;
  faSearch = faSearch;
  faEdit = faEdit;

  // Signals de estado
  clients = signal<User[]>([]);
  isLoading = signal(true);

  // Signals para filtros e paginação
  searchTerm = signal('');
  statusFilter = signal('all');
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  // Lista de status para o dropdown (baseado no seu Enum UserStatus.java)
  statusList = ['NON_BLOCKED', 'BLOCKED', 'INACTIVE', 'SUSPENDED'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadClients();
    this.setupSearchDebounce();
  }

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

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchTerm.set(searchValue);
      this.loadClients(); // Reinicia a busca da página 0
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.loadClients(); // Reinicia a busca da página 0
  }

  // Métodos de paginação
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadClients(page);
    }
  }

  // Função para traduzir o status para exibição
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
