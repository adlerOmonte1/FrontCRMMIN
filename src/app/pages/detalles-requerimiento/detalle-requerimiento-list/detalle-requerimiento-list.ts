import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { DetalleRequerimiento } from '@models/detalle-requerimiento';
import { DetalleRequerimientoService } from '@services/detalle-requerimiento.service';
import { RequerimientoService } from '@services/requerimiento.service';

interface DetalleRequerimientoFila extends DetalleRequerimiento {
  etiquetaRequerimiento: string;
}

@Component({
  selector: 'app-detalle-requerimiento-list',
  imports: [RouterLink],
  templateUrl: './detalle-requerimiento-list.html',
})
export class DetalleRequerimientoList {
  private readonly detalleService = inject(DetalleRequerimientoService);
  private readonly requerimientoService = inject(RequerimientoService);

  protected readonly detalles = signal<DetalleRequerimientoFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarDetalles();
  }

  protected eliminar(detalle: DetalleRequerimiento): void {
    const confirmado = confirm(`¿Eliminar el ítem "${detalle.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.detalleService.remove(detalle.id).subscribe({
      next: () => this.detalles.update((lista) => lista.filter((d) => d.id !== detalle.id)),
      error: () => this.error.set('No se pudo eliminar el ítem.'),
    });
  }

  private cargarDetalles(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      detalles: this.detalleService.list(),
      requerimientos: this.requerimientoService.listConLabel(),
    }).subscribe({
      next: ({ detalles, requerimientos }) => {
        const etiquetaPorId = new Map(requerimientos.map((r) => [r.id, r.label]));
        this.detalles.set(
          detalles.results.map((d) => ({
            ...d,
            etiquetaRequerimiento: etiquetaPorId.get(d.requerimiento) ?? `Requerimiento #${d.requerimiento}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de ítems. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
