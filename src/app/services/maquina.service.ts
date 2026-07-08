import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { MAQUINA_SIN_ESPECIFICAR, Maquina } from '@models/maquina';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';

@Injectable({
  providedIn: 'root',
})
export class MaquinaService {
  private readonly api = inject(Api);
  private readonly resource = 'maquinas';

  list(page?: number): Observable<PaginatedResponse<Maquina>> {
    return this.api.list<Maquina>(this.resource, page);
  }

  listAll(): Observable<Maquina[]> {
    return this.api.listAll<Maquina>(this.resource);
  }

  getById(id: number): Observable<Maquina> {
    return this.api.getById<Maquina>(this.resource, id);
  }

  create(maquina: Omit<Maquina, 'id'>): Observable<Maquina> {
    return this.api.create<Maquina>(this.resource, maquina);
  }

  update(id: number, maquina: Omit<Maquina, 'id'>): Observable<Maquina> {
    return this.api.update<Maquina>(this.resource, id, maquina);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /** Opciones para un <select> (usadas por DetalleInventario y Mantenimiento). */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(map((maquinas) => maquinas.map((m) => ({ id: m.id, label: this.armarLabel(m) }))));
  }

  private armarLabel(maquina: Maquina): string {
    const detalles = [
      maquina.marca !== MAQUINA_SIN_ESPECIFICAR ? maquina.marca : null,
      maquina.nro_serie !== MAQUINA_SIN_ESPECIFICAR ? `S/N ${maquina.nro_serie}` : null,
    ].filter((d): d is string => d !== null);

    return detalles.length > 0 ? `${maquina.nombre} — ${detalles.join(', ')}` : maquina.nombre;
  }
}
