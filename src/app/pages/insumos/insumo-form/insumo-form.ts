import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CATEGORIAS_INSUMO, CategoriaInsumo } from '@models/insumo';
import { InsumoService } from '@services/insumo.service';

@Component({
  selector: 'app-insumo-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './insumo-form.html',
})
export class InsumoForm {
  private readonly fb = inject(FormBuilder);
  private readonly insumoService = inject(InsumoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly error = signal<string | null>(null);
  protected readonly categorias = CATEGORIAS_INSUMO;

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    categoria: ['cocina' as CategoriaInsumo, Validators.required],
    medida: [''],
  });

  constructor() {
    if (this.idEditando !== null) {
      this.insumoService.getById(Number(this.idEditando)).subscribe({
        next: (insumo) => {
          this.formulario.patchValue({ ...insumo, medida: insumo.medida ?? '' });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el insumo a editar.');
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
    const payload = { ...valores, medida: valores.medida || null };
    const peticion = this.idEditando
      ? this.insumoService.update(Number(this.idEditando), payload)
      : this.insumoService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/insumos']),
      error: () => {
        this.error.set('No se pudo guardar el insumo. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
