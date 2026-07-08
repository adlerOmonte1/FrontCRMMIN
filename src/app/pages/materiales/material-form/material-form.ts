import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TIPOS_MATERIAL, TipoMaterial } from '@models/material';
import { MaterialService } from '@services/material.service';

@Component({
  selector: 'app-material-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './material-form.html',
})
export class MaterialForm {
  private readonly fb = inject(FormBuilder);
  private readonly materialService = inject(MaterialService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly error = signal<string | null>(null);
  protected readonly tipos = TIPOS_MATERIAL;

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    lugar: ['', Validators.required],
    tipo: ['sulfuro' as TipoMaterial, Validators.required],
  });

  constructor() {
    if (this.idEditando !== null) {
      this.materialService.getById(Number(this.idEditando)).subscribe({
        next: (material) => {
          this.formulario.patchValue(material);
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el material a editar.');
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
      ? this.materialService.update(Number(this.idEditando), valores)
      : this.materialService.create(valores);

    peticion.subscribe({
      next: () => this.router.navigate(['/materiales']),
      error: () => {
        this.error.set('No se pudo guardar el material. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
