import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GastoViaje } from '@models/gasto-viaje';
import { OpcionSelect } from '@models/opcion-select';
import { GastoViajeService } from '@services/gasto-viaje.service';
import { TicketService } from '@services/ticket.service';
import { coincideTexto } from '@shared/busqueda';

interface GastoViajeFila extends GastoViaje {
  etiquetaTicket: string;
}

@Component({
  selector: 'app-gasto-viaje-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './gasto-viaje-list.html',
})
export class GastoViajeList {
  private readonly gastoViajeService = inject(GastoViajeService);
  private readonly ticketService = inject(TicketService);

  protected readonly gastos = signal<GastoViajeFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly gastosFiltrados = computed(() =>
    this.gastos().filter((g) => coincideTexto(this.busqueda(), g.etiquetaTicket, g.descripcion, g.consumo, g.monto)),
  );

  constructor() {
    this.cargarGastos();
  }

  protected eliminar(gasto: GastoViaje): void {
    const confirmado = confirm(`¿Eliminar este gasto de viaje? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.gastoViajeService.remove(gasto.id).subscribe({
      next: () => this.gastos.update((lista) => lista.filter((g) => g.id !== gasto.id)),
      error: () => this.error.set('No se pudo eliminar el gasto de viaje.'),
    });
  }

  private cargarGastos(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      gastos: this.gastoViajeService.list(),
      tickets: this.ticketService.listConLabel(),
    }).subscribe({
      next: ({ gastos, tickets }) => {
        const etiquetaPorId = new Map<number, string>(tickets.map((t: OpcionSelect) => [t.id, t.label]));
        this.gastos.set(
          gastos.results.map((g) => ({
            ...g,
            etiquetaTicket: etiquetaPorId.get(g.ticket) ?? `Ticket #${g.ticket}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de gastos de viaje. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
