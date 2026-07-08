import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Insumo } from '@models/insumo';
import { InsumoService } from '@services/insumo.service';

@Component({
  selector: 'app-insumo-list',
  imports: [RouterLink],
  templateUrl: './insumo-list.html',
})
export class InsumoList {
  private readonly insumoService = inject(InsumoService);

  protected readonly insumos = signal<Insumo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarInsumos();
  }

  protected eliminar(insumo: Insumo): void {
    const confirmado = confirm(`¿Eliminar el insumo ${insumo.nombre}? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.insumoService.remove(insumo.id).subscribe({
      next: () => this.insumos.update((lista) => lista.filter((i) => i.id !== insumo.id)),
      error: () => this.error.set('No se pudo eliminar el insumo.'),
    });
  }

  private cargarInsumos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.insumoService.list().subscribe({
      next: (data) => {
        this.insumos.set(data.results);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de insumos. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
