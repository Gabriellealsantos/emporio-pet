import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewModalComponent } from './review-modal';

describe('ReviewModal', () => {
  let component: ReviewModalComponent;
  let fixture: ComponentFixture<ReviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
