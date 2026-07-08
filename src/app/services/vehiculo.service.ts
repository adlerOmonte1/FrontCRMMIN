import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { Vehiculo } from '@models/vehiculo';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly api = inject(Api);
  private readonly resource = 'vehiculos';

  list(page?: number): Observable<PaginatedResponse<Vehiculo>> {
    return this.api.list<Vehiculo>(this.resource, page);
  }

  listAll(): Observable<Vehiculo[]> {
    return this.api.listAll<Vehiculo>(this.resource);
  }

  getById(id: number): Observable<Vehiculo> {
    return this.api.getById<Vehiculo>(this.resource, id);
  }

  create(vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo> {
    return this.api.create<Vehiculo>(this.resource, vehiculo);
  }

  update(id: number, vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo> {
    return this.api.update<Vehiculo>(this.resource, id, vehiculo);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /** Opciones para un <select>, usadas por Ticket/Mantenimiento (volquete) al elegir un vehículo. */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(
      map((vehiculos) => vehiculos.map((v) => ({ id: v.id, label: `${v.placa} — ${v.marca} ${v.modelo}` }))),
    );
  }
}
