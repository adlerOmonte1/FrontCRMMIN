import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { OpcionSelect } from '@models/opcion-select';
import { InventarioService } from '@services/inventario.service';
import { DetalleInventarioService } from '@services/detalle-inventario.service';
import { MaquinaService } from '@services/maquina.service';
import { InsumoService } from '@services/insumo.service';

type TipoItem = 'maquina' | 'insumo';

/** Convierte un ISO de la API a la forma "YYYY-MM-DDTHH:mm" que espera un <input type="datetime-local">. */
function aFechaLocal(iso: string): string {
  const fecha = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

@Component({
  selector: 'app-detalle-inventario-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './detalle-inventario-form.html',
})
export class DetalleInventarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly detalleService = inject(DetalleInventarioService);
  private readonly inventarioService = inject(InventarioService);
  private readonly maquinaService = inject(MaquinaService);
  private readonly insumoService = inject(InsumoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idEditando = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.idEditando !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cargandoOpciones = signal(true);
  protected readonly cargandoRegistro = signal(this.editando);

  protected readonly inventarios = signal<OpcionSelect[]>([]);
  protected readonly maquinas = signal<OpcionSelect[]>([]);
  protected readonly insumos = signal<OpcionSelect[]>([]);

  /** Controla qué select se muestra (máquina o insumo); refuerza en el
   *  cliente la regla "uno u otro" que el backend no valida. No vive en el
   *  FormGroup para que conmutar la vista sea instantáneo vía signal. */
  protected readonly tipoItem = signal<TipoItem>('maquina');

  protected readonly formulario = this.fb.nonNullable.group({
    inventario: ['', Validators.required],
    maquina: [''],
    insumo: [''],
    cantidad: ['', Validators.required],
    fecha_adquision: ['', Validators.required],
    fecha_fin: [''],
    ubicacion: ['', Validators.required],
    descripcion: ['', Validators.required],
    observacion: ['', Validators.required],
    estado: ['', Validators.required],
  });

  constructor() {
    forkJoin({
      inventarios: this.inventarioService.listConLabel(),
      maquinas: this.maquinaService.listConLabel(),
      insumos: this.insumoService.listConLabel(),
    }).subscribe({
      next: ({ inventarios, maquinas, insumos }) => {
        this.inventarios.set(inventarios);
        this.maquinas.set(maquinas);
        this.insumos.set(insumos);
        this.cargandoOpciones.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del formulario.');
        this.cargandoOpciones.set(false);
      },
    });

    if (this.idEditando !== null) {
      this.detalleService.getById(Number(this.idEditando)).subscribe({
        next: (detalle) => {
          this.tipoItem.set(detalle.maquina !== null ? 'maquina' : 'insumo');
          this.formulario.patchValue({
            inventario: String(detalle.inventario),
            maquina: detalle.maquina !== null ? String(detalle.maquina) : '',
            insumo: detalle.insumo !== null ? String(detalle.insumo) : '',
            cantidad: detalle.cantidad,
            fecha_adquision: aFechaLocal(detalle.fecha_adquision),
            fecha_fin: detalle.fecha_fin ? aFechaLocal(detalle.fecha_fin) : '',
            ubicacion: detalle.ubicacion,
            descripcion: detalle.descripcion,
            observacion: detalle.observacion,
            estado: detalle.estado,
          });
          this.cargandoRegistro.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el detalle a editar.');
          this.cargandoRegistro.set(false);
        },
      });
    }
  }

  protected seleccionarTipo(tipo: TipoItem): void {
    this.tipoItem.set(tipo);
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const esMaquina = this.tipoItem() === 'maquina';

    if (esMaquina && !valores.maquina) {
      this.error.set('Selecciona una máquina.');
      return;
    }
    if (!esMaquina && !valores.insumo) {
      this.error.set('Selecciona un insumo.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload = {
      inventario: Number(valores.inventario),
      maquina: esMaquina ? Number(valores.maquina) : null,
      insumo: esMaquina ? null : Number(valores.insumo),
      cantidad: valores.cantidad,
      fecha_adquision: new Date(valores.fecha_adquision).toISOString(),
      fecha_fin: valores.fecha_fin ? new Date(valores.fecha_fin).toISOString() : null,
      ubicacion: valores.ubicacion,
      descripcion: valores.descripcion,
      observacion: valores.observacion,
      estado: valores.estado,
    };

    const peticion = this.idEditando
      ? this.detalleService.update(Number(this.idEditando), payload)
      : this.detalleService.create(payload);

    peticion.subscribe({
      next: () => this.router.navigate(['/detalles-inventario']),
      error: () => {
        this.error.set('No se pudo guardar el detalle. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
