import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '@core/services/api';
import { DetalleInventario } from '@models/detalle-inventario';
import { PaginatedResponse } from '@models/pagination';

export type DetalleInventarioCreacion = Omit<DetalleInventario, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class DetalleInventarioService {
  private readonly api = inject(Api);
  private readonly resource = 'detalle_inventario';

  list(page?: number): Observable<PaginatedResponse<DetalleInventario>> {
    return this.api.list<DetalleInventario>(this.resource, page);
  }

  listAll(): Observable<DetalleInventario[]> {
    return this.api.listAll<DetalleInventario>(this.resource);
  }

  getById(id: number): Observable<DetalleInventario> {
    return this.api.getById<DetalleInventario>(this.resource, id);
  }

  create(detalle: DetalleInventarioCreacion): Observable<DetalleInventario> {
    return this.api.create<DetalleInventario>(this.resource, detalle);
  }

  update(id: number, detalle: DetalleInventarioCreacion): Observable<DetalleInventario> {
    return this.api.update<DetalleInventario>(this.resource, id, detalle);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
