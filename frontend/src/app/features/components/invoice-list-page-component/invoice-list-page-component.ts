import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Invoice } from '../../models/Invoice';
import { InvoiceDetailModalComponent } from '../../../shared/components/invoice-detail-modal/invoice-detail-modal';

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
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent, InvoiceDetailModalComponent],
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
  /** Armazena a lista de faturas exibida na página. */
  invoices = signal<Invoice[]>([]);
  /** Armazena os dados de paginação da lista de faturas. */
  pagination = signal<any>({ number: 0, totalPages: 0 });
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);
  /** Armazena o ID da fatura selecionada para exibição no modal de detalhes. */
  selectedInvoiceIdForModal = signal<number | null>(null);

  // ===================================================================
  // FORMULÁRIO E ÍCONES
  // ===================================================================
  /** Formulário reativo para os filtros da lista de faturas. */
  filterForm: FormGroup;
  /** Ícone para o botão de visualização. */
  faEye = faEye;

  // ===================================================================
  // CONSTRUTOR E CICLO DE VIDA
  // ===================================================================
  constructor() {
    this.filterForm = this.fb.group({
      customerName: [''],
      minDate: [''],
      maxDate: [''],
      status: ['']
    });
  }

  /** Inicializa o componente, buscando a lista inicial de faturas. */
  ngOnInit(): void {
    this.fetchInvoices();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO E FILTRAGEM DE DADOS
  // ===================================================================

  /** Busca a lista paginada de faturas da API com base nos filtros atuais. */
  fetchInvoices(page: number = 0): void {
    this.isLoading.set(true);
    const filters = this.filterForm.value;

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

  /** Dispara a recarga da lista de faturas a partir da primeira página ao aplicar os filtros. */
  onFilter(): void {
    this.fetchInvoices(0);
  }

  /** Limpa os filtros aplicados e recarrega a lista de faturas. */
  clearFilters(): void {
    this.filterForm.reset({ status: '' });
    this.fetchInvoices(0);
  }

  // ===================================================================
  // MÉTODOS DE AÇÃO E PAGINAÇÃO
  // ===================================================================

  /** Marca uma fatura como paga e recarrega a lista. */
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

  /** Navega para uma página específica da lista de faturas. */
  onPageChange(page: number): void {
    if (page >= 0 && page < this.pagination().totalPages) {
      this.fetchInvoices(page);
    }
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL
  // ===================================================================

  /** Abre o modal para exibir os detalhes de uma fatura. */
  openDetailModal(invoiceId: number): void {
    this.selectedInvoiceIdForModal.set(invoiceId);
  }

  /** Fecha o modal de detalhes da fatura. */
  closeDetailModal(): void {
    this.selectedInvoiceIdForModal.set(null);
  }
}
