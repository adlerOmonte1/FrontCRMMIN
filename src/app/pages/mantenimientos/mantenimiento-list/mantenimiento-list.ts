import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Mantenimiento } from '@models/mantenimiento';
import { EncargadoService } from '@services/encargado.service';
import { MantenimientoService } from '@services/mantenimiento.service';
import { MaquinaService } from '@services/maquina.service';
import { VehiculoService } from '@services/vehiculo.service';
import { coincideTexto } from '@shared/busqueda';

interface MantenimientoFila extends Mantenimiento {
  nombreEncargado: string;
  etiquetaObjetivo: string;
}

@Component({
  selector: 'app-mantenimiento-list',
  imports: [RouterLink],
  templateUrl: './mantenimiento-list.html',
})
export class MantenimientoList {
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly encargadoService = inject(EncargadoService);
  private readonly maquinaService = inject(MaquinaService);
  private readonly vehiculoService = inject(VehiculoService);

  protected readonly mantenimientos = signal<MantenimientoFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly mantenimientosFiltrados = computed(() =>
    this.mantenimientos().filter((m) =>
      coincideTexto(this.busqueda(), m.nombreEncargado, m.etiquetaObjetivo, m.descripcion, m.fecha, m.costo),
    ),
  );

  constructor() {
    this.cargarMantenimientos();
  }

  protected eliminar(mantenimiento: Mantenimiento): void {
    const confirmado = confirm(`¿Eliminar este mantenimiento? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.mantenimientoService.remove(mantenimiento.id).subscribe({
      next: () => this.mantenimientos.update((lista) => lista.filter((m) => m.id !== mantenimiento.id)),
      error: () => this.error.set('No se pudo eliminar el mantenimiento.'),
    });
  }

  private cargarMantenimientos(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      mantenimientos: this.mantenimientoService.list(),
      encargados: this.encargadoService.listConLabel(),
      maquinas: this.maquinaService.listConLabel(),
      vehiculos: this.vehiculoService.listConLabel(),
    }).subscribe({
      next: ({ mantenimientos, encargados, maquinas, vehiculos }) => {
        const encargadoPorId = new Map(encargados.map((e) => [e.id, e.label]));
        const maquinaPorId = new Map(maquinas.map((m) => [m.id, m.label]));
        const vehiculoPorId = new Map(vehiculos.map((v) => [v.id, v.label]));

        this.mantenimientos.set(
          mantenimientos.results.map((m) => ({
            ...m,
            nombreEncargado: encargadoPorId.get(m.encargado) ?? `Encargado #${m.encargado}`,
            etiquetaObjetivo:
              m.maquina !== null
                ? (maquinaPorId.get(m.maquina) ?? `Máquina #${m.maquina}`)
                : m.volquete !== null
                  ? (vehiculoPorId.get(m.volquete) ?? `Vehículo #${m.volquete}`)
                  : 'Sin objetivo',
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de mantenimientos. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
