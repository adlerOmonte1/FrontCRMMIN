import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Empleado } from '@models/empleado';
import { EmpleadoService } from '@services/empleado.service';
import { coincideTexto } from '@shared/busqueda';

@Component({
  selector: 'app-empleado-list',
  imports: [RouterLink],
  templateUrl: './empleado-list.html',
})
export class EmpleadoList {
  private readonly empleadoService = inject(EmpleadoService);

  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly empleadosFiltrados = computed(() =>
    this.empleados().filter((e) =>
      coincideTexto(this.busqueda(), e.nombre, e.apellido, e.dni, e.edad, e.especialidad),
    ),
  );

  constructor() {
    this.cargarEmpleados();
  }

  protected eliminar(empleado: Empleado): void {
    const confirmado = confirm(
      `¿Eliminar a ${empleado.nombre} ${empleado.apellido}? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) {
      return;
    }

    this.empleadoService.remove(empleado.id).subscribe({
      next: () => this.empleados.update((lista) => lista.filter((e) => e.id !== empleado.id)),
      error: () => this.error.set('No se pudo eliminar el empleado.'),
    });
  }

  private cargarEmpleados(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.empleadoService.list().subscribe({
      next: (respuesta) => {
        this.empleados.set(respuesta.results);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de empleados. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
