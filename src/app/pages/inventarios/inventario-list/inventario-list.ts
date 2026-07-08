import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Inventario } from '@models/inventario';
import { EncargadoService } from '@services/encargado.service';
import { InventarioService } from '@services/inventario.service';

interface InventarioFila extends Inventario {
  nombreEncargado: string;
}

@Component({
  selector: 'app-inventario-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './inventario-list.html',
})
export class InventarioList {
  private readonly inventarioService = inject(InventarioService);
  private readonly encargadoService = inject(EncargadoService);

  protected readonly inventarios = signal<InventarioFila[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarInventarios();
  }

  protected eliminar(inventario: Inventario): void {
    const confirmado = confirm(
      `¿Eliminar el inventario #${inventario.id} (${inventario.lugar})? También se eliminan sus detalles.`,
    );
    if (!confirmado) {
      return;
    }

    this.inventarioService.remove(inventario.id).subscribe({
      next: () => this.inventarios.update((lista) => lista.filter((i) => i.id !== inventario.id)),
      error: () => this.error.set('No se pudo eliminar el inventario.'),
    });
  }

  private cargarInventarios(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      inventarios: this.inventarioService.list(),
      encargados: this.encargadoService.listConLabel(),
    }).subscribe({
      next: ({ inventarios, encargados }) => {
        const nombrePorId = new Map(encargados.map((e) => [e.id, e.label]));
        this.inventarios.set(
          inventarios.results.map((i) => ({
            ...i,
            nombreEncargado: nombrePorId.get(i.encargado) ?? `Encargado #${i.encargado}`,
          })),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de inventarios. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
