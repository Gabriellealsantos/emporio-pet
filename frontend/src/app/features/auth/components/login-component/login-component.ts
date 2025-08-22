import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../../../shared/components/button-component/button-component';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css'],
})
export class LoginComponent {}
