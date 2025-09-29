import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Service } from '../../../features/models/Service';


/** Validador que verifica se o campo de texto contém pelo menos um número. */
export const containsNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null; // Deixa a validação 'required' cuidar de campos vazios
  }
  const valid = /\d/.test(control.value); // Testa se existe algum dígito
  return valid ? null : { noNumber: true };
};

/** Validador que verifica o tamanho máximo de um arquivo. */
export function fileSizeValidator(maxSizeInMb: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;
    if (!file) {
      return null; // Se não há arquivo, não valida
    }
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;
    return file.size > maxSizeInBytes ? { fileSize: true } : null;
  };
}

// ===================================================================
// COMPONENTE
// ===================================================================

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
  fileName: string | null = null;

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [null],
      estimatedDurationInMinutes: [null],

      // Validação aprimorada para garantir que haja números
      priceDisplay: ['', [Validators.required, containsNumberValidator]],
      durationDisplay: ['', [Validators.required, containsNumberValidator]],

      // Validação de tamanho máximo do arquivo (2MB)
      imageFile: [null, [fileSizeValidator(2)]]
    });
  }

  get f() { return this.serviceForm.controls; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceToEdit'] && this.serviceToEdit) {
      this.serviceForm.patchValue(this.serviceToEdit);
      // Ao EDITAR: a imagem é opcional, então limpamos o validador 'required'
      this.serviceForm.get('imageFile')?.clearValidators();
      this.serviceForm.get('imageFile')?.addValidators([fileSizeValidator(2)]); // Mantém o de tamanho
    } else {
      // Ao CRIAR: a imagem é obrigatória
      this.serviceForm.get('imageFile')?.setValidators([Validators.required, fileSizeValidator(2)]);
    }
    // Atualiza o estado de validação do campo
    this.serviceForm.get('imageFile')?.updateValueAndValidity();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileName = file.name;
      this.serviceForm.patchValue({ imageFile: file });
      this.serviceForm.get('imageFile')?.markAsTouched(); // Marca como 'tocado' para exibir erros
    }
  }

  onSave(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched(); // Garante que todos os erros apareçam
      return;
    }

    const priceText = this.serviceForm.get('priceDisplay')?.value || '';
    const durationText = this.serviceForm.get('durationDisplay')?.value || '';

    const extractedPrice = priceText.match(/\d+/)?.[0] || 0;
    const extractedDuration = durationText.match(/\d+/)?.[0] || 0;

    this.serviceForm.patchValue({
      price: Number(extractedPrice),
      estimatedDurationInMinutes: Number(extractedDuration)
    });

    const serviceData = { ...this.serviceForm.value };
    const imageFile = serviceData.imageFile;
    delete serviceData.imageFile; // Remove o File do objeto de dados do serviço

    this.save.emit({ serviceData, imageFile });
  }

  onClose(): void {
    this.close.emit();
  }
}
