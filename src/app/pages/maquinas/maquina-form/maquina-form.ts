import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MAQUINA_SIN_ESPECIFICAR } from '@models/maquina';
import { MaquinaService } from '@services/maquina.service';

@Component({
  selector: 'app-maquina-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './maquina-form.html',
})
export class MaquinaForm {
  private readonly fb = inject(FormBuilder);
  private readonly maquinaService = inject(MaquinaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly cargandoRegistro = signal(this.editando);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    marca: [''],
    nro_serie: [''],
  });

  constructor() {
    if (this.idEditando !== null) {
      this.maquinaService.getById(Number(this.idEditando)).subscribe({
        next: (maquina) => {
          this.formulario.patchValue({
            nombre: maquina.nombre,
            marca: maquina.marca === MAQUINA_SIN_ESPECIFICAR ? '' : maquina.marca,
            nro_serie: maquina.nro_serie === MAQUINA_SIN_ESPECIFICAR ? '' : maquina.nro_serie,
          });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la máquina a editar.');
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
    const payload = {
      nombre: valores.nombre,
      marca: valores.marca || MAQUINA_SIN_ESPECIFICAR,
      nro_serie: valores.nro_serie || MAQUINA_SIN_ESPECIFICAR,
    };
    const peticion = this.idEditando
      ? this.maquinaService.update(Number(this.idEditando), payload)
      : this.maquinaService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/maquinas']),
      error: () => {
        this.error.set('No se pudo guardar la máquina. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
