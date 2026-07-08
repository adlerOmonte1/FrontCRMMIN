import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OpcionSelect } from '@models/opcion-select';
import { ConductorService } from '@services/conductor.service';
import { EmpleadoService } from '@services/empleado.service';

@Component({
  selector: 'app-conductor-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './conductor-form.html',
})
export class ConductorForm {
  private readonly fb = inject(FormBuilder);
  private readonly conductorService = inject(ConductorService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly error = signal<string | null>(null);
  protected readonly empleados = signal<OpcionSelect[]>([]);

  protected readonly formulario = this.fb.nonNullable.group({
    empleado: ['', Validators.required],
    licencia: ['', [Validators.required, Validators.maxLength(9)]],
    tipoLic: ['', Validators.required],
  });

  constructor() {
    this.empleadoService.listConLabel().subscribe({
      next: (opciones) => this.empleados.set(opciones),
      error: () => this.error.set('No se pudo cargar la lista de empleados para el selector.'),
    });

    if (this.idEditando !== null) {
      this.conductorService.getById(Number(this.idEditando)).subscribe({
        next: (conductor) => {
          this.formulario.patchValue({ ...conductor, empleado: String(conductor.empleado) });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el conductor a editar.');
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
    const payload = { empleado: Number(valores.empleado), licencia: valores.licencia, tipoLic: valores.tipoLic };
    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idEditando
      ? this.conductorService.update(Number(this.idEditando), payload)
      : this.conductorService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/conductores']),
      error: () => {
        this.error.set('No se pudo guardar el conductor. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
