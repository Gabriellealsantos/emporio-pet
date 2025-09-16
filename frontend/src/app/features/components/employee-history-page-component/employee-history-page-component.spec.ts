import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeHistoryPageComponent } from './employee-history-page-component';

describe('EmployeeHistoryPageComponent', () => {
  let component: EmployeeHistoryPageComponent;
  let fixture: ComponentFixture<EmployeeHistoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeHistoryPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeHistoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
