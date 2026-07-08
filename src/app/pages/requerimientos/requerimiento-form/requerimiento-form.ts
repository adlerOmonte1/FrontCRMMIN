import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ESTADOS_REQUERIMIENTO } from '@models/requerimiento';
import { OpcionSelect } from '@models/opcion-select';
import { EncargadoService } from '@services/encargado.service';
import { RequerimientoService } from '@services/requerimiento.service';

@Component({
  selector: 'app-requerimiento-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './requerimiento-form.html',
})
export class RequerimientoForm {
  private readonly fb = inject(FormBuilder);
  private readonly requerimientoService = inject(RequerimientoService);
  private readonly encargadoService = inject(EncargadoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoOpciones = signal(true);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly encargados = signal<OpcionSelect[]>([]);
  protected readonly estados = ESTADOS_REQUERIMIENTO;

  protected readonly formulario = this.fb.nonNullable.group({
    encargado: ['', Validators.required],
    estado: ['pendiente', Validators.required],
  });

  constructor() {
    this.encargadoService.listConLabel().subscribe({
      next: (opciones) => {
        this.encargados.set(opciones);
        this.cargandoOpciones.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de encargados para el selector.');
        this.cargandoOpciones.set(false);
      },
    });

    if (this.idEditando !== null) {
      this.requerimientoService.getById(Number(this.idEditando)).subscribe({
        next: (requerimiento) => {
          this.formulario.patchValue({ ...requerimiento, encargado: String(requerimiento.encargado) });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el requerimiento a editar.');
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
    const payload = { encargado: Number(valores.encargado), estado: valores.estado };
    this.guardando.set(true);
    this.error.set(null);

    if (this.idEditando) {
      this.requerimientoService.update(Number(this.idEditando), payload).subscribe({
        next: () => this.router.navigate(['/requerimientos']),
        error: () => {
          this.error.set('No se pudo guardar el requerimiento. Verifica los datos e intenta de nuevo.');
          this.guardando.set(false);
        },
      });
      return;
    }

    this.requerimientoService.create(payload).subscribe({
      next: (creado) =>
        this.router.navigate(['/detalles-requerimiento/nuevo'], { queryParams: { requerimiento: creado.id } }),
      error: () => {
        this.error.set('No se pudo guardar el requerimiento. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
