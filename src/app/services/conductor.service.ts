import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { Conductor } from '@models/conductor';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';
import { EmpleadoService } from './empleado.service';

@Injectable({
  providedIn: 'root',
})
export class ConductorService {
  private readonly api = inject(Api);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly resource = 'conductores';

  list(page?: number): Observable<PaginatedResponse<Conductor>> {
    return this.api.list<Conductor>(this.resource, page);
  }

  listAll(): Observable<Conductor[]> {
    return this.api.listAll<Conductor>(this.resource);
  }

  getById(id: number): Observable<Conductor> {
    return this.api.getById<Conductor>(this.resource, id);
  }

  create(conductor: Omit<Conductor, 'id'>): Observable<Conductor> {
    return this.api.create<Conductor>(this.resource, conductor);
  }

  update(id: number, conductor: Omit<Conductor, 'id'>): Observable<Conductor> {
    return this.api.update<Conductor>(this.resource, id, conductor);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /**
   * Opciones para un <select> (usadas por Ticket al elegir conductor).
   * El backend no serializa anidado, así que el nombre del empleado se
   * resuelve acá, uniendo del lado del cliente con /api/empleados/.
   */
  listConLabel(): Observable<OpcionSelect[]> {
    return forkJoin({
      conductores: this.listAll(),
      empleados: this.empleadoService.listAll(),
    }).pipe(
      map(({ conductores, empleados }) => {
        const nombrePorId = new Map(empleados.map((e) => [e.id, `${e.nombre} ${e.apellido}`]));
        return conductores.map((c) => ({
          id: c.id,
          label: `${nombrePorId.get(c.empleado) ?? `Empleado #${c.empleado}`} — Lic. ${c.licencia}`,
        }));
      }),
    );
  }
}
