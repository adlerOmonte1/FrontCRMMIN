import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculoForm } from './vehiculo-form';

describe('VehiculoForm', () => {
  let component: VehiculoForm;
  let fixture: ComponentFixture<VehiculoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
