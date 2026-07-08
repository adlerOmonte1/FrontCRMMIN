import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { DetalleInventario } from '@models/detalle-inventario';
import { InventarioService } from '@services/inventario.service';
import { DetalleInventarioService } from '@services/detalle-inventario.service';
import { MaquinaService } from '@services/maquina.service';
import { InsumoService } from '@services/insumo.service';
import { coincideTexto } from '@shared/busqueda';

interface DetalleInventarioFila extends DetalleInventario {
  etiquetaItem: string;
}

@Component({
  selector: 'app-detalle-inventario-list',
  imports: [RouterLink],
  templateUrl: './detalle-inventario-list.html',
})
export class DetalleInventarioList {
  private readonly detalleService = inject(DetalleInventarioService);
  private readonly inventarioService = inject(InventarioService);
  private readonly maquinaService = inject(MaquinaService);
  private readonly insumoService = inject(InsumoService);
  private readonly route = inject(ActivatedRoute);

  protected readonly idInventario = Number(this.route.snapshot.paramMap.get('idInventario'));

  protected readonly etiquetaInventario = signal('');
  protected readonly detalles = signal<DetalleInventarioFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly detallesFiltrados = computed(() =>
    this.detalles().filter((d) =>
      coincideTexto(this.busqueda(), d.etiquetaItem, d.cantidad, d.ubicacion, d.descripcion, d.observacion, d.estado),
    ),
  );

  constructor() {
    this.inventarioService.getById(this.idInventario).subscribe({
      next: (inventario) => this.etiquetaInventario.set(`Inventario #${inventario.id} — ${inventario.lugar}`),
      error: () => this.etiquetaInventario.set(`Inventario #${this.idInventario}`),
    });

    this.cargarDetalles();
  }

  protected eliminar(detalle: DetalleInventario): void {
    const confirmado = confirm(`¿Eliminar este detalle de inventario? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.detalleService.remove(detalle.id).subscribe({
      next: () => this.detalles.update((lista) => lista.filter((d) => d.id !== detalle.id)),
      error: () => this.error.set('No se pudo eliminar el detalle.'),
    });
  }

  private cargarDetalles(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      detalles: this.detalleService.listAll(),
      maquinas: this.maquinaService.listConLabel(),
      insumos: this.insumoService.listConLabel(),
    }).subscribe({
      next: ({ detalles, maquinas, insumos }) => {
        const maquinaPorId = new Map(maquinas.map((m) => [m.id, m.label]));
        const insumoPorId = new Map(insumos.map((i) => [i.id, i.label]));

        this.detalles.set(
          detalles
            .filter((d) => d.inventario === this.idInventario)
            .map((d) => ({
              ...d,
              etiquetaItem:
                d.maquina !== null
                  ? (maquinaPorId.get(d.maquina) ?? `Máquina #${d.maquina}`)
                  : d.insumo !== null
                    ? (insumoPorId.get(d.insumo) ?? `Insumo #${d.insumo}`)
                    : 'Sin ítem asignado',
            })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de detalles de inventario. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
