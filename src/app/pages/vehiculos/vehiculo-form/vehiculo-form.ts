import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { VehiculoService } from '@services/vehiculo.service';
import { kgATon } from '@shared/peso';

@Component({
  selector: 'app-vehiculo-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './vehiculo-form.html',
})
export class VehiculoForm {
  private readonly fb = inject(FormBuilder);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    placa: ['', [Validators.required, Validators.maxLength(10)]],
    marca: ['', [Validators.required, Validators.maxLength(8)]],
    color: ['', Validators.required],
    modelo: ['', Validators.required],
    tara: ['0.00', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  });

  /** Se recalcula en vivo mientras el usuario escribe la tara — es solo de presentación, no se envía al backend. */
  private readonly taraActual = toSignal(this.formulario.controls.tara.valueChanges, {
    initialValue: this.formulario.controls.tara.value,
  });
  protected readonly taraToneladas = computed(() => kgATon(this.taraActual()));

  constructor() {
    if (this.idEditando !== null) {
      this.vehiculoService.getById(Number(this.idEditando)).subscribe({
        next: (vehiculo) => {
          this.formulario.patchValue(vehiculo);
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el vehículo a editar.');
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

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.formulario.getRawValue();
    const peticion = this.idEditando
      ? this.vehiculoService.update(Number(this.idEditando), valores)
      : this.vehiculoService.create(valores);

    peticion.subscribe({
      next: () => this.router.navigate(['/vehiculos']),
      error: () => {
        this.error.set('No se pudo guardar el vehículo. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
