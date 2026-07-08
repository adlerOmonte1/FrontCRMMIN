import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Vehiculo } from '@models/vehiculo';
import { VehiculoService } from '@services/vehiculo.service';

@Component({
  selector: 'app-vehiculo-list',
  imports: [RouterLink],
  templateUrl: './vehiculo-list.html',
})
export class VehiculoList {
  private readonly vehiculoService = inject(VehiculoService);
  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargarVehiculos();
  }

  protected eliminar(vehiculo: Vehiculo): void {
    const confirmado = confirm(`¿Eliminar el vehículo ${vehiculo.placa}? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.vehiculoService.remove(vehiculo.id).subscribe({
      next: () => this.vehiculos.update((lista) => lista.filter((v) => v.id !== vehiculo.id)),
      error: () => this.error.set('No se pudo eliminar el vehículo.'),
    });
  }

  private cargarVehiculos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.vehiculoService.list().subscribe({
      next: (data) => {
        this.vehiculos.set(data.results);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de vehículos. ¿Está corriendo el backend?');
        this.cargando.set(false);
      },
    });
  }
}
