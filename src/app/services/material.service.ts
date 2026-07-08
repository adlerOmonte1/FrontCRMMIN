import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { Material } from '@models/material';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private readonly api = inject(Api);
  private readonly resource = 'materiales';

  list(page?: number): Observable<PaginatedResponse<Material>> {
    return this.api.list<Material>(this.resource, page);
  }

  listAll(): Observable<Material[]> {
    return this.api.listAll<Material>(this.resource);
  }

  getById(id: number): Observable<Material> {
    return this.api.getById<Material>(this.resource, id);
  }

  create(material: Omit<Material, 'id'>): Observable<Material> {
    return this.api.create<Material>(this.resource, material);
  }

  update(id: number, material: Omit<Material, 'id'>): Observable<Material> {
    return this.api.update<Material>(this.resource, id, material);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /** Opciones para un <select> (usadas por Ticket al elegir material). */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(
      map((materiales) => materiales.map((m) => ({ id: m.id, label: `${m.nombre} (${m.tipo}) — ${m.lugar}` }))),
    );
  }
}
