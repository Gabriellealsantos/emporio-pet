import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPetListComponent } from './customer-pet-list-component';

describe('CustomerPetListComponent', () => {
  let component: CustomerPetListComponent;
  let fixture: ComponentFixture<CustomerPetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPetListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerPetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
