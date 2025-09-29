import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faStar, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { Appointment } from '../../models/Appointment';
import { AppointmentService } from '../../../core/services/appointment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Page } from '../../models/PageModel';
import { ReviewModalComponent } from "../../../shared/components/review-modal/review-modal";
import { InvoiceDetailModalComponent } from "../../../shared/components/invoice-detail-modal/invoice-detail-modal";
import { AppointmentStatus } from '../../models/AppointmentStatus';
import { InvoiceStatus } from '../../models/InvoiceStatus';

/** Validador customizado para garantir que a data final não seja anterior à data inicial. */
export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const minDate = control.get('minDate')?.value;
  const maxDate = control.get('maxDate')?.value;
  return minDate && maxDate && new Date(maxDate) < new Date(minDate) ? { dateRange: true } : null;
};

/** Componente de página que exibe o histórico de agendamentos do cliente logado. */
@Component({
  selector: 'app-customer-appointment-history',
  standalone: true,
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule, ReviewModalComponent, InvoiceDetailModalComponent],
  templateUrl: './customer-appointment-history-component.html',
  styleUrls: ['./customer-appointment-history-component.css'],
})
export class CustomerAppointmentHistoryComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  // ===================================================================
  // ESTADO DO COMPONENTE (SIGNALS)
  // ===================================================================
  /** Armazena a lista de agendamentos da página atual. */
  appointments = signal<Appointment[]>([]);
  /** Armazena os dados de paginação (página atual, total de páginas, etc.). */
  pagination = signal<any>({ number: 0, totalPages: 0, totalElements: 0 });
  /** Controla o estado de carregamento da página. */
  isLoading = signal(true);
  /** Armazena o ID do agendamento sendo avaliado para controlar o modal de review. */
  reviewingAppointmentId = signal<number | null>(null);
  /** Armazena o ID da fatura sendo visualizada para controlar o modal de fatura. */
  viewingInvoiceId = signal<number | null>(null);

  // ===================================================================
  // ÍCONES E PROPRIEDADES ESTÁTICAS
  // ===================================================================
  faStar = faStar;
  faCommentDots = faCommentDots;
  /** Lista de status para o dropdown de filtro. */
  statusList: AppointmentStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'NO_SHOW'];
  /** Formulário reativo para os filtros de data e status do histórico. */
  filterForm: FormGroup;

  // ===================================================================
  // CONSTRUTOR E CICLO DE VIDA
  // ===================================================================
  constructor() {
    this.filterForm = this.fb.group(
      {
        minDate: [''],
        maxDate: [''],
        status: ['']
      },
      { validators: dateRangeValidator }
    );
  }

  /** Inicializa o componente, carregando o histórico de agendamentos. */
  ngOnInit(): void {
    this.loadHistory();
  }

  // ===================================================================
  // MÉTODOS DE CARREGAMENTO E FILTRAGEM DE DADOS
  // ===================================================================

  /** Carrega o histórico de agendamentos da API com base nos filtros e na página atual. */
  loadHistory(page: number = 0): void {
    if (this.filterForm.invalid) {
      this.notificationService.showError('O intervalo de datas é inválido.');
      return;
    }
    this.isLoading.set(true);
    const formValues = this.filterForm.value;

    const filters = {
      page,
      minDate: formValues.minDate || null,
      maxDate: formValues.maxDate || null,
      status: formValues.status || null
    };

    this.appointmentService.findMyAppointments(filters).subscribe({
      next: (response: Page<Appointment>) => {
        this.appointments.set(response.content);
        this.pagination.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Erro ao carregar o histórico.');
        this.isLoading.set(false);
      },
    });
  }

  /** Dispara a recarga do histórico a partir da primeira página ao aplicar os filtros. */
  onFilter(): void {
    this.loadHistory(0);
  }

  /** Navega para uma página específica do histórico. */
  onPageChange(page: number): void {
    if (page >= 0 && page < this.pagination().totalPages) {
      this.loadHistory(page);
    }
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL DE AVALIAÇÃO (REVIEW)
  // ===================================================================

  /** Abre o modal para o cliente avaliar um agendamento. */
  openReviewModal(appointmentId: number): void {
    this.reviewingAppointmentId.set(appointmentId);
  }

  /** Fecha o modal de avaliação. */
  closeReviewModal(): void {
    this.reviewingAppointmentId.set(null);
  }

  /** Chamado após uma avaliação ser enviada, fecha o modal e recarrega a lista. */
  handleReviewSubmitted(): void {
    this.closeReviewModal();
    this.loadHistory(this.pagination().number);
  }

  // ===================================================================
  // MÉTODOS DE CONTROLE DO MODAL DE FATURA (INVOICE)
  // ===================================================================

  /** Abre o modal para visualizar os detalhes de uma fatura. */
  openInvoiceModal(invoiceId: number): void {
    this.viewingInvoiceId.set(invoiceId);
  }

  /** Fecha o modal de detalhes da fatura. */
  closeInvoiceModal(): void {
    this.viewingInvoiceId.set(null);
  }

  // ===================================================================
  // MÉTODOS AUXILIARES
  // ===================================================================

  /** Cria um array com base na nota para renderizar os ícones de estrela. */
  getStarsArray(rating: number): any[] {
    return new Array(rating);
  }

  /** Traduz uma chave de status para um texto legível em português. */
  translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'SCHEDULED': 'Agendado',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluído',
      'CANCELED': 'Cancelado',
      'NO_SHOW': 'Não Compareceu'
    };
    return map[status] || status;
  }

   /** Traduz uma chave de status da FATURA para um texto legível em português. */
  translateInvoiceStatus(status: InvoiceStatus | undefined | null): string {
    if (!status) return ''; // Se não houver status, não retorna nada.

    const map: { [key in InvoiceStatus]: string } = {
      'PENDING': 'Pendente',
      'AWAITING_PAYMENT': 'Pendente', // Trata AWAITING_PAYMENT como Pendente
      'PAID': 'Pago',
      'CANCELED': 'Cancelado'
    };
    return map[status] || status;
  }
}
