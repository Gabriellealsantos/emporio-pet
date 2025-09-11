import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Service } from '../../../features/models/Service';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent, NgxMaskPipe],
  providers: [provideNgxMask()],
  templateUrl: './services-form.html',
  styleUrls: ['../pet-form/pet-form.css']
})
export class ServicesFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() serviceToEdit: Service | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  serviceForm: FormGroup;
  faTimes = faTimes;

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0.01)]],
      estimatedDurationInMinutes: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceToEdit'] && this.serviceToEdit) {
      this.serviceForm.patchValue(this.serviceToEdit);
    }
  }

  onSave(): void {
    if (this.serviceForm.valid) {
      this.save.emit(this.serviceForm.value);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
