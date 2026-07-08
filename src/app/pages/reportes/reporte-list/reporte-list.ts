import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Reporte } from '@models/reporte';
import { EncargadoService } from '@services/encargado.service';
import { ReporteService } from '@services/reporte.service';

interface ReporteFila extends Reporte {
  nombreEncargado: string;
}

@Component({
  selector: 'app-reporte-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './reporte-list.html',
})
export class ReporteList {
  private readonly reporteService = inject(ReporteService);
  private readonly encargadoService = inject(EncargadoService);

  protected readonly reportes = signal<ReporteFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarReportes();
  }

  protected eliminar(reporte: Reporte): void {
    const confirmado = confirm(`¿Eliminar el reporte #${reporte.id}? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.reporteService.remove(reporte.id).subscribe({
      next: () => this.reportes.update((lista) => lista.filter((r) => r.id !== reporte.id)),
      error: () => this.error.set('No se pudo eliminar el reporte.'),
    });
  }

  private cargarReportes(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      reportes: this.reporteService.list(),
      encargados: this.encargadoService.listConLabel(),
    }).subscribe({
      next: ({ reportes, encargados }) => {
        const nombrePorId = new Map(encargados.map((e) => [e.id, e.label]));
        this.reportes.set(
          reportes.results.map((r) => ({
            ...r,
            nombreEncargado: nombrePorId.get(r.encargado) ?? `Encargado #${r.encargado}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de reportes. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
