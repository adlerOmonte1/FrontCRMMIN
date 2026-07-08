import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';
import { ESTADO_ATENDIDO, Requerimiento } from '@models/requerimiento';

export type RequerimientoCreacion = Omit<Requerimiento, 'id' | 'fecha'>;

@Injectable({
  providedIn: 'root',
})
export class RequerimientoService {
  private readonly api = inject(Api);
  private readonly resource = 'requerimientos';

  list(page?: number): Observable<PaginatedResponse<Requerimiento>> {
    return this.api.list<Requerimiento>(this.resource, page);
  }

  listAll(): Observable<Requerimiento[]> {
    return this.api.listAll<Requerimiento>(this.resource);
  }

  getById(id: number): Observable<Requerimiento> {
    return this.api.getById<Requerimiento>(this.resource, id);
  }

  create(requerimiento: RequerimientoCreacion): Observable<Requerimiento> {
    return this.api.create<Requerimiento>(this.resource, requerimiento);
  }

  update(id: number, requerimiento: RequerimientoCreacion): Observable<Requerimiento> {
    return this.api.update<Requerimiento>(this.resource, id, requerimiento);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /** Acción rápida del listado: marca el requerimiento como atendido sin pasar por el formulario completo. */
  marcarComoAtendido(id: number): Observable<Requerimiento> {
    return this.api.patch<Requerimiento>(this.resource, id, { estado: ESTADO_ATENDIDO });
  }

  /** Opciones para un <select> (usadas por DetalleRequerimiento al elegir a qué cabecera pertenece). */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(
      map((requerimientos) => requerimientos.map((r) => ({ id: r.id, label: `Requerimiento #${r.id} — ${r.estado}` }))),
    );
  }
}
