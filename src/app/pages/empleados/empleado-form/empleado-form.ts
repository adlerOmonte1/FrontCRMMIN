import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { EmpleadoService } from '@services/empleado.service';

@Component({
  selector: 'app-empleado-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './empleado-form.html',
  styleUrl: './empleado-form.css',
})
export class EmpleadoForm {
  private readonly fb = inject(FormBuilder);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly router = inject(Router);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', [Validators.required, Validators.maxLength(8)]],
    edad: [18, [Validators.required, Validators.min(18)]],
    especialidad: ['', Validators.required],
  });

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.empleadoService.create(this.formulario.getRawValue()).subscribe({
      next: () => this.router.navigate(['/empleados']),
      error: () => {
        this.error.set('No se pudo guardar el empleado. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
