import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Vehiculo } from '@models/vehiculo';
import { VehiculoService } from '@services/vehiculo.service';

@Component({
  selector: 'app-vehiculo-list',
  imports: [RouterLink],
  templateUrl: './vehiculo-list.html',
  styleUrl: './vehiculo-list.css',
})
export class VehiculoList {
  private readonly vehiculoService = inject(VehiculoService);
  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor(){
    this.cargarVehiculos();
  }
  private cargarVehiculos(): void{
    this.cargando.set(true);
    this.error.set(null);
    this.vehiculoService.list().subscribe({
      next: (data) => {
        this.vehiculos.set(data.results);
        this.cargando.set(false);
      }
    })
  }

}
