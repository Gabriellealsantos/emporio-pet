import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../features/models/Invoice';


@Component({
  selector: 'app-invoice-detail-modal',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './invoice-detail-modal.html',
  styleUrls: ['./invoice-detail-modal.css']
})
export class InvoiceDetailModalComponent implements OnChanges {
  private invoiceService = inject(InvoiceService);

  @Input() invoiceId: number | null = null;
  @Output() close = new EventEmitter<void>();

  invoice = signal<Invoice | null>(null);
  isLoading = signal(true);
  faTimes = faTimes;

  ngOnChanges(changes: SimpleChanges): void {
    // Este método é chamado sempre que um @Input (como 'invoiceId') muda.
    if (changes['invoiceId'] && this.invoiceId) {
      this.loadInvoiceDetails(this.invoiceId);
    }
  }

  loadInvoiceDetails(id: number): void {
    this.isLoading.set(true);
    this.invoiceService.findById(id).subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Em um caso real, mostraríamos uma notificação de erro.
        this.isLoading.set(false);
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
