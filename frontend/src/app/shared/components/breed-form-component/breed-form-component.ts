import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCat, faDog } from '@fortawesome/free-solid-svg-icons';
import { Breed } from '../../../features/models/Breed';
import { BreedService } from '../../../core/services/breed-service';

@Component({
  selector: 'app-breed-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './breed-form-component.html',
  styleUrls: ['./breed-form-component.css']
})
export class BreedFormComponent implements OnChanges {

  private breedService = inject(BreedService);

  speciesOptions: string[] = [];

  @Input() breed: Breed | null = null;


  @Output() close = new EventEmitter<void>();


  @Output() save = new EventEmitter<Breed>();

  form: FormGroup;
  faDog = faDog;
  faCat = faCat;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      species: [null, Validators.required]
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    // Limpa o formulário ao mudar de "editar" para "criar"
    if (!this.breed && !changes['breed']?.firstChange) {
      this.form.reset({ id: null, name: '', species: null });
    }
    // Preenche o formulário ao receber uma raça para editar
    else if (this.breed && changes['breed']) {
      this.form.patchValue(this.breed);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  ngOnInit(): void {
    this.breedService.getSpecies().subscribe(species => {
      this.speciesOptions = species;

      if (this.breed) {
        this.form.patchValue(this.breed);
      }
    });
  }

}
