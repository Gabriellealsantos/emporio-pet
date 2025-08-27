import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button-component/button-component';
import { AuthService } from '../../../core/services/auth.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { take } from 'rxjs';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FaIconComponent],
  templateUrl: './onboarding-component.html',
  styleUrls: ['./onboarding-component.css']
})
export class OnboardingComponent implements OnInit {
  pawIcon = faPaw;
  private authService = inject(AuthService);
  private router = inject(Router);

  userName: string = 'Amigo Pet';

  ngOnInit(): void {

    this.authService.getCurrentUser().pipe(take(1)).subscribe(user => {
      if (user && user.name) {
        this.userName = user.name.split(' ')[0];
      }
    });
  }

  goToPetRegistration(): void {
    this.router.navigate(['/pets/cadastrar']);
  }
}
