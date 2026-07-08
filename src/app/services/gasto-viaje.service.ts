import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '@core/services/api';
import { GastoViaje } from '@models/gasto-viaje';
import { PaginatedResponse } from '@models/pagination';

export type GastoViajeCreacion = Omit<GastoViaje, 'id' | 'fecha'>;

@Injectable({
  providedIn: 'root',
})
export class GastoViajeService {
  private readonly api = inject(Api);
  private readonly resource = 'gastos_viaje';

  list(page?: number): Observable<PaginatedResponse<GastoViaje>> {
    return this.api.list<GastoViaje>(this.resource, page);
  }

  listAll(): Observable<GastoViaje[]> {
    return this.api.listAll<GastoViaje>(this.resource);
  }

  getById(id: number): Observable<GastoViaje> {
    return this.api.getById<GastoViaje>(this.resource, id);
  }

  create(gasto: GastoViajeCreacion): Observable<GastoViaje> {
    return this.api.create<GastoViaje>(this.resource, gasto);
  }

  update(id: number, gasto: GastoViajeCreacion): Observable<GastoViaje> {
    return this.api.update<GastoViaje>(this.resource, id, gasto);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
