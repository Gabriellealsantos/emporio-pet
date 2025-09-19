import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { ReviewService } from '../../../core/services/review.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ReviewInsertDTO } from '../../../features/models/ReviewInsertDTO';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent],
  templateUrl: './review-modal.html',
  styleUrls: ['./review-modal.css'] // Garanta que o nome do arquivo CSS está correto
})
export class ReviewModalComponent {
  private fb = inject(FormBuilder);
  private reviewService = inject(ReviewService);
  private notificationService = inject(NotificationService);

  @Input() appointmentId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviewForm: FormGroup;
  hoveredStars = signal(0);

  // Ícones para as estrelas
  faSolidStar = faSolidStar;
  faRegularStar = faRegularStar;

  constructor() {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]], // A nota deve ser de no mínimo 1
      comment: ['', Validators.required]
    });
  }

  setRating(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
  }

  onSubmit(): void {
    if (this.reviewForm.invalid || !this.appointmentId) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const dto: ReviewInsertDTO = this.reviewForm.value;

    this.reviewService.create(this.appointmentId, dto).subscribe({
      next: () => {
        this.notificationService.showSuccess("Avaliação enviada com sucesso!");
        this.reviewSubmitted.emit(); // Avisa o componente pai que a avaliação foi enviada
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || "Erro ao enviar avaliação.");
        console.error(err);
      }
    });
  }
}
