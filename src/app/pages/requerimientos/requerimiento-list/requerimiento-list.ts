import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Requerimiento } from '@models/requerimiento';
import { EncargadoService } from '@services/encargado.service';
import { RequerimientoService } from '@services/requerimiento.service';

interface RequerimientoFila extends Requerimiento {
  nombreEncargado: string;
}

@Component({
  selector: 'app-requerimiento-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './requerimiento-list.html',
})
export class RequerimientoList {
  private readonly requerimientoService = inject(RequerimientoService);
  private readonly encargadoService = inject(EncargadoService);

  protected readonly requerimientos = signal<RequerimientoFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarRequerimientos();
  }

  protected eliminar(requerimiento: Requerimiento): void {
    const confirmado = confirm(
      `¿Eliminar el requerimiento #${requerimiento.id}? También se eliminan sus detalles.`,
    );
    if (!confirmado) {
      return;
    }

    this.requerimientoService.remove(requerimiento.id).subscribe({
      next: () => this.requerimientos.update((lista) => lista.filter((r) => r.id !== requerimiento.id)),
      error: () => this.error.set('No se pudo eliminar el requerimiento.'),
    });
  }

  private cargarRequerimientos(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      requerimientos: this.requerimientoService.list(),
      encargados: this.encargadoService.listConLabel(),
    }).subscribe({
      next: ({ requerimientos, encargados }) => {
        const nombrePorId = new Map(encargados.map((e) => [e.id, e.label]));
        this.requerimientos.set(
          requerimientos.results.map((r) => ({
            ...r,
            nombreEncargado: nombrePorId.get(r.encargado) ?? `Encargado #${r.encargado}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de requerimientos. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
