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
      // Validação existente, está correta
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],

      // 👇 VALIDAÇÃO REMOVIDA DAQUI
      price: [null],
      estimatedDurationInMinutes: [null],

      // 👇 VALIDAÇÃO ADICIONADA AQUI
      priceDisplay: ['', [Validators.required]],
      durationDisplay: ['', [Validators.required]],

      imageFile: [null]
    });
  }

  get f() { return this.serviceForm.controls; }

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
      // 👇 LÓGICA ADICIONADA AQUI 👇
      const priceText = this.serviceForm.get('priceDisplay')?.value || '';
      const durationText = this.serviceForm.get('durationDisplay')?.value || '';

      // Extrai o primeiro número do texto
      const extractedPrice = priceText.match(/\d+/)?.[0] || 0;
      const extractedDuration = durationText.match(/\d+/)?.[0] || 0;

      // Atualiza os campos escondidos com os valores numéricos
      this.serviceForm.patchValue({
        price: Number(extractedPrice),
        estimatedDurationInMinutes: Number(extractedDuration)
      });

      // Lógica de emissão que já tínhamos
      const serviceData = { ...this.serviceForm.value };
      const imageFile = serviceData.imageFile;
      delete serviceData.imageFile;

      this.save.emit({ serviceData, imageFile });
    }
  }


  onClose(): void {
    this.close.emit();
  }
}
