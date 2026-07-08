import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OpcionSelect } from '@models/opcion-select';
import { EncargadoService } from '@services/encargado.service';
import { InventarioService } from '@services/inventario.service';

@Component({
  selector: 'app-inventario-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inventario-form.html',
})
export class InventarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly inventarioService = inject(InventarioService);
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

  protected readonly formulario = this.fb.nonNullable.group({
    encargado: ['', Validators.required],
    lugar: ['', Validators.required],
    descripcion: ['', Validators.required],
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
      this.inventarioService.getById(Number(this.idEditando)).subscribe({
        next: (inventario) => {
          this.formulario.patchValue({ ...inventario, encargado: String(inventario.encargado) });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el inventario a editar.');
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
    const payload = { encargado: Number(valores.encargado), lugar: valores.lugar, descripcion: valores.descripcion };
    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.idEditando
      ? this.inventarioService.update(Number(this.idEditando), payload)
      : this.inventarioService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/inventarios']),
      error: () => {
        this.error.set('No se pudo guardar el inventario. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
