import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentDetailModal } from './appointment-detail-modal';

describe('AppointmentDetailModal', () => {
  let component: AppointmentDetailModal;
  let fixture: ComponentFixture<AppointmentDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
