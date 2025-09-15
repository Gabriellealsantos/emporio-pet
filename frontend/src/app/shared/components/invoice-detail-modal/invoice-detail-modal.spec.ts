import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailModal } from './invoice-detail-modal';

describe('InvoiceDetailModal', () => {
  let component: InvoiceDetailModal;
  let fixture: ComponentFixture<InvoiceDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
