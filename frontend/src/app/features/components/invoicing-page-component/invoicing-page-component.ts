import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
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

/** Validador: só permite nomes sem número e sem espaço inicial */
function nameSearchValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  if (/^\s/.test(value)) {
    return { leadingSpace: true };
  }
  if (/\d/.test(value)) {
    return { containsNumber: true };
  }
  return null;
}

/** Componente de página para o fluxo de faturamento, da busca do cliente à geração da fatura. */
@Component({
  selector: 'app-invoicing-page-component',
  standalone: true,
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe],
  templateUrl: './invoicing-page-component.html',
  styleUrl: './invoicing-page-component.css',
})
export class InvoicingPageComponent {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private customerService = inject(CustomerService);
  private appointmentService = inject(AppointmentService);
  private invoiceService = inject(InvoiceService);
  private notificationService = inject(NotificationService);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  currentStep = signal(1);
  searchResults = signal<User[]>([]);
  selectedCustomer = signal<User | null>(null);
  hasSearched = signal(false);
  faturableAppointments = signal<Appointment[]>([]);
  createdInvoice = signal<Invoice | null>(null);
  selectedAppointmentIds = signal(new Set<number>());

  // ===================================================================
  // FORMULÁRIOS E SIGNALS COMPUTADOS
  // ===================================================================
  /** Tipo de busca: nome ou cpf */
  searchTypeControl = new FormControl<'name' | 'cpf'>('name', { nonNullable: true });

  /** Campo de busca, com validação dinâmica */
  searchControl = new FormControl('', { nonNullable: true });

  /** Valor total dos serviços selecionados */
  totalSelected = computed(() => {
    const appointments = this.faturableAppointments();
    const selectedIds = this.selectedAppointmentIds();
    return appointments
      .filter((app) => selectedIds.has(app.id))
      .reduce((sum, app) => sum + app.service.price, 0);
  });

  /** Desabilita botão de fatura se nada estiver selecionado */
  isInvoiceButtonDisabled = computed(() => this.selectedAppointmentIds().size === 0);

  // ===================================================================
  // ÍCONES
  // ===================================================================
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;

  // ===================================================================
  // MÉTODOS DE AÇÃO DO FLUXO
  // ===================================================================
  handleSearch(): void {
    this.hasSearched.set(false);
    const searchTerm = this.searchControl.value.trim();
    if (!searchTerm) {
      this.searchResults.set([]);
      return;
    }

    this.customerService.findAll({ name: searchTerm, size: 5 }).subscribe({
      next: (page) => {
        this.searchResults.set(page.content);
        this.hasSearched.set(true);
      },
      error: (err) => console.error('Erro ao buscar clientes:', err),
    });
  }

  selectCustomer(customer: User): void {
    this.selectedCustomer.set(customer);
    this.searchResults.set([]);
    this.searchControl.setValue('');
    this.hasSearched.set(false);
    this.currentStep.set(2);
    this.loadFaturableAppointments(customer.id);
  }

  toggleSelection(appointmentId: number): void {
    this.selectedAppointmentIds.update((currentSet) => {
      const newSet = new Set(currentSet);
      if (newSet.has(appointmentId)) newSet.delete(appointmentId);
      else newSet.add(appointmentId);
      return newSet;
    });
  }

  generateInvoice(): void {
    const selectedIds = Array.from(this.selectedAppointmentIds());
    const customerId = this.selectedCustomer()?.id;

    if (selectedIds.length === 0 || !customerId) {
      this.notificationService.showError('Nenhum serviço selecionado ou cliente inválido.');
      return;
    }

    const dto = { customerId: customerId, appointmentIds: selectedIds };
    this.invoiceService.create(dto).subscribe({
      next: (invoice) => {
        this.createdInvoice.set(invoice);
        this.currentStep.set(3);
        this.notificationService.showSuccess('Fatura gerada com sucesso!');
      },
      error: (err) =>
        this.notificationService.showError(err.error?.message || 'Erro ao gerar fatura.'),
    });
  }

  confirmPayment(): void {
    const invoiceId = this.createdInvoice()?.id;
    if (!invoiceId) return;

    this.invoiceService.markAsPaid(invoiceId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Fatura marcada como paga!');
        this.backToSearch();
      },
      error: (err) =>
        this.notificationService.showError(err.error?.message || 'Erro ao confirmar pagamento.'),
    });
  }

  // ===================================================================
  // NAVEGAÇÃO / RESET
  // ===================================================================
  backToSearch(): void {
    this.currentStep.set(1);
    this.selectedCustomer.set(null);
    this.faturableAppointments.set([]);
    this.createdInvoice.set(null);
    this.selectedAppointmentIds.set(new Set());
  }

  cancelInvoice(): void {
    this.backToSearch();
  }

  // ===================================================================
  // PRIVADOS
  // ===================================================================
  private loadFaturableAppointments(customerId: number): void {
    this.appointmentService.findFaturableByCustomer(customerId).subscribe({
      next: (appointments) => this.faturableAppointments.set(appointments),
      error: (err) => {
        console.error('Erro ao buscar agendamentos faturáveis:', err);
        this.notificationService.showError('Erro ao carregar serviços faturáveis.');
      },
    });
  }

  /** Máscaras customizadas para ngx-mask */
  protected readonly customMaskPatterns = {
    'L': { pattern: new RegExp('[a-zA-ZÀ-ú ]') },
    '0': { pattern: new RegExp('\\d') }
  };

  // ===================================================================
  // CONSTRUTOR: liga validação dinâmica
  // ===================================================================
  constructor() {
    this.searchTypeControl.valueChanges.subscribe((type) => {
      if (type === 'name') {
        this.searchControl.setValidators([nameSearchValidator]);
      } else {
        this.searchControl.clearValidators();
      }
      this.searchControl.updateValueAndValidity();
    });
  }
}
