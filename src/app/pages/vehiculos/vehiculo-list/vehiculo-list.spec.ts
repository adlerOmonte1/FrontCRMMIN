import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VehiculoList } from './vehiculo-list';

describe('VehiculoList', () => {
  let component: VehiculoList;
  let fixture: ComponentFixture<VehiculoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculoList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiculoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
