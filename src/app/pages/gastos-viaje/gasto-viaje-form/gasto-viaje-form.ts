import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OpcionSelect } from '@models/opcion-select';
import { GastoViajeService } from '@services/gasto-viaje.service';
import { TicketService } from '@services/ticket.service';

@Component({
  selector: 'app-gasto-viaje-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './gasto-viaje-form.html',
})
export class GastoViajeForm {
  private readonly fb = inject(FormBuilder);
  private readonly gastoViajeService = inject(GastoViajeService);
  private readonly ticketService = inject(TicketService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoOpciones = signal(true);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly tickets = signal<OpcionSelect[]>([]);

  protected readonly formulario = this.fb.nonNullable.group({
    ticket: ['', Validators.required],
    descripcion: [''],
    consumo: ['0.00', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    monto: ['0.00', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  });

  constructor() {
    this.ticketService.listConLabel().subscribe({
      next: (opciones) => {
        this.tickets.set(opciones);
        this.cargandoOpciones.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de tickets para el selector.');
        this.cargandoOpciones.set(false);
      },
    });

    if (this.idEditando !== null) {
      this.gastoViajeService.getById(Number(this.idEditando)).subscribe({
        next: (gasto) => {
          this.formulario.patchValue({ ...gasto, ticket: String(gasto.ticket), descripcion: gasto.descripcion ?? '' });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el gasto de viaje a editar.');
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
      ticket: Number(valores.ticket),
      descripcion: valores.descripcion || null,
      consumo: valores.consumo,
      monto: valores.monto,
    };

    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idEditando
      ? this.gastoViajeService.update(Number(this.idEditando), payload)
      : this.gastoViajeService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/gastos-viaje']),
      error: () => {
        this.error.set('No se pudo guardar el gasto de viaje. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
