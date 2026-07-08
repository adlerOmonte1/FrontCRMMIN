import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EncargadoService } from './encargado.service';

describe('EncargadoService', () => {
  let service: EncargadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EncargadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
