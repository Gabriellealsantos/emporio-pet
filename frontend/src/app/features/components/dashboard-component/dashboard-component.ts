import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowUp,
  faCalendarDay,
  faUserPlus,
  faDollarSign,
  faCalendarCheck,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FaIconComponent],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css']
})
export class DashboardComponent {
  // Expondo os ícones para o template
  faArrowUp = faArrowUp;
  faCalendarDay = faCalendarDay;
  faUserPlus = faUserPlus;
  faDollarSign = faDollarSign;
  faCalendarCheck = faCalendarCheck;
  faShoppingCart = faShoppingCart;
}
