import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '@core/services/api';
import { Mantenimiento } from '@models/mantenimiento';
import { PaginatedResponse } from '@models/pagination';

/**
 * `descripcion` es opcional: el backend le pone "Sin descripción" cuando no
 * se envía la clave (no cuando se envía vacía — un CharField sin
 * `blank=True` rechaza "" con 400). Por eso se omite del payload cuando el
 * usuario no completó el campo, en vez de mandar un string vacío.
 */
export type MantenimientoCreacion = Omit<Mantenimiento, 'id' | 'descripcion'> & { descripcion?: string };

@Injectable({
  providedIn: 'root',
})
export class MantenimientoService {
  private readonly api = inject(Api);
  private readonly resource = 'mantenimientos';

  list(page?: number): Observable<PaginatedResponse<Mantenimiento>> {
    return this.api.list<Mantenimiento>(this.resource, page);
  }

  listAll(): Observable<Mantenimiento[]> {
    return this.api.listAll<Mantenimiento>(this.resource);
  }

  getById(id: number): Observable<Mantenimiento> {
    return this.api.getById<Mantenimiento>(this.resource, id);
  }

  create(mantenimiento: MantenimientoCreacion): Observable<Mantenimiento> {
    return this.api.create<Mantenimiento>(this.resource, mantenimiento);
  }

  update(id: number, mantenimiento: MantenimientoCreacion): Observable<Mantenimiento> {
    return this.api.update<Mantenimiento>(this.resource, id, mantenimiento);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
