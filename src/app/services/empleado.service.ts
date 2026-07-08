import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '@core/services/api';
import { Empleado } from '@models/empleado';
import { PaginatedResponse } from '@models/pagination';

/**
 * Acceso a datos del recurso /api/empleados/.
 *
 * Deliberadamente delgado: toda la mecánica HTTP vive en Api (inyectado, no
 * instanciado a mano, para poder sustituirlo en tests). Este es el patrón a
 * copiar para las otras 14 entidades del backend — ver
 * docs/03-guia-nuevo-modulo.md.
 */
@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private readonly api = inject(Api);
  private readonly resource = 'empleados';

  list(page?: number): Observable<PaginatedResponse<Empleado>> {
    return this.api.list<Empleado>(this.resource, page);
  }

  getById(id: number): Observable<Empleado> {
    return this.api.getById<Empleado>(this.resource, id);
  }

  create(empleado: Omit<Empleado, 'id'>): Observable<Empleado> {
    return this.api.create<Empleado>(this.resource, empleado);
  }

  update(id: number, empleado: Omit<Empleado, 'id'>): Observable<Empleado> {
    return this.api.update<Empleado>(this.resource, id, empleado);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
