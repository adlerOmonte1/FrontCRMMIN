import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EmpleadoService } from '@services/empleado.service';

@Component({
  selector: 'app-empleado-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './empleado-form.html',
})
export class EmpleadoForm {
  private readonly fb = inject(FormBuilder);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', [Validators.required, Validators.maxLength(8)]],
    edad: [18, [Validators.required, Validators.min(18)]],
    especialidad: ['', Validators.required],
  });

  constructor() {
    if (this.idEditando !== null) {
      this.empleadoService.getById(Number(this.idEditando)).subscribe({
        next: (empleado) => {
          this.formulario.patchValue(empleado);
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el empleado a editar.');
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
      ? this.empleadoService.update(Number(this.idEditando), valores)
      : this.empleadoService.create(valores);

    peticion.subscribe({
      next: () => this.router.navigate(['/empleados']),
      error: () => {
        this.error.set('No se pudo guardar el empleado. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
