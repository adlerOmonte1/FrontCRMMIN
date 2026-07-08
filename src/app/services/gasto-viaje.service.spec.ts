import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GastoViajeService } from './gasto-viaje.service';

describe('GastoViajeService', () => {
  let service: GastoViajeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GastoViajeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
