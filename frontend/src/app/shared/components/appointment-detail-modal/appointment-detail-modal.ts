import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes, faStar } from '@fortawesome/free-solid-svg-icons';
import { Appointment } from '../../../features/models/Appointment';


@Component({
  selector: 'app-appointment-detail-modal',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './appointment-detail-modal.html',
  styleUrls: ['../invoice-detail-modal/invoice-detail-modal.css']
})
export class AppointmentDetailModalComponent {
  // Recebe o objeto completo do agendamento do componente pai
  @Input() appointment: Appointment | null = null;
  @Output() close = new EventEmitter<void>();

  faTimes = faTimes;
  faStar = faStar;

  closeModal(): void {
    this.close.emit();
  }

  getStarsArray(rating: number): any[] {
    return new Array(rating);
  }
}
