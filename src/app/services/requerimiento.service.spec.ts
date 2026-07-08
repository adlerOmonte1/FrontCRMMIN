import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RequerimientoService } from './requerimiento.service';

describe('RequerimientoService', () => {
  let service: RequerimientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RequerimientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
