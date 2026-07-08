import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OpcionSelect } from '@models/opcion-select';
import { EncargadoService } from '@services/encargado.service';
import { EmpleadoService } from '@services/empleado.service';

@Component({
  selector: 'app-encargado-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './encargado-form.html',
})
export class EncargadoForm {
  private readonly fb = inject(FormBuilder);
  private readonly encargadoService = inject(EncargadoService);
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
    area: ['', Validators.required],
  });

  constructor() {
    this.empleadoService.listConLabel().subscribe({
      next: (opciones) => this.empleados.set(opciones),
      error: () => this.error.set('No se pudo cargar la lista de empleados para el selector.'),
    });

    if (this.idEditando !== null) {
      this.encargadoService.getById(Number(this.idEditando)).subscribe({
        next: (encargado) => {
          this.formulario.patchValue({ ...encargado, empleado: String(encargado.empleado) });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el encargado a editar.');
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
    const payload = { empleado: Number(valores.empleado), area: valores.area };
    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idEditando
      ? this.encargadoService.update(Number(this.idEditando), payload)
      : this.encargadoService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/encargados']),
      error: () => {
        this.error.set('No se pudo guardar el encargado. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
