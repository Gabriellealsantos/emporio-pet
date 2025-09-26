import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { AuthService } from '../../../core/services/auth.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { take } from 'rxjs';

/** Componente da página de onboarding para novos clientes sem pets cadastrados. */
@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FaIconComponent],
  templateUrl: './onboarding-component.html',
  styleUrls: ['./onboarding-component.css']
})
export class OnboardingComponent implements OnInit {
  // ===================================================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ===================================================================
  private authService = inject(AuthService);
  private router = inject(Router);

  // ===================================================================
  // ESTADO DO COMPONENTE E ÍCONES
  // ===================================================================
  /** Armazena o primeiro nome do usuário para a mensagem de boas-vindas. */
  userName: string = 'Amigo Pet';
  /** Ícone de pata para uso no template. */
  pawIcon = faPaw;

  // ===================================================================
  // MÉTODOS DO CICLO DE VIDA
  // ===================================================================

  /** Inicializa o componente, buscando o nome do usuário para personalizar a saudação. */
  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(take(1)).subscribe(user => {
      if (user && user.name) {
        this.userName = user.name.split(' ')[0];
      }
    });
  }

  // ===================================================================
  // MÉTODOS DE NAVEGAÇÃO
  // ===================================================================

  /** Navega o usuário para a página de cadastro de pets. */
  goToPetRegistration(): void {
    this.router.navigate(['/pets/cadastrar']);
  }
}
