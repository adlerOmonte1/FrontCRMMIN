import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { OpcionSelect } from '@models/opcion-select';
import { ConductorService } from '@services/conductor.service';
import { EncargadoService } from '@services/encargado.service';
import { MaterialService } from '@services/material.service';
import { TicketService } from '@services/ticket.service';
import { VehiculoService } from '@services/vehiculo.service';

@Component({
  selector: 'app-ticket-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form.html',
})
export class TicketForm {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly conductorService = inject(ConductorService);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly encargadoService = inject(EncargadoService);
  private readonly materialService = inject(MaterialService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoOpciones = signal(true);
  protected readonly cargandoRegistro = signal(this.editando);

  protected readonly conductores = signal<OpcionSelect[]>([]);
  protected readonly vehiculos = signal<OpcionSelect[]>([]);
  protected readonly encargados = signal<OpcionSelect[]>([]);
  protected readonly materiales = signal<OpcionSelect[]>([]);

  protected readonly formulario = this.fb.nonNullable.group({
    conductor: ['', Validators.required],
    vehiculo: ['', Validators.required],
    encargado: ['', Validators.required],
    material: ['', Validators.required],
    pesoBruto: ['0.00', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    descripcion: [''],
    observaciones: [''],
  });

  constructor() {
    forkJoin({
      conductores: this.conductorService.listConLabel(),
      vehiculos: this.vehiculoService.listConLabel(),
      encargados: this.encargadoService.listConLabel(),
      materiales: this.materialService.listConLabel(),
    }).subscribe({
      next: ({ conductores, vehiculos, encargados, materiales }) => {
        this.conductores.set(conductores);
        this.vehiculos.set(vehiculos);
        this.encargados.set(encargados);
        this.materiales.set(materiales);
        this.cargandoOpciones.set(false);
      },
      error: () => {
        this.error.set(
          'No se pudieron cargar los datos del formulario (conductores/vehículos/encargados/materiales).',
        );
        this.cargandoOpciones.set(false);
      },
    });

    if (this.idEditando !== null) {
      this.ticketService.getById(Number(this.idEditando)).subscribe({
        next: (ticket) => {
          this.formulario.patchValue({
            conductor: String(ticket.conductor),
            vehiculo: String(ticket.vehiculo),
            encargado: String(ticket.encargado),
            material: String(ticket.material),
            pesoBruto: ticket.pesoBruto,
            descripcion: ticket.descripcion ?? '',
            observaciones: ticket.observaciones ?? '',
          });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el ticket a editar.');
          this.cargandoRegistro.set(false);
        },
      });
    }
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const payload = {
      conductor: Number(valores.conductor),
      vehiculo: Number(valores.vehiculo),
      encargado: Number(valores.encargado),
      material: Number(valores.material),
      pesoBruto: valores.pesoBruto,
      descripcion: valores.descripcion || null,
      observaciones: valores.observaciones || null,
    };

    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idEditando
      ? this.ticketService.update(Number(this.idEditando), payload)
      : this.ticketService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/tickets']),
      error: () => {
        this.error.set('No se pudo guardar el ticket. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
