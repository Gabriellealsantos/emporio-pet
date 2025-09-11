// CÓDIGO COMPLETO PARA: src/app/features/components/employee-list-component/employee-list-component.ts

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

@Component({
  selector: 'app-employee-list-component',
  standalone: true,
  imports: [CommonModule, RouterLink, FaIconComponent, EmployeeFormComponent],
  templateUrl: './employee-list-component.html',
  styleUrls: ['./employee-list-component.css']
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  faUserPlus = faUserPlus;
  faSearch = faSearch;
  faEdit = faEdit;

  employees = signal<User[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  statusFilter = signal('all');
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  statusList = ['NON_BLOCKED', 'BLOCKED', 'INACTIVE', 'SUSPENDED'];
  private searchSubject = new Subject<string>();

  isEmployeeModalOpen = signal(false);

  openCreateEmployeeModal(): void {
    this.isEmployeeModalOpen.set(true);
  }

  closeEmployeeModal(): void {
    this.isEmployeeModalOpen.set(false);
  }

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

  ngOnInit(): void {
    this.loadEmployees();
    this.setupSearchDebounce();
  }

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

  setupSearchDebounce(): void {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(searchValue => {
        this.searchTerm.set(searchValue);
        this.loadEmployees();
      });
  }


  onSearchInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }


  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.loadEmployees();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadEmployees(page);
    }
  }

  translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'NON_BLOCKED': 'Ativo', 'BLOCKED': 'Bloqueado',
      'INACTIVE': 'Inativo', 'SUSPENDED': 'Suspenso'
    };
    return map[status] || status;
  }
}
