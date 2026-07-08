import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '@core/services/api';
import { PaginatedResponse } from '@models/pagination';
import { Reporte } from '@models/reporte';

export type ReporteCreacion = Omit<Reporte, 'id' | 'fecha'>;

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly api = inject(Api);
  private readonly resource = 'reportes';

  list(page?: number): Observable<PaginatedResponse<Reporte>> {
    return this.api.list<Reporte>(this.resource, page);
  }

  listAll(): Observable<Reporte[]> {
    return this.api.listAll<Reporte>(this.resource);
  }

  getById(id: number): Observable<Reporte> {
    return this.api.getById<Reporte>(this.resource, id);
  }

  create(reporte: ReporteCreacion): Observable<Reporte> {
    return this.api.create<Reporte>(this.resource, reporte);
  }

  update(id: number, reporte: ReporteCreacion): Observable<Reporte> {
    return this.api.update<Reporte>(this.resource, id, reporte);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
