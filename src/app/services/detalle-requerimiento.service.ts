import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '@core/services/api';
import { DetalleRequerimiento } from '@models/detalle-requerimiento';
import { PaginatedResponse } from '@models/pagination';

export type DetalleRequerimientoCreacion = Omit<DetalleRequerimiento, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class DetalleRequerimientoService {
  private readonly api = inject(Api);
  private readonly resource = 'detalle_requerimientos';

  list(page?: number): Observable<PaginatedResponse<DetalleRequerimiento>> {
    return this.api.list<DetalleRequerimiento>(this.resource, page);
  }

  listAll(): Observable<DetalleRequerimiento[]> {
    return this.api.listAll<DetalleRequerimiento>(this.resource);
  }

  getById(id: number): Observable<DetalleRequerimiento> {
    return this.api.getById<DetalleRequerimiento>(this.resource, id);
  }

  create(detalle: DetalleRequerimientoCreacion): Observable<DetalleRequerimiento> {
    return this.api.create<DetalleRequerimiento>(this.resource, detalle);
  }

  update(id: number, detalle: DetalleRequerimientoCreacion): Observable<DetalleRequerimiento> {
    return this.api.update<DetalleRequerimiento>(this.resource, id, detalle);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
