import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Material } from '@models/material';
import { MaterialService } from '@services/material.service';

@Component({
  selector: 'app-material-list',
  imports: [RouterLink],
  templateUrl: './material-list.html',
})
export class MaterialList {
  private readonly materialService = inject(MaterialService);

  protected readonly materiales = signal<Material[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarMateriales();
  }

  protected eliminar(material: Material): void {
    const confirmado = confirm(`¿Eliminar el material ${material.nombre}? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.materialService.remove(material.id).subscribe({
      next: () => this.materiales.update((lista) => lista.filter((m) => m.id !== material.id)),
      error: () => this.error.set('No se pudo eliminar el material.'),
    });
  }

  private cargarMateriales(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.materialService.list().subscribe({
      next: (data) => {
        this.materiales.set(data.results);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de materiales. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
