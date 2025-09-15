import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { CustomerService } from '../../../core/services/customer-service';
import { User } from '../../models/User';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../models/Appointment';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Invoice } from '../../models/Invoice';

@Component({
  selector: 'app-invoicing-page-component',
  standalone: true,
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe],
  templateUrl: './invoicing-page-component.html',
  styleUrl: './invoicing-page-component.css',
})
export class InvoicingPageComponent {
  private customerService = inject(CustomerService);
  private appointmentService = inject(AppointmentService);
  private invoiceService = inject(InvoiceService);
  private notificationService = inject(NotificationService);
  selectedAppointmentIds = signal(new Set<number>());

  currentStep = signal(1);
  searchResults = signal<User[]>([]);
  selectedCustomer = signal<User | null>(null);
  hasSearched = signal(false);
  faturableAppointments = signal<Appointment[]>([]);
  createdInvoice = signal<Invoice | null>(null);

  searchControl = new FormControl('', { nonNullable: true });

  faSearch = faSearch;
  faArrowLeft = faArrowLeft;

  handleSearch(): void {
    this.hasSearched.set(false);
    const searchTerm = this.searchControl.value.trim();
    if (!searchTerm) {
      this.searchResults.set([]);
      return;
    }

    // Usamos o serviço para buscar clientes. Pedimos só 5 resultados para uma busca rápida.
    this.customerService.findAll({ name: searchTerm, size: 5 }).subscribe({
      next: (page) => {
        this.searchResults.set(page.content);
        this.hasSearched.set(true);
      },
      error: (err) => {
        console.error('Erro ao buscar clientes:', err);
      },
    });
  }

  selectCustomer(customer: User): void {
    this.selectedCustomer.set(customer);
    this.searchResults.set([]);
    this.searchControl.setValue('');
    this.hasSearched.set(false);
    this.currentStep.set(2);
    this.loadFaturableAppointments(customer.id);

    // Futuramente, aqui chamaremos o método para carregar os agendamentos do cliente.
    // this.loadFaturableAppointments(customer.id);
  }

  totalSelected = computed(() => {
    const appointments = this.faturableAppointments();
    const selectedIds = this.selectedAppointmentIds();

    return appointments
      .filter((app) => selectedIds.has(app.id))
      .reduce((sum, app) => sum + app.service.price, 0);
  });

  isInvoiceButtonDisabled = computed(() => this.selectedAppointmentIds().size === 0);

  toggleSelection(appointmentId: number): void {
    this.selectedAppointmentIds.update((currentSet) => {
      const newSet = new Set(currentSet);
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId);
      } else {
        newSet.add(appointmentId);
      }
      return newSet;
    });
  }

  generateInvoice(): void {
    const selectedIds = Array.from(this.selectedAppointmentIds());
    const customerId = this.selectedCustomer()?.id;

    if (selectedIds.length === 0 || !customerId) {
      this.notificationService.showError("Nenhum serviço selecionado ou cliente inválido.");
      return;
    }

    const dto = { customerId: customerId, appointmentIds: selectedIds };

    this.invoiceService.create(dto).subscribe({
      next: (invoice) => {
        this.createdInvoice.set(invoice);
        this.currentStep.set(3);
        this.notificationService.showSuccess("Fatura gerada com sucesso!");
      },
      error: (err) => {
        console.error("Erro ao gerar fatura:", err);
        this.notificationService.showError(err.error?.message || "Erro ao gerar fatura.");
      }
    });
  }

  backToSearch(): void {
    this.currentStep.set(1);
    this.selectedCustomer.set(null);
    this.faturableAppointments.set([]);
  }

  cancelInvoice(): void {
    this.currentStep.set(1);
    this.selectedCustomer.set(null);
  }

  confirmPayment(): void {
    const invoiceId = this.createdInvoice()?.id;
    if (!invoiceId) return;

    this.invoiceService.markAsPaid(invoiceId).subscribe({
      next: () => {
        this.notificationService.showSuccess("Fatura marcada como paga!");
        this.backToSearch();
      },
      error: (err) => {
        console.error("Erro ao confirmar pagamento:", err);
        this.notificationService.showError(err.error?.message || "Erro ao confirmar pagamento.");
      }
    });
  }


  private loadFaturableAppointments(customerId: number): void {
    this.appointmentService.findFaturableByCustomer(customerId).subscribe({
      next: (appointments) => {
        this.faturableAppointments.set(appointments);
      },
      error: (err) => {
        console.error('Erro ao buscar agendamentos faturáveis:', err);
        this.notificationService.showError("Erro ao carregar serviços faturáveis.");
      },
    });
  }
}
