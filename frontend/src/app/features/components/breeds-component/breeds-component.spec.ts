import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreedsPageComponent } from './breeds-component';


describe('BreedsComponent', () => {
  let component: BreedsPageComponent;
  let fixture: ComponentFixture<BreedsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreedsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreedsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
