import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DetalleInventarioService } from './detalle-inventario.service';

describe('DetalleInventarioService', () => {
  let service: DetalleInventarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DetalleInventarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
