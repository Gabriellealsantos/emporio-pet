import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Importe Location
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faIdCard, faPhone, faCalendar, faCog, faHeart, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../models/User';
import { NotificationService } from '../../../core/services/notification.service';
import { NgxMaskDirective } from 'ngx-mask';
import { CustomerService } from '../../../core/services/customer-service';
import { PetService } from '../../../core/services/PetService';
import { PetFormComponent } from '../../../shared/components/pet-form/pet-form';
import { Pet } from '../../models/Pet';

@Component({
  selector: 'app-client-detail-component',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FaIconComponent, NgxMaskDirective, PetFormComponent],
  templateUrl: './client-detail-component.html',
  styleUrls: ['./client-detail-component.css']
})
export class ClientDetailComponent implements OnInit {

  private petService = inject(PetService);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private location = inject(Location); // Para o botão "Voltar"

  // Signals de estado
  client = signal<User | null>(null);
  isLoading = signal(true);
  isPetModalOpen = signal(false);
  editingPet = signal<Pet | null>(null);

  // Ícones
  faUser = faUser; faEnvelope = faEnvelope; faIdCard = faIdCard; faPhone = faPhone;
  faCalendar = faCalendar; faCog = faCog; faHeart = faHeart; faPlus = faPlus; faArrowLeft = faArrowLeft;

  // Formulário
  clientForm: FormGroup;

  // Lista de status para o dropdown
  statusList = ['NON_BLOCKED', 'BLOCKED', 'INACTIVE', 'SUSPENDED'];

  constructor() {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }], // Email não pode ser editado
      cpf: ['', Validators.required],
      phone: ['', Validators.required],
      birthDate: [''],
      status: ['']
    });
  }

  openCreatePetModal(): void {
    this.editingPet.set(null);
    this.isPetModalOpen.set(true);
  }

  openEditPetModal(pet: Pet): void {
    this.editingPet.set(pet);
    this.isPetModalOpen.set(true);
  }

  closePetModal(): void {
    this.isPetModalOpen.set(false);
  }

  onSavePet(petData: any): void {
    const petSendoEditado = this.editingPet();
    const ownerId = this.client()?.id;
    if (!ownerId) return;

    if (petSendoEditado) {
      // Lógica de ATUALIZAÇÃO
      this.petService.update(petSendoEditado.id, petData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Pet atualizado com sucesso!');
          this.closePetModal();
          this.loadClientData(ownerId); // Recarrega os dados do cliente
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao atualizar pet.')
      });
    } else {
      // Lógica de CRIAÇÃO
      const payload = { ...petData, ownerId };
      this.petService.adminCreate(payload).subscribe({
        next: () => {
          this.notificationService.showSuccess('Pet cadastrado com sucesso!');
          this.closePetModal();
          this.loadClientData(ownerId); // Recarrega os dados do cliente
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao cadastrar pet.')
      });
    }
  }


  ngOnInit(): void {
    const clientId = this.route.snapshot.params['id'];
    if (clientId) {
      this.loadClientData(clientId);
    }
  }

  loadClientData(id: number): void {
    this.isLoading.set(true);
    this.customerService.findById(id).subscribe({
      next: (data) => {
        this.client.set(data);
        this.clientForm.patchValue({
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          birthDate: data.birthDate,
          status: data.userStatus
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Cliente não encontrado.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.notificationService.showError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    const clientId = this.client()?.id;
    if (clientId) {
      this.customerService.update(clientId, this.clientForm.value).subscribe({
        next: (updatedClient) => {
          this.client.set(updatedClient);
          this.notificationService.showSuccess('Cliente atualizado com sucesso!');
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao atualizar cliente.')
      });
    }
  }

  onStatusChange(event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    const clientId = this.client()?.id;
    if (clientId && newStatus) {
      this.customerService.updateStatus(clientId, newStatus).subscribe({
        next: (updatedClient) => {
          this.client.set(updatedClient);
          this.notificationService.showSuccess(`Status do cliente alterado para ${this.translateStatus(newStatus)}!`);
        },
        error: (err) => this.notificationService.showError(err.error?.message || 'Erro ao alterar status.')
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'NON_BLOCKED': 'Ativo', 'BLOCKED': 'Bloqueado',
      'INACTIVE': 'Inativo', 'SUSPENDED': 'Suspenso'
    };
    return map[status] || status;
  }
}
