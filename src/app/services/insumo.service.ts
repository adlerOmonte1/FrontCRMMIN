import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { Insumo } from '@models/insumo';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';

@Injectable({
  providedIn: 'root',
})
export class InsumoService {
  private readonly api = inject(Api);
  private readonly resource = 'insumos';

  list(page?: number): Observable<PaginatedResponse<Insumo>> {
    return this.api.list<Insumo>(this.resource, page);
  }

  listAll(): Observable<Insumo[]> {
    return this.api.listAll<Insumo>(this.resource);
  }

  getById(id: number): Observable<Insumo> {
    return this.api.getById<Insumo>(this.resource, id);
  }

  create(insumo: Omit<Insumo, 'id'>): Observable<Insumo> {
    return this.api.create<Insumo>(this.resource, insumo);
  }

  update(id: number, insumo: Omit<Insumo, 'id'>): Observable<Insumo> {
    return this.api.update<Insumo>(this.resource, id, insumo);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /** Opciones para un <select> (usadas por DetalleInventario). */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(
      map((insumos) => insumos.map((i) => ({ id: i.id, label: `${i.nombre} (${i.categoria})` }))),
    );
  }
}
