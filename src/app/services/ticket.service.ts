import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';
import { Ticket } from '@models/ticket';
import { soloFecha } from '@shared/fecha';

export type TicketCreacion = Omit<Ticket, 'id' | 'fecha_emision' | 'pesoNeto'>;

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly api = inject(Api);
  private readonly resource = 'tickets';

  list(page?: number): Observable<PaginatedResponse<Ticket>> {
    return this.api.list<Ticket>(this.resource, page);
  }

  listAll(): Observable<Ticket[]> {
    return this.api.listAll<Ticket>(this.resource);
  }

  getById(id: number): Observable<Ticket> {
    return this.api.getById<Ticket>(this.resource, id);
  }

  create(ticket: TicketCreacion): Observable<Ticket> {
    return this.api.create<Ticket>(this.resource, ticket);
  }

  update(id: number, ticket: TicketCreacion): Observable<Ticket> {
    return this.api.update<Ticket>(this.resource, id, ticket);
  }

  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  /**
   * Opciones para un <select> (usadas por GastoViaje al elegir a qué ticket
   * corresponde el gasto). La referencia útil para reconocer el ticket es
   * la fecha (solo el día, no la hora) y el peso — no el peso bruto exacto
   * a secas, que por sí solo no dice mucho.
   */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(
      map((tickets) =>
        tickets.map((t) => ({
          id: t.id,
          label: `Ticket #${t.id} — ${soloFecha(t.fecha_emision)} — ${t.pesoBruto} kg`,
        })),
      ),
    );
  }
}
