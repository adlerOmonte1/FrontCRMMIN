import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ESTADO_ATENDIDO, Requerimiento } from '@models/requerimiento';
import { EncargadoService } from '@services/encargado.service';
import { RequerimientoService } from '@services/requerimiento.service';
import { coincideTexto } from '@shared/busqueda';
import { claseBadgeEstado } from '@shared/estado-badge';

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
  protected readonly busqueda = signal('');
  protected readonly ESTADO_ATENDIDO = ESTADO_ATENDIDO;
  protected readonly claseBadgeEstado = claseBadgeEstado;

  protected readonly requerimientosFiltrados = computed(() =>
    this.requerimientos().filter((r) => coincideTexto(this.busqueda(), r.nombreEncargado, r.estado)),
  );

  constructor() {
    this.cargarRequerimientos();
  }

  protected marcarComoAtendido(requerimiento: Requerimiento): void {
    this.requerimientoService.marcarComoAtendido(requerimiento.id).subscribe({
      next: (actualizado) =>
        this.requerimientos.update((lista) =>
          lista.map((r) => (r.id === requerimiento.id ? { ...r, estado: actualizado.estado } : r)),
        ),
      error: () => this.error.set('No se pudo marcar el requerimiento como atendido.'),
    });
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
