import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAppointmentHistoryComponent } from './customer-appointment-history-component';

describe('CustomerAppointmentHistoryComponent', () => {
  let component: CustomerAppointmentHistoryComponent;
  let fixture: ComponentFixture<CustomerAppointmentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAppointmentHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerAppointmentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
