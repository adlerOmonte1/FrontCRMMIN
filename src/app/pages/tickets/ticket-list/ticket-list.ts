import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { OpcionSelect } from '@models/opcion-select';
import { Ticket } from '@models/ticket';
import { ConductorService } from '@services/conductor.service';
import { EncargadoService } from '@services/encargado.service';
import { MaterialService } from '@services/material.service';
import { TicketService } from '@services/ticket.service';
import { VehiculoService } from '@services/vehiculo.service';
import { coincideTexto } from '@shared/busqueda';
import { kgATon } from '@shared/peso';

interface TicketFila extends Ticket {
  nombreConductor: string;
  nombreVehiculo: string;
  nombreEncargado: string;
  nombreMaterial: string;
}

function aMapa(opciones: OpcionSelect[]): Map<number, string> {
  return new Map(opciones.map((o) => [o.id, o.label]));
}

@Component({
  selector: 'app-ticket-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './ticket-list.html',
})
export class TicketList {
  private readonly ticketService = inject(TicketService);
  private readonly conductorService = inject(ConductorService);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly encargadoService = inject(EncargadoService);
  private readonly materialService = inject(MaterialService);

  protected readonly tickets = signal<TicketFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly ticketsFiltrados = computed(() =>
    this.tickets().filter((t) =>
      coincideTexto(
        this.busqueda(),
        t.id,
        t.nombreConductor,
        t.nombreVehiculo,
        t.nombreEncargado,
        t.nombreMaterial,
        t.descripcion,
      ),
    ),
  );

  protected readonly kgATon = kgATon;

  constructor() {
    this.cargarTickets();
  }

  protected eliminar(ticket: Ticket): void {
    const confirmado = confirm(`¿Eliminar el ticket #${ticket.id}? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.ticketService.remove(ticket.id).subscribe({
      next: () => this.tickets.update((lista) => lista.filter((t) => t.id !== ticket.id)),
      error: () => this.error.set('No se pudo eliminar el ticket.'),
    });
  }

  private cargarTickets(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      tickets: this.ticketService.list(),
      conductores: this.conductorService.listConLabel(),
      vehiculos: this.vehiculoService.listConLabel(),
      encargados: this.encargadoService.listConLabel(),
      materiales: this.materialService.listConLabel(),
    }).subscribe({
      next: ({ tickets, conductores, vehiculos, encargados, materiales }) => {
        const conductoresPorId = aMapa(conductores);
        const vehiculosPorId = aMapa(vehiculos);
        const encargadosPorId = aMapa(encargados);
        const materialesPorId = aMapa(materiales);

        this.tickets.set(
          tickets.results.map((t) => ({
            ...t,
            nombreConductor: conductoresPorId.get(t.conductor) ?? `Conductor #${t.conductor}`,
            nombreVehiculo: vehiculosPorId.get(t.vehiculo) ?? `Vehículo #${t.vehiculo}`,
            nombreEncargado: encargadosPorId.get(t.encargado) ?? `Encargado #${t.encargado}`,
            nombreMaterial: materialesPorId.get(t.material) ?? `Material #${t.material}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de tickets. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
