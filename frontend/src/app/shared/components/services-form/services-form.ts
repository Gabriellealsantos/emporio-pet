import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Service } from '../../../features/models/Service';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent],
  templateUrl: './services-form.html',
  styleUrls: ['../pet-form/pet-form.css']
})
export class ServicesFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() serviceToEdit: Service | null = null;
  @Output() save = new EventEmitter<{ serviceData: any; imageFile: File | null }>();
  @Output() close = new EventEmitter<void>();

  serviceForm: FormGroup;
  faTimes = faTimes;
  fileName: string | null = null; // Para mostrar o nome do arquivo selecionado

  constructor() {
    this.serviceForm = this.fb.group({
      // Campos existentes
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0.01)]],
      estimatedDurationInMinutes: [null, [Validators.required, Validators.min(1)]],

      // 👇 CAMPOS ADICIONADOS
      priceDisplay: [''],
      durationDisplay: [''],
      imageFile: [null] // Campo para controlar o arquivo da imagem
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceToEdit'] && this.serviceToEdit) {
      // Usamos patchValue para preencher os campos existentes
      this.serviceForm.patchValue(this.serviceToEdit);
    }
  }

  // 👇 MÉTODO ADICIONADO para capturar o arquivo
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileName = file.name;
      this.serviceForm.patchValue({ imageFile: file });
    }
  }

  onSave(): void {
    if (this.serviceForm.valid) {
      // 👇 LÓGICA DE SALVAR ATUALIZADA
      // Separamos os dados de texto do arquivo da imagem
      const serviceData = { ...this.serviceForm.value };
      const imageFile = serviceData.imageFile;
      delete serviceData.imageFile; // Removemos a referência do arquivo do objeto principal

      // Emitimos um objeto contendo ambas as partes
      this.save.emit({ serviceData, imageFile });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
