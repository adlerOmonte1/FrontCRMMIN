import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { Encargado } from '@models/encargado';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';
import { EmpleadoService } from './empleado.service';

/**
 * El "actor" que casi todos los módulos operativos (Ticket, Inventario,
 * Mantenimiento, Reporte, Requerimientos) registran a su nombre — ver
 * docs/01-arquitectura-frontend.md del backend.
 */
@Injectable({
  providedIn: 'root',
})
export class EncargadoService {
  private readonly api = inject(Api);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly resource = 'encargados';

  list(page?: number): Observable<PaginatedResponse<Encargado>> {
    return this.api.list<Encargado>(this.resource, page);
  }

  listAll(): Observable<Encargado[]> {
    return this.api.listAll<Encargado>(this.resource);
  }

  getById(id: number): Observable<Encargado> {
    return this.api.getById<Encargado>(this.resource, id);
  }

  create(encargado: Omit<Encargado, 'id'>): Observable<Encargado> {
    return this.api.create<Encargado>(this.resource, encargado);
  }

  update(id: number, encargado: Omit<Encargado, 'id'>): Observable<Encargado> {
    return this.api.update<Encargado>(this.resource, id, encargado);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /** Opciones para un <select> (usadas por Ticket, Inventario, Mantenimiento, Reporte, Requerimientos). */
  listConLabel(): Observable<OpcionSelect[]> {
    return forkJoin({
      encargados: this.listAll(),
      empleados: this.empleadoService.listAll(),
    }).pipe(
      map(({ encargados, empleados }) => {
        const nombrePorId = new Map(empleados.map((e) => [e.id, `${e.nombre} ${e.apellido}`]));
        return encargados.map((enc) => ({
          id: enc.id,
          label: `${nombrePorId.get(enc.empleado) ?? `Empleado #${enc.empleado}`} — ${enc.area}`,
        }));
      }),
    );
  }
}
