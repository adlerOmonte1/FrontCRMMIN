import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DetalleRequerimientoService } from './detalle-requerimiento.service';

describe('DetalleRequerimientoService', () => {
  let service: DetalleRequerimientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DetalleRequerimientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
