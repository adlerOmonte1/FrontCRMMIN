import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {Api} from '@core/services/api'
import { Vehiculo } from '@models/vehiculo';
import { PaginatedResponse } from '@models/pagination';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly api = inject(Api)
  private readonly resource = 'vehiculos';
  // listar vehiculos
  list (page?: number): Observable<PaginatedResponse<Vehiculo>>{
    return this.api.list<Vehiculo>(this.resource, page)
  }
  // obtener vehiculo por id
  getById(id:number): Observable<Vehiculo>{
    return this.api.getById<Vehiculo>(this.resource, id);
  }
  create (vehiculo: Omit<Vehiculo, 'id'>):Observable<Vehiculo>{
    return this.api.create<Vehiculo>(this.resource, vehiculo)
  }
  update (id:number, vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo>{
    return this.api.update<Vehiculo>(this.resource, id, vehiculo)
  }
  remove (id:number) : Observable<void>{
    return this.api.remove(this.resource, id);
  }


}
