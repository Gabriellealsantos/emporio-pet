import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Invoice } from '../../models/Invoice';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceDetailModalComponent } from '../../../shared/components/invoice-detail-modal/invoice-detail-modal';

// Interface para a estrutura da paginação retornada pela API
interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Página atual
  first: boolean;
  last: boolean;
}

@Component({
  selector: 'app-invoice-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent, InvoiceDetailModalComponent],
  templateUrl: './invoice-list-page-component.html',
  styleUrls: ['./invoice-list-page-component.css']
})
export class InvoiceListPageComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  // Signals para controlar o estado da tela
  invoices = signal<Invoice[]>([]);
  pagination = signal<any>({ number: 0, totalPages: 0 });
  isLoading = signal(true);

   selectedInvoiceIdForModal = signal<number | null>(null);

  // Formulário para os filtros
  filterForm: FormGroup;

  // Ícones
  faEye = faEye;

  constructor() {
    this.filterForm = this.fb.group({
      customerName: [''],
      minDate: [''],
      maxDate: [''],
      status: ['']
    });
  }

  openDetailModal(invoiceId: number): void {
    this.selectedInvoiceIdForModal.set(invoiceId);
  }

  closeDetailModal(): void {
    this.selectedInvoiceIdForModal.set(null);
  }

  ngOnInit(): void {
    this.fetchInvoices();
  }

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
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }


  onFilter(): void {
    this.fetchInvoices(0);
  }

  clearFilters(): void {
    this.filterForm.reset({ status: '' });
    this.fetchInvoices(0);
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.pagination().totalPages) {
      this.fetchInvoices(page);
    }
  }

  markAsPaid(invoiceId: number): void {
    this.invoiceService.markAsPaid(invoiceId).subscribe({
      next: () => {
        this.notificationService.showSuccess("Fatura marcada como paga!");
        this.fetchInvoices(this.pagination().number); // Recarrega a página atual
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || "Erro ao atualizar fatura.");
        console.error(err);
      }
    });
  }
}
