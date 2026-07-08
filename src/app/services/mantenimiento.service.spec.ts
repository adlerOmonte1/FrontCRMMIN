import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MantenimientoService } from './mantenimiento.service';

describe('MantenimientoService', () => {
  let service: MantenimientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MantenimientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
