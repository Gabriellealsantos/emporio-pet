import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faStar, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Appointment } from '../../models/Appointment';
import { AppointmentService } from '../../../core/services/appointment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Page } from '../../models/PageModel';
import { ReviewModalComponent } from "../../../shared/components/review-modal/review-modal";
import { InvoiceDetailModalComponent } from "../../../shared/components/invoice-detail-modal/invoice-detail-modal";
import { AppointmentStatus } from '../../models/AppointmentStatus';

export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const minDate = control.get('minDate')?.value;
  const maxDate = control.get('maxDate')?.value;
  return minDate && maxDate && new Date(maxDate) < new Date(minDate) ? { dateRange: true } : null;
};

@Component({
  selector: 'app-customer-appointment-history',
  standalone: true,
  imports: [CommonModule, FaIconComponent, ReactiveFormsModule, ReviewModalComponent, InvoiceDetailModalComponent],
  templateUrl: './customer-appointment-history-component.html',
  styleUrls: ['./customer-appointment-history-component.css'],
})
export class CustomerAppointmentHistoryComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  appointments = signal<Appointment[]>([]);
  pagination = signal<any>({ number: 0, totalPages: 0, totalElements: 0 });
  isLoading = signal(true);
  filterForm: FormGroup;

  faStar = faStar;
  faCommentDots = faCommentDots;

  statusList: AppointmentStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'NO_SHOW'];

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

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(page: number = 0): void {
    if (this.filterForm.invalid) {
      this.notificationService.showError('O intervalo de datas é inválido.');
      return;
    }
    this.isLoading.set(true);
    const formValues = this.filterForm.value;

    // 👇 AJUSTE: Garante que estamos passando a estrutura de filtros correta
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
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  onFilter(): void {
    this.loadHistory(0);
  }

  reviewingAppointmentId = signal<number | null>(null);

  openReviewModal(appointmentId: number): void {
    this.reviewingAppointmentId.set(appointmentId);
  }

  closeReviewModal(): void {
    this.reviewingAppointmentId.set(null);
  }

  handleReviewSubmitted(): void {
    this.closeReviewModal();
    this.loadHistory(this.pagination().number); // Recarrega a lista
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.pagination().totalPages) {
      this.loadHistory(page);
    }
  }

  getStarsArray(rating: number): any[] {
    return new Array(rating);
  }

  viewingInvoiceId = signal<number | null>(null);

  openInvoiceModal(invoiceId: number): void {
    this.viewingInvoiceId.set(invoiceId);
  }

  closeInvoiceModal(): void {
    this.viewingInvoiceId.set(null);
  }

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

}
