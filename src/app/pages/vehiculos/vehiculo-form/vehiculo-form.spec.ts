import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VehiculoForm } from './vehiculo-form';

describe('VehiculoForm', () => {
  let component: VehiculoForm;
  let fixture: ComponentFixture<VehiculoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculoForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiculoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
