import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoPaypal } from './pago-paypal';

describe('PagoPaypal', () => {
  let component: PagoPaypal;
  let fixture: ComponentFixture<PagoPaypal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoPaypal]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PagoPaypal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
