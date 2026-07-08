import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TIPOS_DETALLE_REQUERIMIENTO, TipoDetalleRequerimiento } from '@models/detalle-requerimiento';
import { DetalleRequerimientoService } from '@services/detalle-requerimiento.service';
import { RequerimientoService } from '@services/requerimiento.service';

@Component({
  selector: 'app-detalle-requerimiento-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './detalle-requerimiento-form.html',
})
export class DetalleRequerimientoForm {
  private readonly fb = inject(FormBuilder);
  private readonly detalleService = inject(DetalleRequerimientoService);
  private readonly requerimientoService = inject(RequerimientoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly idRequerimiento = Number(this.route.snapshot.paramMap.get('idRequerimiento'));
  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly etiquetaRequerimiento = signal('');
  protected readonly tipos = TIPOS_DETALLE_REQUERIMIENTO;

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    cantidad: ['', Validators.required],
    tipo: ['insumos' as TipoDetalleRequerimiento, Validators.required],
  });

  constructor() {
    this.requerimientoService.getById(this.idRequerimiento).subscribe({
      next: (requerimiento) =>
        this.etiquetaRequerimiento.set(`Requerimiento #${requerimiento.id} — ${requerimiento.estado}`),
      error: () => this.etiquetaRequerimiento.set(`Requerimiento #${this.idRequerimiento}`),
    });

    if (this.idEditando !== null) {
      this.detalleService.getById(Number(this.idEditando)).subscribe({
        next: (detalle) => {
          this.formulario.patchValue({ nombre: detalle.nombre, cantidad: detalle.cantidad, tipo: detalle.tipo });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el ítem a editar.');
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
      requerimiento: this.idRequerimiento,
      nombre: valores.nombre,
      cantidad: valores.cantidad,
      tipo: valores.tipo,
    };

    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idEditando
      ? this.detalleService.update(Number(this.idEditando), payload)
      : this.detalleService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/requerimientos', this.idRequerimiento, 'items']),
      error: () => {
        this.error.set('No se pudo guardar el ítem. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
