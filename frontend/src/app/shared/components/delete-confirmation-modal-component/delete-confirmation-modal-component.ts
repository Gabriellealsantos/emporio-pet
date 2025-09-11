// Em src/app/shared/components/delete-confirmation-modal/delete-confirmation-modal.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [FaIconComponent],
  templateUrl: './delete-confirmation-modal-component.html',
  styleUrls: ['./delete-confirmation-modal-component.css']
})
export class DeleteConfirmationModalComponent {
  @Input() itemName: string = 'este item';

  @Output() confirm = new EventEmitter<void>();

  @Output() close = new EventEmitter<void>();

  faTimes = faTimes;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

  onConfirm(): void {
    this.confirm.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
