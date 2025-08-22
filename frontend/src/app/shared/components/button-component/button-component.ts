import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'emp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = true;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() ariaLabel?: string;

  @HostBinding('class.full-width') get isFullWidth() {
    return this.fullWidth;
  }
}
