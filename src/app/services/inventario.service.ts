import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { Inventario } from '@models/inventario';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';

export type InventarioCreacion = Omit<Inventario, 'id' | 'fechaInventario'>;

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private readonly api = inject(Api);
  private readonly resource = 'inventario';

  list(page?: number): Observable<PaginatedResponse<Inventario>> {
    return this.api.list<Inventario>(this.resource, page);
  }

  listAll(): Observable<Inventario[]> {
    return this.api.listAll<Inventario>(this.resource);
  }

  getById(id: number): Observable<Inventario> {
    return this.api.getById<Inventario>(this.resource, id);
  }

  create(inventario: InventarioCreacion): Observable<Inventario> {
    return this.api.create<Inventario>(this.resource, inventario);
  }

  update(id: number, inventario: InventarioCreacion): Observable<Inventario> {
    return this.api.update<Inventario>(this.resource, id, inventario);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /** Opciones para un <select> (usadas por DetalleInventario al elegir a qué cabecera pertenece). */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(
      map((inventarios) => inventarios.map((i) => ({ id: i.id, label: `Inventario #${i.id} — ${i.lugar}` }))),
    );
  }
}
