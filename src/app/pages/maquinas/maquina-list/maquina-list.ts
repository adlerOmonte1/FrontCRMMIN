import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Maquina } from '@models/maquina';
import { MaquinaService } from '@services/maquina.service';

@Component({
  selector: 'app-maquina-list',
  imports: [RouterLink],
  templateUrl: './maquina-list.html',
})
export class MaquinaList {
  private readonly maquinaService = inject(MaquinaService);

  protected readonly maquinas = signal<Maquina[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarMaquinas();
  }

  protected eliminar(maquina: Maquina): void {
    const confirmado = confirm(`¿Eliminar la máquina ${maquina.nombre}? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.maquinaService.remove(maquina.id).subscribe({
      next: () => this.maquinas.update((lista) => lista.filter((m) => m.id !== maquina.id)),
      error: () => this.error.set('No se pudo eliminar la máquina.'),
    });
  }

  private cargarMaquinas(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.maquinaService.list().subscribe({
      next: (data) => {
        this.maquinas.set(data.results);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de máquinas. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
