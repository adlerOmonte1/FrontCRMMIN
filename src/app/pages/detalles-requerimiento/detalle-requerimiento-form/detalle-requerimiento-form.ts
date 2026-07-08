import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OpcionSelect } from '@models/opcion-select';
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

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoOpciones = signal(true);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly requerimientos = signal<OpcionSelect[]>([]);
  protected readonly tipos = TIPOS_DETALLE_REQUERIMIENTO;

  protected readonly formulario = this.fb.nonNullable.group({
    requerimiento: ['', Validators.required],
    nombre: ['', Validators.required],
    cantidad: ['', Validators.required],
    tipo: ['insumos' as TipoDetalleRequerimiento, Validators.required],
  });

  constructor() {
    this.requerimientoService.listConLabel().subscribe({
      next: (opciones) => {
        this.requerimientos.set(opciones);
        this.cargandoOpciones.set(false);

        // Si venimos de "Guardar y agregar ítems" en el alta de un
        // requerimiento, precarga esa cabecera (solo al crear, no al editar).
        if (!this.editando) {
          const idPreseleccionado = this.route.snapshot.queryParamMap.get('requerimiento');
          if (idPreseleccionado) {
            this.formulario.patchValue({ requerimiento: idPreseleccionado });
          }
        }
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de requerimientos para el selector.');
        this.cargandoOpciones.set(false);
      },
    });

    if (this.idEditando !== null) {
      this.detalleService.getById(Number(this.idEditando)).subscribe({
        next: (detalle) => {
          this.formulario.patchValue({ ...detalle, requerimiento: String(detalle.requerimiento) });
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
      requerimiento: Number(valores.requerimiento),
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
      next: () => this.router.navigate(['/detalles-requerimiento']),
      error: () => {
        this.error.set('No se pudo guardar el ítem. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
