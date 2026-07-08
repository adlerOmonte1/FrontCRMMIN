import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Conductor } from '@models/conductor';
import { ConductorService } from '@services/conductor.service';
import { EmpleadoService } from '@services/empleado.service';
import { coincideTexto } from '@shared/busqueda';

interface ConductorFila extends Conductor {
  nombreEmpleado: string;
}

@Component({
  selector: 'app-conductor-list',
  imports: [RouterLink],
  templateUrl: './conductor-list.html',
})
export class ConductorList {
  private readonly conductorService = inject(ConductorService);
  private readonly empleadoService = inject(EmpleadoService);

  protected readonly conductores = signal<ConductorFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly conductoresFiltrados = computed(() =>
    this.conductores().filter((c) => coincideTexto(this.busqueda(), c.nombreEmpleado, c.licencia, c.tipoLic)),
  );

  constructor() {
    this.cargarConductores();
  }

  protected eliminar(conductor: Conductor): void {
    const confirmado = confirm(
      `¿Eliminar al conductor con licencia ${conductor.licencia}? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) {
      return;
    }

    this.conductorService.remove(conductor.id).subscribe({
      next: () => this.conductores.update((lista) => lista.filter((c) => c.id !== conductor.id)),
      error: () => this.error.set('No se pudo eliminar el conductor.'),
    });
  }

  private cargarConductores(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      conductores: this.conductorService.list(),
      empleados: this.empleadoService.listAll(),
    }).subscribe({
      next: ({ conductores, empleados }) => {
        const nombrePorId = new Map(empleados.map((e) => [e.id, `${e.nombre} ${e.apellido}`]));
        this.conductores.set(
          conductores.results.map((c) => ({
            ...c,
            nombreEmpleado: nombrePorId.get(c.empleado) ?? `Empleado #${c.empleado}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de conductores. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
