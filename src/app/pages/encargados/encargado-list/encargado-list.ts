import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Encargado } from '@models/encargado';
import { EncargadoService } from '@services/encargado.service';
import { EmpleadoService } from '@services/empleado.service';

interface EncargadoFila extends Encargado {
  nombreEmpleado: string;
}

@Component({
  selector: 'app-encargado-list',
  imports: [RouterLink],
  templateUrl: './encargado-list.html',
})
export class EncargadoList {
  private readonly encargadoService = inject(EncargadoService);
  private readonly empleadoService = inject(EmpleadoService);

  protected readonly encargados = signal<EncargadoFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarEncargados();
  }

  protected eliminar(encargado: Encargado): void {
    const confirmado = confirm(`¿Eliminar este encargado de ${encargado.area}? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.encargadoService.remove(encargado.id).subscribe({
      next: () => this.encargados.update((lista) => lista.filter((e) => e.id !== encargado.id)),
      error: () => this.error.set('No se pudo eliminar el encargado.'),
    });
  }

  private cargarEncargados(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      encargados: this.encargadoService.list(),
      empleados: this.empleadoService.listAll(),
    }).subscribe({
      next: ({ encargados, empleados }) => {
        const nombrePorId = new Map(empleados.map((e) => [e.id, `${e.nombre} ${e.apellido}`]));
        this.encargados.set(
          encargados.results.map((enc) => ({
            ...enc,
            nombreEmpleado: nombrePorId.get(enc.empleado) ?? `Empleado #${enc.empleado}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de encargados. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
