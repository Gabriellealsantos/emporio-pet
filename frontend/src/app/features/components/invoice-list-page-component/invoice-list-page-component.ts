import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Invoice } from '../../models/Invoice';
import { InvoiceDetailModalComponent } from '../../../shared/components/invoice-detail-modal/invoice-detail-modal';
import { NgxMaskPipe, NgxMaskDirective } from 'ngx-mask'; // NgxMaskDirective precisa ser importado aqui também

/** Define a estrutura genérica de uma resposta paginada da API. */
interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** Componente de página para visualização e filtragem de faturas. */
@Component({
  selector: 'app-invoice-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent, InvoiceDetailModalComponent, NgxMaskPipe, NgxMaskDirective], // NgxMaskDirective adicionado
  templateUrl: './invoice-list-page-component.html',
  styleUrls: ['./invoice-list-page-component.css']
})
export class InvoiceListPageComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private invoiceService = inject(InvoiceService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  invoices = signal<Invoice[]>([]);
  pagination = signal<any>({ number: 0, totalPages: 0 });
  isLoading = signal(true);
  selectedInvoiceIdForModal = signal<number | null>(null);

  // ===================================================================
  // FORMULÁRIO E ÍCONES
  // ===================================================================
  filterForm: FormGroup;
  faEye = faEye;

  // ===================================================================
  // CONSTRUTOR E CICLO DE VIDA
  // ===================================================================
  constructor() {
    // --- FORMULÁRIO ATUALIZADO ---
    this.filterForm = this.fb.group({
      searchType: ['NAME'], // Controla o radio button
      searchTerm: [''],     // Campo unificado para nome ou CPF
      minDate: [''],
      maxDate: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.fetchInvoices();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO E FILTRAGEM DE DADOS
  // ===================================================================

  /** Busca a lista paginada de faturas da API com base nos filtros atuais. */
  fetchInvoices(page: number = 0): void {
    this.isLoading.set(true);
    const formValues = this.filterForm.value;

    // --- LÓGICA DE FILTROS ATUALIZADA ---
    const filters: any = {
      minDate: formValues.minDate || null,
      maxDate: formValues.maxDate || null,
      status: formValues.status || null
    };

    // Adiciona o termo de busca genérico se ele existir
    if (formValues.searchTerm && formValues.searchTerm.trim() !== '') {
        // Se for CPF, remove a máscara antes de enviar
        const term = formValues.searchType === 'CPF'
            ? formValues.searchTerm.replace(/\D/g, '')
            : formValues.searchTerm;
        filters.searchTerm = term;
    }

    this.invoiceService.findFiltered(filters, page).subscribe({
      next: (response: Page<Invoice>) => {
        this.invoices.set(response.content);
        this.pagination.set({
          number: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          first: response.first,
          last: response.last
        });
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.notificationService.showError("Erro ao buscar faturas.");
        this.isLoading.set(false);
      }
    });
  }

  onFilter(): void {
    this.fetchInvoices(0);
  }

  /** NOVO MÉTODO: Limpa o campo de busca ao trocar o tipo de pesquisa */
  onSearchTypeChange(): void {
    this.filterForm.get('searchTerm')?.setValue('');
  }

  clearFilters(): void {
    // --- ATUALIZADO PARA O NOVO FORMULÁRIO ---
    this.filterForm.reset({ searchType: 'NAME', status: '', searchTerm: '', minDate: '', maxDate: '' });
    this.fetchInvoices(0);
  }

  // ===================================================================
  // MÉTODOS DE AÇÃO E PAGINAÇÃO
  // ===================================================================

  markAsPaid(invoiceId: number): void {
    this.invoiceService.markAsPaid(invoiceId).subscribe({
      next: () => {
        this.notificationService.showSuccess("Fatura marcada como paga!");
        this.fetchInvoices(this.pagination().number);
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || "Erro ao atualizar fatura.");
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.pagination().totalPages) {
      this.fetchInvoices(page);
    }
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL
  // ===================================================================

  openDetailModal(invoiceId: number): void {
    this.selectedInvoiceIdForModal.set(invoiceId);
  }

  closeDetailModal(): void {
    this.selectedInvoiceIdForModal.set(null);
  }
}
