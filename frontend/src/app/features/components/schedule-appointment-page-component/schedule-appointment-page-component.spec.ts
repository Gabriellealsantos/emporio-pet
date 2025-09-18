import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAppointmentPageComponent } from './schedule-appointment-page-component';

describe('ScheduleAppointmentPageComponent', () => {
  let component: ScheduleAppointmentPageComponent;
  let fixture: ComponentFixture<ScheduleAppointmentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleAppointmentPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAppointmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
