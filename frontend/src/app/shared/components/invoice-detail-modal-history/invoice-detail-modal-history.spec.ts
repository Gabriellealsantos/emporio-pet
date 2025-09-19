import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailModalHistory } from './invoice-detail-modal-history';

describe('InvoiceDetailModalHistory', () => {
  let component: InvoiceDetailModalHistory;
  let fixture: ComponentFixture<InvoiceDetailModalHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailModalHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailModalHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
