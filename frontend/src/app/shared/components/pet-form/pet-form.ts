import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Breed } from '../../../features/models/Breed';

import { Pet } from '../../../features/models/Pet';
import { BreedService } from '../../../core/services/breed.service';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent],
  templateUrl: './pet-form.html',
  styleUrls: ['./pet-form.css']
})

export class PetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private breedService = inject(BreedService);

  @Input() petToEdit: Pet | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  petForm: FormGroup;
  breeds: Breed[] = [];
  faTimes = faTimes;

  constructor() {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      breedId: [null, Validators.required],
      birthDate: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // A lógica agora está toda centralizada aqui
    this.loadBreedsAndPopulateForm();
  }

  loadBreedsAndPopulateForm(): void {
    this.breedService.findAll({}).subscribe(data => {
      // 1. A lista de raças chega e é armazenada
      this.breeds = data;

      // 2. SOMENTE AGORA, depois que temos as raças, verificamos se estamos editando um pet
      if (this.petToEdit) {
        // 3. Se estivermos editando, preenchemos o formulário.
        //    Agora, a opção da raça correta já existe no dropdown.
        this.petForm.patchValue({
          name: this.petToEdit.name,
          breedId: this.petToEdit.breed?.id,
          birthDate: this.petToEdit.birthDate,
          notes: this.petToEdit.notes
        });
      }
    });
  }

  onSave(): void {
    if (this.petForm.valid) {
      this.save.emit(this.petForm.value);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
