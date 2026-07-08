import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DetalleRequerimiento } from '@models/detalle-requerimiento';
import { DetalleRequerimientoService } from '@services/detalle-requerimiento.service';
import { RequerimientoService } from '@services/requerimiento.service';
import { coincideTexto } from '@shared/busqueda';

@Component({
  selector: 'app-detalle-requerimiento-list',
  imports: [RouterLink],
  templateUrl: './detalle-requerimiento-list.html',
})
export class DetalleRequerimientoList {
  private readonly detalleService = inject(DetalleRequerimientoService);
  private readonly requerimientoService = inject(RequerimientoService);
  private readonly route = inject(ActivatedRoute);

  protected readonly idRequerimiento = Number(this.route.snapshot.paramMap.get('idRequerimiento'));

  protected readonly etiquetaRequerimiento = signal('');
  protected readonly detalles = signal<DetalleRequerimiento[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly detallesFiltrados = computed(() =>
    this.detalles().filter((d) => coincideTexto(this.busqueda(), d.nombre, d.cantidad, d.tipo)),
  );

  constructor() {
    this.requerimientoService.getById(this.idRequerimiento).subscribe({
      next: (requerimiento) =>
        this.etiquetaRequerimiento.set(`Requerimiento #${requerimiento.id} — ${requerimiento.estado}`),
      error: () => this.etiquetaRequerimiento.set(`Requerimiento #${this.idRequerimiento}`),
    });

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

    this.detalleService.listAll().subscribe({
      next: (detalles) => {
        this.detalles.set(detalles.filter((d) => d.requerimiento === this.idRequerimiento));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de ítems. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
