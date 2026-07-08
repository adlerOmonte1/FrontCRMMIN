import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { OpcionSelect } from '@models/opcion-select';
import { EncargadoService } from '@services/encargado.service';
import { MantenimientoService } from '@services/mantenimiento.service';
import { MaquinaService } from '@services/maquina.service';
import { VehiculoService } from '@services/vehiculo.service';

type TipoObjetivo = 'maquina' | 'volquete';

@Component({
  selector: 'app-mantenimiento-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mantenimiento-form.html',
})
export class MantenimientoForm {
  private readonly fb = inject(FormBuilder);
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly encargadoService = inject(EncargadoService);
  private readonly maquinaService = inject(MaquinaService);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoOpciones = signal(true);
  protected readonly cargandoRegistro = signal(this.editando);

  protected readonly encargados = signal<OpcionSelect[]>([]);
  protected readonly maquinas = signal<OpcionSelect[]>([]);
  protected readonly vehiculos = signal<OpcionSelect[]>([]);

  /** Igual que en DetalleInventarioForm: fuera del FormGroup para que
   *  conmutar máquina/volquete sea instantáneo vía signal. */
  protected readonly tipoObjetivo = signal<TipoObjetivo>('maquina');

  protected readonly formulario = this.fb.nonNullable.group({
    encargado: ['', Validators.required],
    maquina: [''],
    volquete: [''],
    fecha: ['', Validators.required],
    descripcion: [''],
    costo: [''],
  });

  constructor() {
    forkJoin({
      encargados: this.encargadoService.listConLabel(),
      maquinas: this.maquinaService.listConLabel(),
      vehiculos: this.vehiculoService.listConLabel(),
    }).subscribe({
      next: ({ encargados, maquinas, vehiculos }) => {
        this.encargados.set(encargados);
        this.maquinas.set(maquinas);
        this.vehiculos.set(vehiculos);
        this.cargandoOpciones.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del formulario.');
        this.cargandoOpciones.set(false);
      },
    });

    if (this.idEditando !== null) {
      this.mantenimientoService.getById(Number(this.idEditando)).subscribe({
        next: (mantenimiento) => {
          this.tipoObjetivo.set(mantenimiento.maquina !== null ? 'maquina' : 'volquete');
          this.formulario.patchValue({
            encargado: String(mantenimiento.encargado),
            maquina: mantenimiento.maquina !== null ? String(mantenimiento.maquina) : '',
            volquete: mantenimiento.volquete !== null ? String(mantenimiento.volquete) : '',
            fecha: mantenimiento.fecha,
            descripcion: mantenimiento.descripcion,
            costo: mantenimiento.costo ?? '',
          });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el mantenimiento a editar.');
          this.cargandoRegistro.set(false);
        },
      });
    }
  }

  protected seleccionarTipo(tipo: TipoObjetivo): void {
    this.tipoObjetivo.set(tipo);
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const esMaquina = this.tipoObjetivo() === 'maquina';

    if (esMaquina && !valores.maquina) {
      this.error.set('Selecciona una máquina.');
      return;
    }
    if (!esMaquina && !valores.volquete) {
      this.error.set('Selecciona un vehículo (volquete).');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    // Se manda siempre (nunca se omite la clave): en una edición, omitirla
    // haría que el backend reescriba la descripción existente con su valor
    // por defecto ("Sin descripción") en cada guardado sin cambios reales.
    const payload = {
      encargado: Number(valores.encargado),
      maquina: esMaquina ? Number(valores.maquina) : null,
      volquete: esMaquina ? null : Number(valores.volquete),
      fecha: valores.fecha,
      costo: valores.costo || null,
      descripcion: valores.descripcion || 'Sin descripción',
    };

    const peticion = this.idEditando
      ? this.mantenimientoService.update(Number(this.idEditando), payload)
      : this.mantenimientoService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/mantenimientos']),
      error: () => {
        this.error.set('No se pudo guardar el mantenimiento. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
